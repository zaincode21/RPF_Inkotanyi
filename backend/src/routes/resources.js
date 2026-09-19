import { Router } from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const resources = await prisma.resource.findMany();
    res.json(resources);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const resource = await prisma.resource.create({
      data: {
        title: req.body.title,
        description: req.body.description || null,
        fileUrl: req.body.fileUrl,
        category: req.body.category || null,
      },
    });
    res.json(resource);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new Error('Resource not found');

    const data = {};
    if (req.body.title != null) data.title = req.body.title;
    if (req.body.description != null) data.description = req.body.description;
    if (req.body.fileUrl != null) data.fileUrl = req.body.fileUrl;
    if (req.body.category != null) data.category = req.body.category;

    const updated = await prisma.resource.update({ where: { id: existing.id }, data });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.status(200).end();
  })
);

export default router;
