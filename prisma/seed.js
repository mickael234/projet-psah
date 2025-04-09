import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    'SUPER_ADMIN',
    'ADMIN_GENERAL',
    'RESPONSABLE_HEBERGEMENT',
    'RECEPTIONNISTE',
    'PROPRIETAIRE',
    'MAINTENANCE',
    'CLIENT',
    'CHAUFFEUR',
    'COMPTABILITE'
  ];

  for (let role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  console.log('Rôles initialisés');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });