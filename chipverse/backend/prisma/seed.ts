import { PrismaClient, AuthProvider, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ChipVerse database...');

  // Create admin user
  const adminEmail = 'admin@chipverse.io';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hashed = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'ChipVerse Admin',
        email: adminEmail,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        authProviders: {
          create: {
            provider: AuthProvider.EMAIL,
            providerId: adminEmail,
            accessToken: hashed,
          },
        },
      },
    });

    await prisma.userProfile.create({
      data: {
        userId: admin.id,
        xp: 9999,
        streak: 30,
        rank: 'RTL Architect',
        currentDomain: 'rtl',
      },
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists`);
  }

  // Create demo user
  const demoEmail = 'demo@chipverse.io';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingDemo) {
    const hashed = await bcrypt.hash('Demo@123', 12);
    const demo = await prisma.user.create({
      data: {
        name: 'Devansh Demo',
        email: demoEmail,
        isEmailVerified: true,
        authProviders: {
          create: {
            provider: AuthProvider.EMAIL,
            providerId: demoEmail,
            accessToken: hashed,
          },
        },
      },
    });

    await prisma.userProfile.create({
      data: {
        userId: demo.id,
        xp: 420,
        streak: 7,
        rank: 'RTL Beginner',
        currentDomain: 'rtl',
      },
    });

    // Add some progress
    const domains = ['rtl', 'verification', 'physical-design', 'analog', 'fpga', 'embedded', 'dft', 'research'];
    for (const domainId of domains) {
      await prisma.domainProgress.create({
        data: { userId: demo.id, domainId, completedLevels: [0, 1] },
      });
    }

    console.log(`✅ Demo user created: ${demoEmail} / Demo@123`);
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
