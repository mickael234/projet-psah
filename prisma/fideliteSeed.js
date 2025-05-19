import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // === Catalogue des Récompenses ===
    await prisma.catalogueRecompense.createMany({
        data: [
            { nom: 'Nuit offerte', points_requis: 100 },
            { nom: 'Petit-déjeuner gratuit', points_requis: 30 },
            { nom: 'Accès SPA', points_requis: 50 }
        ]
    });

    // === Clients avec utilisateurs et fidélité ===
    const client1 = await prisma.client.create({
        data: {
            prenom: 'Lyna',
            nom: 'Chalal',
            utilisateur: {
                create: {
                    email: 'lyna@examp.com',
                    mot_de_passe: 'test1234',
                    nom_utilisateur: 'lynaC', // ✅ AJOUT ICI
                    role: 'client'
                }
            },
            fidelite: {
                create: {
                    solde_points: 150,
                    derniere_mise_a_jour: new Date()
                }
            }
        },
        include: { fidelite: true }
    });

    const client2 = await prisma.client.create({
        data: {
            prenom: 'Nawel',
            nom: 'Chabane',
            utilisateur: {
                create: {
                    email: 'nawel@examp.com',
                    mot_de_passe: 'test1234',
                    nom_utilisateur: 'nawelC', // ✅ AJOUT ICI
                    role: 'client'
                }
            },
            fidelite: {
                create: {
                    solde_points: 80,
                    derniere_mise_a_jour: new Date()
                }
            }
        },
        include: { fidelite: true }
    });

    // === Transactions pour Lyna ===
    await prisma.transactionFidelite.createMany({
        data: [
            {
                id_fidelite: client1.fidelite.id_fidelite,
                changement_points: 50,
                raison: 'Réservation confirmée',
                date_transaction: new Date('2025-05-01')
            },
            {
                id_fidelite: client1.fidelite.id_fidelite,
                changement_points: 100,
                raison: 'Réservation confirmée',
                date_transaction: new Date('2025-05-10')
            }
        ]
    });

    // === Échange de points pour une récompense
    await prisma.echangeFidelite.create({
        data: {
            id_fidelite: client1.fidelite.id_fidelite,
            id_recompense: 1, // Nuit offerte
            points_utilises: 100,
            date_echange: new Date('2025-05-15')
        }
    });

    // === Transaction liée à l'échange
    await prisma.transactionFidelite.create({
        data: {
            id_fidelite: client1.fidelite.id_fidelite,
            changement_points: -100,
            raison: 'Échange pour Nuit offerte',
            date_transaction: new Date('2025-05-15')
        }
    });

    console.log('✅ Seed fidélité terminé avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur dans fideliteSeed.js :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
