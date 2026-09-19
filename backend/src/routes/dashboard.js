import { Router } from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [totalUsers, totalMembers, totalEvents, totalLocations] = await Promise.all([
      prisma.user.count(),
      prisma.member.count(),
      prisma.event.count(),
      prisma.location.count(),
    ]);

    res.json({ totalUsers, totalMembers, totalEvents, totalLocations });
  })
);

export default router;
