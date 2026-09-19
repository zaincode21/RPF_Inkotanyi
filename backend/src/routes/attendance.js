import { Router } from 'express';
import prisma from '../config/db.js';
import { extractBearerToken, getUserIdFromToken, getRoleFromToken } from '../services/jwt.js';
import { stripPassword, isLeader } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

function serializeAttendance(att) {
  if (!att) return att;
  return {
    id: att.id,
    present: att.present,
    member: att.member
      ? {
          ...att.member,
          user: att.member.user ? stripPassword(att.member.user) : undefined,
        }
      : undefined,
    event: att.event
      ? {
          ...att.event,
          eventDate:
            att.event.eventDate instanceof Date
              ? att.event.eventDate.toISOString().slice(0, 10)
              : att.event.eventDate,
        }
      : undefined,
  };
}

const includeAll = {
  member: { include: { user: true } },
  event: true,
};

async function ensureMemberForUser(user) {
  const existing = await prisma.member.findUnique({ where: { userId: user.id } });
  if (existing) return existing;
  return prisma.member.create({
    data: {
      userId: user.id,
      membershipStatus: 'Active',
      phoneNumber: user.phone,
    },
  });
}

/** Attendance is allowed on the event calendar day and any day after. */
function assertAttendanceWindow(event) {
  if (!event?.eventDate) throw new Error('Event date is missing');
  const eventDay = new Date(event.eventDate);
  eventDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDay > today) {
    throw new Error(
      'Attendance can only be taken on or after the event date'
    );
  }
}

router.post(
  '/rsvp',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const userId = getUserIdFromToken(token);
    const { eventId, status } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const member = await ensureMemberForUser(user);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');

    const going =
      String(status || '').toLowerCase() === 'going' ||
      String(status || '') === 'Going';

    // RSVP is stored as an attendance row. Leader marks (present true/false) are
    // applied later via /mark or /save and can always be edited — including past events.
    if (!going) {
      const existing = await prisma.attendance.findUnique({
        where: { memberId_eventId: { memberId: member.id, eventId } },
      });
      // Only remove RSVP if never officially marked present by a leader
      if (existing && existing.present === false) {
        await prisma.attendance.delete({ where: { id: existing.id } });
        return res.json({ id: existing.id, present: false, cancelled: true });
      }
      if (existing) {
        return res.json(serializeAttendance(
          await prisma.attendance.findUnique({ where: { id: existing.id }, include: includeAll })
        ));
      }
      return res.json({ cancelled: true });
    }

    const att = await prisma.attendance.upsert({
      where: {
        memberId_eventId: { memberId: member.id, eventId },
      },
      create: { memberId: member.id, eventId, present: false },
      update: {}, // keep existing present/absent mark
      include: includeAll,
    });

    res.json(serializeAttendance(att));
  })
);

router.post(
  '/member/:memberId/event/:eventId',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const tokenId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);
    const { memberId, eventId } = req.params;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!member) throw new Error('Member not found');

    if (member.userId !== tokenId && !isLeader(role)) {
      throw new Error('You can only register yourself');
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');

    const exists = await prisma.attendance.findUnique({
      where: { memberId_eventId: { memberId, eventId } },
    });
    if (exists) throw new Error('Already registered');

    const att = await prisma.attendance.create({
      data: { memberId, eventId, present: false },
      include: includeAll,
    });

    res.status(201).json(serializeAttendance(att));
  })
);

router.patch(
  '/:attendanceId/present',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can mark attendance');
    }
    const att = await prisma.attendance.findUnique({ where: { id: req.params.attendanceId } });
    if (!att) throw new Error('Attendance record not found');
    const event = await prisma.event.findUnique({ where: { id: att.eventId } });
    assertAttendanceWindow(event);
    await prisma.attendance.update({
      where: { id: att.id },
      data: { present: true },
    });
    res.status(200).end();
  })
);

router.patch(
  '/:attendanceId/absent',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can mark attendance');
    }
    const att = await prisma.attendance.findUnique({ where: { id: req.params.attendanceId } });
    if (!att) throw new Error('Attendance record not found');
    const event = await prisma.event.findUnique({ where: { id: att.eventId } });
    assertAttendanceWindow(event);
    await prisma.attendance.update({
      where: { id: att.id },
      data: { present: false },
    });
    res.status(200).end();
  })
);

router.post(
  '/mark',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can mark attendance for others');
    }

    const { eventId, userId, present } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User not found: ${userId}`);

    const member = await ensureMemberForUser(user);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');
    assertAttendanceWindow(event);

    const att = await prisma.attendance.upsert({
      where: { memberId_eventId: { memberId: member.id, eventId } },
      create: { memberId: member.id, eventId, present: !!present },
      update: { present: !!present },
      include: includeAll,
    });

    res.json(serializeAttendance(att));
  })
);

router.post(
  '/save',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can save attendance');
    }

    const { eventId, marks } = req.body;
    if (!eventId || !Array.isArray(marks)) {
      throw new Error('eventId and marks[] are required');
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');
    assertAttendanceWindow(event);

    const saved = [];
    for (const mark of marks) {
      if (!mark?.userId) continue;
      const user = await prisma.user.findUnique({ where: { id: mark.userId } });
      if (!user) continue;
      const member = await ensureMemberForUser(user);
      const att = await prisma.attendance.upsert({
        where: { memberId_eventId: { memberId: member.id, eventId } },
        create: { memberId: member.id, eventId, present: !!mark.present },
        update: { present: !!mark.present },
        include: includeAll,
      });
      saved.push(serializeAttendance(att));
    }

    res.json(saved);
  })
);

router.get(
  '/member/:memberId',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const tokenId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);

    const member = await prisma.member.findUnique({ where: { id: req.params.memberId } });
    if (!member) throw new Error('Member not found');
    if (member.userId !== tokenId && !isLeader(role)) {
      throw new Error('Unauthorized');
    }

    const list = await prisma.attendance.findMany({
      where: { memberId: member.id },
      include: includeAll,
    });
    res.json(list.map(serializeAttendance));
  })
);

router.get(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    const tokenId = getUserIdFromToken(token);
    const role = getRoleFromToken(token);
    const { userId } = req.params;

    if (userId !== tokenId && !isLeader(role)) {
      throw new Error('Unauthorized');
    }

    const list = await prisma.attendance.findMany({
      where: { member: { userId } },
      include: includeAll,
    });
    res.json(list.map(serializeAttendance));
  })
);

router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!isLeader(getRoleFromToken(token))) {
      throw new Error('Only Leaders can view all attendance');
    }
    const list = await prisma.attendance.findMany({ include: includeAll });
    res.json(list.map(serializeAttendance));
  })
);

export default router;
