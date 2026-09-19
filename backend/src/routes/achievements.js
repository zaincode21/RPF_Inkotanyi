import { Router } from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const achievements = await prisma.achievement.findMany();
    res.json(achievements);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const achievement = await prisma.achievement.create({
      data: {
        title: req.body.title,
        category: req.body.category,
        currentProgress: Number(req.body.currentProgress),
        targetValue: Number(req.body.targetValue),
        unit: req.body.unit,
        description: req.body.description || null,
        yearLabel: req.body.yearLabel || null,
      },
    });
    res.json(achievement);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.achievement.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new Error('Achievement not found');

    const updated = await prisma.achievement.update({
      where: { id: existing.id },
      data: {
        title: req.body.title,
        category: req.body.category,
        currentProgress: Number(req.body.currentProgress),
        targetValue: Number(req.body.targetValue),
        unit: req.body.unit,
        description: req.body.description,
        yearLabel: req.body.yearLabel,
      },
    });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.achievement.delete({ where: { id: req.params.id } });
    res.status(200).end();
  })
);

export default router;
