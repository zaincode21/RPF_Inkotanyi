import { Router } from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    let parentId = null;
    if (req.body.parent?.id) {
      const parent = await prisma.location.findUnique({ where: { id: req.body.parent.id } });
      if (!parent) throw new Error('Parent location not found');
      parentId = parent.id;
    } else if (req.body.parentId) {
      parentId = req.body.parentId;
    }

    const location = await prisma.location.create({
      data: {
        code: req.body.code || null,
        name: req.body.name,
        level: req.body.level || null,
        parentId,
      },
    });

    res.status(201).json(location);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const locations = await prisma.location.findMany();
    res.json(locations);
  })
);

router.get(
  '/code/:code',
  asyncHandler(async (req, res) => {
    const location = await prisma.location.findUnique({ where: { code: req.params.code } });
    if (!location) throw new Error(`Location not found with code: ${req.params.code}`);
    res.json(location);
  })
);

router.get(
  '/users/:userId/hierarchy',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { location: true },
    });
    if (!user) throw new Error('User not found');
    if (!user.location) throw new Error('User has no location');

    const hierarchy = {};
    let current = user.location;

    while (current) {
      const key = current.level ? current.level.toLowerCase() : `level_${current.name}`;
      hierarchy[key] = {
        id: current.id,
        code: current.code,
        name: current.name,
        level: current.level,
      };

      if (!current.parentId) break;
      current = await prisma.location.findUnique({ where: { id: current.parentId } });
    }

    res.json(hierarchy);
  })
);

router.get(
  '/users/:userId/summary',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { location: true },
    });
    if (!user) throw new Error('User not found');

    if (!user.location) {
      return res.type('text/plain').send(`${user.fullName} has no location assigned`);
    }

    const parts = [];
    let current = user.location;
    while (current) {
      let part = current.name;
      if (current.level) part += ` ${current.level}`;
      parts.push(part);
      if (!current.parentId) break;
      current = await prisma.location.findUnique({ where: { id: current.parentId } });
    }

    res.type('text/plain').send(`${user.fullName} lives in ${parts.join(', ')}`);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const location = await prisma.location.findUnique({ where: { id: req.params.id } });
    if (!location) throw new Error(`Location not found with id: ${req.params.id}`);
    res.json(location);
  })
);

export default router;
