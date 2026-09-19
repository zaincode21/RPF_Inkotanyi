import { Router } from 'express';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const news = await prisma.news.findMany({ orderBy: { publishDate: 'desc' } });
    res.json(news);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!item) throw new Error('News not found');
    res.json(item);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const item = await prisma.news.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author || null,
        type: req.body.type || null,
        coverImage: req.body.coverImage || null,
        publishDate: req.body.publishDate ? new Date(req.body.publishDate) : undefined,
      },
    });
    res.json(item);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new Error('News not found');

    const data = {};
    if (req.body.title != null) data.title = req.body.title;
    if (req.body.content != null) data.content = req.body.content;
    if (req.body.author != null) data.author = req.body.author;
    if (req.body.type != null) data.type = req.body.type;
    if (req.body.coverImage != null) data.coverImage = req.body.coverImage;

    const updated = await prisma.news.update({ where: { id: existing.id }, data });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.status(200).end();
  })
);

export default router;
