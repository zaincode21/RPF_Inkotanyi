import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import prisma from '../config/db.js';
import { generateToken } from '../services/jwt.js';
import { sendPasswordResetEmail, send2FACode } from '../services/email.js';
import { stripPassword } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

async function send2FAForUser(user) {
  const code = String(Math.floor(Math.random() * 900000) + 100000);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorCode: code,
      twoFactorExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  await send2FACode(updated.email, code);
  return updated;
}

function verify2FACode(user, code) {
  if (!user.twoFactorCode || !user.twoFactorExpiry) return false;
  if (new Date() > new Date(user.twoFactorExpiry)) return false;
  return user.twoFactorCode === code;
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, fullName, username, phone, role, location, profileImage } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');

    let locationId = null;
    if (location?.code) {
      const loc = await prisma.location.findUnique({ where: { code: location.code } });
      if (!loc) throw new Error(`Location not found with code: ${location.code}`);
      locationId = loc.id;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        username: username || null,
        phone: phone || null,
        role: role || 'Member',
        approved: false,
        twoFactorEnabled: false,
        profileImage: profileImage || null,
        locationId,
      },
    });

    res.status(201).json(stripPassword(user));
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.approved) {
      throw new Error('Account pending approval. Please contact your leader.');
    }

    // 2FA disabled on login (preserved for verify/resend endpoints)
    const token = generateToken(user);
    res.json({ token, user: stripPassword(user) });
  })
);

router.post(
  '/verify-2fa',
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    if (!verify2FACode(user, code)) {
      throw new Error('Invalid or expired 2FA code');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpiry: null },
    });

    const token = generateToken(updated);
    res.json({ token, user: stripPassword(updated) });
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, token);
    res.status(200).end();
  })
);

router.post(
  '/resend-2fa',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    await send2FAForUser(user);
    res.status(200).end();
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!resetToken) throw new Error('Invalid token');
    if (new Date() > new Date(resetToken.expiryDate)) throw new Error('Token expired');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    });
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    res.status(200).end();
  })
);

export default router;
