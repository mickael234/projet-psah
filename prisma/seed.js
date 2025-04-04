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

  const room1 = await prisma.room.create({
    data: {
      id: 11,
      number:"102",
      type: "Standard",
      pricePerNight: 99.00,
      status: "available",
      description: "Brief example description"
    }

  })

  const media = await prisma.media.create({
    data : {
      id: 78,
      roomId: 11,
      type: "image",
      url: "some url",
      title: "Image 1",
      description: "Description media 1"
    }
  })

  const amenity = await prisma.amenity.create({
    data : {
      id: 22,
      name: "Air conditioning"
    }
  })

  const roomAmenity = await prisma.roomAmenities.create({
    data : {
      roomId: 11,
      amenityId: 22
    }
  })

  console.log("Room and amenities initialized.")

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