// prisma/seedReservationChambre.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ajout d'une réservation de chambre
  const reservationChambre = await prisma.reservationsChambre.create({
    data: {
      id_reservation: 3,
      id_chambre: 1,
      date_arrivee: new Date('2025-04-20'),
      date_depart: new Date('2025-04-23')
    }
  });

  console.log(' Réservation chambre ajoutée :', reservationChambre);

  // Ajout de services (service normal)
  const reservationService = await prisma.reservationService.create({
    data: {
      id_reservation: 3,
      id_service: 1, 
      quantite: 2
    }
  });

  console.log('Service lié à la réservation ajouté :', reservationService);

  // Ajout de services locaux (optionnel)
  const reservationServiceLocal = await prisma.reservationServiceLocal.create({
    data: {
      id_reservation: 3,
      id_service_local: 6 
    }
  });

  console.log(' Service local lié à la réservation ajouté :', reservationServiceLocal);
}

main()
  .catch((e) => {
    console.error(' Erreur lors de l\'insertion de réservation chambre :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
