import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: hashedPassword,
      name: 'Owner User',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password: hashedPassword,
      name: 'Member User',
    },
  });

  // Create companies
  const company1 = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corporation',
      logo: 'https://via.placeholder.com/150',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Tech Startup Inc',
      logo: 'https://via.placeholder.com/150',
    },
  });

  // Create memberships
  await prisma.membership.upsert({
    where: {
      userId_companyId: {
        userId: user1.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      companyId: company1.id,
      role: Role.OWNER,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_companyId: {
        userId: user2.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      companyId: company1.id,
      role: Role.ADMIN,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_companyId: {
        userId: user3.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      companyId: company1.id,
      role: Role.MEMBER,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_companyId: {
        userId: user1.id,
        companyId: company2.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      companyId: company2.id,
      role: Role.OWNER,
    },
  });

  // Set active company for user1
  await prisma.user.update({
    where: { id: user1.id },
    data: { activeCompanyId: company1.id },
  });

  // Create invites
  const invite1 = await prisma.invite.create({
    data: {
      email: 'invited@example.com',
      companyId: company1.id,
      token: 'invite-token-123',
      role: Role.MEMBER,
      invitedBy: user1.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const invite2 = await prisma.invite.create({
    data: {
      email: 'admin-invite@example.com',
      companyId: company1.id,
      token: 'invite-token-456',
      role: Role.ADMIN,
      invitedBy: user1.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seed completed!');
  console.log('Users created:', { user1: user1.email, user2: user2.email, user3: user3.email });
  console.log('Companies created:', { company1: company1.name, company2: company2.name });
  console.log('Invites created:', { invite1: invite1.token, invite2: invite2.token });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

