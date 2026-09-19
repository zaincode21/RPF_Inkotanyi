import { Router } from 'express';
import prisma from '../config/db.js';
import { extractBearerToken, getUserIdFromToken, getRoleFromToken } from '../services/jwt.js';
import { stripPassword, toPage, parsePageParams, isLeader } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function serializeMember(member) {
  if (!member) return member;
  return {
    ...member,
    user: member.user ? stripPassword(member.user) : member.user,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, size, skip, take } = parsePageParams(req.query);
    const search = req.query.search || '';

    const where = search
      ? {
          OR: [
            { address: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
            { membershipStatus: { contains: search, mode: 'insensitive' } },
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take,
        include: { user: true },
        orderBy: { membershipStatus: 'asc' },
      }),
      prisma.member.count({ where }),
    ]);

    res.json(toPage(members.map(serializeMember), total, page, size));
  })
);

router.post(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const role = getRoleFromToken(token);
    if (!isLeader(role)) throw new Error('Only LEADER can create member profiles');

    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { member: true },
    });
    if (!user) throw new Error('User not found');
    if (user.member) throw new Error('Member profile already exists');

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        address: req.body.address || null,
        phoneNumber: req.body.phoneNumber || user.phone || null,
        membershipStatus: req.body.membershipStatus || 'Active',
      },
      include: { user: true },
    });

    res.status(201).json(serializeMember(member));
  })
);

router.put(
  '/:memberId',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const tokenId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);

    const existing = await prisma.member.findUnique({
      where: { id: req.params.memberId },
      include: { user: true },
    });
    if (!existing) throw new Error('Member not found');

    if (existing.userId !== tokenId && !isLeader(role)) {
      throw new Error('Unauthorized');
    }

    const data = {};
    if (req.body.address != null) data.address = req.body.address;
    if (req.body.phoneNumber != null) data.phoneNumber = req.body.phoneNumber;
    if (req.body.membershipStatus != null) data.membershipStatus = req.body.membershipStatus;

    const updated = await prisma.member.update({
      where: { id: existing.id },
      data,
      include: { user: true },
    });

    res.json(serializeMember(updated));
  })
);

export default router;
