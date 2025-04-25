// seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Créer ou récupérer un utilisateur
  const utilisateur = await prisma.utilisateur.upsert({
    where: { email: 'lyna.auto@example.com' },
    update: {}, // ne modifie rien s'il existe
    create: {
      nom_utilisateur: 'lyna_auto',
      mot_de_passe: '1234',
      email: 'lyna.auto@example.com',
      role: 'client',
      billingInfo: {
        create: {
          address: '123 Rue de Paris',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
          billingName: 'Lyna Chalal',
          vatNumber: 'FR12345678901'
        }
      }
    },
    include: { billingInfo: true }
  });

  // Créer ou récupérer le client lié à cet utilisateur
  const client = await prisma.client.upsert({
    where: { id_utilisateur: utilisateur.id_utilisateur },
    update: {},
    create: {
      id_utilisateur: utilisateur.id_utilisateur,
      prenom: 'Lyna',
      nom: 'Chalal',
      telephone: '0600000000',
      statut_membre: 'standard',
      consentement_marketing: true
    }
  });

  // Créer une nouvelle réservation
  const reservation = await prisma.reservation.create({
    data: {
      id_client: client.id_client,
      prix_total: 150.0,
      etat: 'confirmee',
      etat_paiement: 'en_attente'
    }
  });

  console.log(' Données créées avec succès ! ID réservation :', reservation.id_reservation);
}

main()
  .catch((e) => {
    console.error(' Erreur dans le seed :', e);
  })
  .finally(() => prisma.$disconnect());
