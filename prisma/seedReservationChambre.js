// prisma/seedReservationChambre.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reservationChambre = await prisma.reservationsChambre.create({
    data: {
      id_reservation: 3,
      id_chambre: 1,
      date_arrivee: new Date('2025-04-20'),
      date_depart: new Date('2025-04-23')
    }
  });

  console.log('✅ Réservation chambre ajoutée :', reservationChambre);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'insertion de réservation chambre :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
