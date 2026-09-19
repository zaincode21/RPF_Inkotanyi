import { Router } from 'express';
import prisma from '../config/db.js';
import { extractBearerToken, getRoleFromToken } from '../services/jwt.js';
import { toPage, parsePageParams, isLeader } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function serializeEvent(event) {
  if (!event) return event;
  return {
    ...event,
    eventDate: event.eventDate instanceof Date
      ? event.eventDate.toISOString().slice(0, 10)
      : event.eventDate,
  };
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can create events');
    }

    const event = await prisma.event.create({
      data: {
        eventName: req.body.eventName,
        eventDate: new Date(req.body.eventDate),
        location: req.body.location,
        description: req.body.description || null,
        coverImage: req.body.coverImage || null,
        time: req.body.time || null,
      },
    });

    res.status(201).json(serializeEvent(event));
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, size, skip, take } = parsePageParams(req.query);
    const search = req.query.search || '';

    const where = search
      ? {
          OR: [
            { eventName: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({ where, skip, take, orderBy: { eventDate: 'desc' } }),
      prisma.event.count({ where }),
    ]);

    res.json(toPage(events.map(serializeEvent), total, page, size));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new Error('Event not found');
    res.json(serializeEvent(event));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can update events');
    }

    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new Error('Event not found');

    const data = {};
    if (req.body.eventName != null) data.eventName = req.body.eventName;
    if (req.body.eventDate != null) data.eventDate = new Date(req.body.eventDate);
    if (req.body.location != null) data.location = req.body.location;
    if (req.body.description != null) data.description = req.body.description;
    if (req.body.coverImage != null) data.coverImage = req.body.coverImage;
    if (req.body.time != null) data.time = req.body.time;

    const updated = await prisma.event.update({ where: { id: existing.id }, data });
    res.json(serializeEvent(updated));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can delete events');
    }
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default router;
