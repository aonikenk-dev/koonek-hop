import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Demo Organization',
      slug: 'demo-org',
      status: 'ACTIVE',
    },
  });
  console.log('Seed complete: demo-org organization created.');
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
