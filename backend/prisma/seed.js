import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const leaderHash = await bcrypt.hash('leader123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('member123', 10);
  const pendingHash = await bcrypt.hash('password123', 10);

  // Migrate legacy generic demo emails → FPR Inkotanyi domain
  const emailMigrations = [
    ['leader@party.com', 'leader@rpfinkotanyi.rw'],
    ['admin@party.com', 'admin@rpfinkotanyi.rw'],
    ['member@party.com', 'member@rpfinkotanyi.rw'],
    ['pending@example.com', 'pending@rpfinkotanyi.rw'],
  ];
  for (const [from, to] of emailMigrations) {
    const existing = await prisma.user.findUnique({ where: { email: from } });
    const taken = await prisma.user.findUnique({ where: { email: to } });
    if (existing && !taken) {
      await prisma.user.update({ where: { id: existing.id }, data: { email: to } });
      console.log(`Migrated demo email ${from} → ${to}`);
    }
  }

  await prisma.user.upsert({
    where: { email: 'leader@rpfinkotanyi.rw' },
    update: {
      password: leaderHash,
      approved: true,
      role: 'Leader',
      fullName: 'FPR Inkotanyi Leader',
    },
    create: {
      fullName: 'FPR Inkotanyi Leader',
      email: 'leader@rpfinkotanyi.rw',
      password: leaderHash,
      role: 'Leader',
      approved: true,
      twoFactorEnabled: false,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@rpfinkotanyi.rw' },
    update: {
      password: adminHash,
      approved: true,
      role: 'Leader',
      username: 'admin',
      fullName: 'FPR Inkotanyi Admin',
    },
    create: {
      fullName: 'FPR Inkotanyi Admin',
      email: 'admin@rpfinkotanyi.rw',
      password: adminHash,
      role: 'Leader',
      approved: true,
      username: 'admin',
      twoFactorEnabled: false,
    },
  });

  const member = await prisma.user.findUnique({ where: { email: 'member@rpfinkotanyi.rw' } });
  if (!member) {
    await prisma.user.create({
      data: {
        fullName: 'FPR Inkotanyi Member',
        email: 'member@rpfinkotanyi.rw',
        password: memberHash,
        role: 'Member',
        approved: true,
        twoFactorEnabled: false,
      },
    });
    console.log('Seeded Member: member@rpfinkotanyi.rw / member123');
  }

  const pending = await prisma.user.findUnique({ where: { email: 'pending@rpfinkotanyi.rw' } });
  if (!pending) {
    await prisma.user.create({
      data: {
        fullName: 'Pending Inkotanyi Applicant',
        email: 'pending@rpfinkotanyi.rw',
        password: pendingHash,
        role: 'Member',
        approved: false,
        twoFactorEnabled: false,
      },
    });
  }

  // Ensure approved users have member profiles
  const approvedUsers = await prisma.user.findMany({ where: { approved: true } });
  for (const user of approvedUsers) {
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
  }

  const achievementCount = await prisma.achievement.count();
  if (achievementCount === 0) {
    await prisma.achievement.createMany({
      data: [
        {
          title: 'Electricity Access',
          category: 'Infrastructure',
          currentProgress: 74.0,
          targetValue: 100.0,
          unit: '%',
          yearLabel: '2024 Status',
          description:
            'FPR Inkotanyi commitment to 100% electricity access by 2029 through grid expansion and off-grid solutions.',
        },
        {
          title: 'Job Creation',
          category: 'Economy',
          currentProgress: 250000,
          targetValue: 1500000,
          unit: 'Jobs',
          yearLabel: '2024 New Jobs',
          description:
            'Productive jobs for youth and women under the FPR Inkotanyi 2024-2029 manifesto.',
        },
        {
          title: 'Girinka Program',
          category: 'Social',
          currentProgress: 450000,
          targetValue: 600000,
          unit: 'Cows',
          yearLabel: 'Distributed Cows',
          description:
            'One Cow per Poor Family — an Inkotanyi social program to fight malnutrition and raise household income.',
        },
      ],
    });
  }

  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: 'FPR Inkotanyi National Congress',
          content:
            'The Inkotanyi National Congress outlined the FPR strategic vision for the next five years, focusing on digital transformation, rural development, and shared prosperity for Rwanda.',
          author: 'FPR Secretariat',
          type: 'NEWS',
          coverImage: '/hero-inkotanyi.png',
        },
        {
          title: 'Our Vision for Rwanda 2029',
          content:
            'An opinion piece on how FPR Inkotanyi’s commitment to Demokrasi, Ubumwe, and Amajyambere continues to shape opportunity for Rwanda’s youth.',
          author: 'FPR Inkotanyi Communications',
          type: 'OPINION',
          coverImage: '/hero-inkotanyi.png',
        },
      ],
    });
  }

  const resourceCount = await prisma.resource.count();
  if (resourceCount < 5) {
    await prisma.resource.createMany({
      data: [
        {
          title: 'FPR Inkotanyi Manifesto 2024-2029',
          description:
            'Official Inkotanyi roadmap for economic transformation, social justice, and sustainable development in Rwanda.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'MANIFESTO',
        },
        {
          title: 'Economic Policy Framework',
          description:
            'FPR strategies for job creation, industrialization, and fiscal responsibility under the national development agenda.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'MANIFESTO',
        },
        {
          title: 'The Path to Liberation (1987-1994)',
          description:
            'A narrative of Inkotanyi founding principles and the struggle that restored hope to Rwanda.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'HISTORY',
        },
        {
          title: 'Decade of Reconstruction',
          description:
            'Documenting the restoration of Rwanda’s social fabric and the rebuilding of national institutions.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'HISTORY',
        },
        {
          title: 'FPR Structural Hierarchy',
          description:
            'Inkotanyi leadership from the village (Umudugudu) level to the National Executive Committee.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'STRUCTURE',
        },
        {
          title: 'Youth & Women Leagues Charter',
          description:
            'Organisational guidelines for Inkotanyi specialized wings, ensuring inclusive representation at every level.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'STRUCTURE',
        },
        {
          title: 'Unity & Reconciliation',
          description:
            'A cornerstone of FPR Inkotanyi: fostering a single national identity that transcends historical divisions.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'GUIDELINE',
        },
        {
          title: 'Self-Reliance (Agaciro)',
          description:
            'The principle of dignity and self-determination, driving home-grown solutions for Rwanda’s development.',
          fileUrl: 'https://rpfinkotanyi.rw/',
          category: 'GUIDELINE',
        },
      ],
    });
  }

  console.log('Database seed complete');
}

const isDirectRun = process.argv[1] && process.argv[1].includes('seed.js');
if (isDirectRun) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
