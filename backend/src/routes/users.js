import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { extractBearerToken, getUserIdFromToken, getRoleFromToken } from '../services/jwt.js';
import { stripPassword, toPage, parsePageParams, parseBoolean, isLeader } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, size, skip, take } = parsePageParams(req.query);
    const search = req.query.search || '';
    const approved = parseBoolean(req.query.approved);

    const where = {
      AND: [
        search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        approved === undefined ? {} : { approved },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { fullName: 'asc' } }),
      prisma.user.count({ where }),
    ]);

    res.json(toPage(users.map(stripPassword), total, page, size));
  })
);

router.post(
  '/:userId/2fa',
  asyncHandler(async (req, res) => {
    const enable = parseBoolean(req.query.enable);
    await prisma.user.update({
      where: { id: req.params.userId },
      data: { twoFactorEnabled: !!enable },
    });
    res.status(200).end();
  })
);

router.patch(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new Error('User not found');

    await prisma.user.update({
      where: { id: user.id },
      data: { approved: true },
    });

    const existingMember = await prisma.member.findUnique({ where: { userId: user.id } });
    if (!existingMember) {
      await prisma.member.create({
        data: {
          userId: user.id,
          membershipStatus: 'Active',
          phoneNumber: user.phone,
        },
      });
    }

    res.status(200).end();
  })
);

router.patch(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new Error('User not found');
    await prisma.user.delete({ where: { id: user.id } });
    res.status(200).end();
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const userId = getUserIdFromToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    res.json(stripPassword(user));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const tokenId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);
    const userId = req.params.id;

    if (tokenId !== userId && !isLeader(role)) {
      throw new Error('Unauthorized');
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new Error('User not found');

    const { fullName, username, phone, email, password, profileImage } = req.body;
    const data = {};

    if (fullName != null) data.fullName = fullName;
    if (username != null) data.username = username;
    if (phone != null) data.phone = phone;
    if (profileImage != null) data.profileImage = profileImage;
    if (email != null) {
      const other = await prisma.user.findUnique({ where: { email } });
      if (other && other.id !== userId) throw new Error('Email already in use');
      data.email = email;
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    res.json(stripPassword(updated));
  })
);

export default router;
