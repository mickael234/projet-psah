// prisma/seed-hebergements.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Créer des équipements
    const equipements = [
        { nom: 'Wi-Fi' },
        { nom: 'Climatisation' },
        { nom: 'Télévision' },
        { nom: 'Mini-bar' },
        { nom: 'Coffre-fort' },
        { nom: 'Sèche-cheveux' },
        { nom: 'Fer à repasser' },
        { nom: 'Machine à café' }
    ];

    for (const equipement of equipements) {
        // Vérifier si l'équipement existe déjà
        const existingEquipement = await prisma.equipement.findFirst({
            where: { nom: equipement.nom }
        });

        if (!existingEquipement) {
            await prisma.equipement.create({
                data: equipement
            });
        }
    }

    console.log('Équipements initialisés');

    // Récupérer les IDs des équipements
    const equipementsDb = await prisma.equipement.findMany();
    const equipementIds = equipementsDb.map((e) => e.id_equipement);

    // Créer des chambres
    const chambres = [
        {
            numero_chambre: '101',
            type_chambre: 'Standard',
            prix_par_nuit: 100.0,
            etat: 'disponible',
            description: 'Chambre standard confortable avec vue sur la ville'
        },
        {
            numero_chambre: '102',
            type_chambre: 'Standard',
            prix_par_nuit: 100.0,
            etat: 'disponible',
            description: 'Chambre standard confortable avec vue sur la ville'
        },
        {
            numero_chambre: '201',
            type_chambre: 'Deluxe',
            prix_par_nuit: 150.0,
            etat: 'disponible',
            description: 'Chambre deluxe spacieuse avec vue panoramique'
        },
        {
            numero_chambre: '202',
            type_chambre: 'Deluxe',
            prix_par_nuit: 150.0,
            etat: 'disponible',
            description: 'Chambre deluxe spacieuse avec vue panoramique'
        },
        {
            numero_chambre: '301',
            type_chambre: 'Suite',
            prix_par_nuit: 250.0,
            etat: 'disponible',
            description: 'Suite luxueuse avec salon séparé et jacuzzi'
        }
    ];

    for (const chambre of chambres) {
        // Vérifier si la chambre existe déjà
        const existingChambre = await prisma.chambre.findFirst({
            where: { numero_chambre: chambre.numero_chambre }
        });

        let chambreId;

        if (!existingChambre) {
            // Créer la chambre
            const chambreCreated = await prisma.chambre.create({
                data: chambre
            });
            chambreId = chambreCreated.id_chambre;
        } else {
            chambreId = existingChambre.id_chambre;
        }

        // Ajouter des équipements aléatoires à la chambre
        const nbEquipements = Math.floor(Math.random() * 5) + 3; // Entre 3 et 7 équipements
        const equipementsForChambre = [...equipementIds]
            .sort(() => 0.5 - Math.random())
            .slice(0, nbEquipements);

        for (const equipementId of equipementsForChambre) {
            // Vérifier si la relation existe déjà
            const existingRelation = await prisma.chambresEquipements.findFirst(
                {
                    where: {
                        id_chambre: chambreId,
                        id_equipement: equipementId
                    }
                }
            );

            if (!existingRelation) {
                await prisma.chambresEquipements.create({
                    data: {
                        id_chambre: chambreId,
                        id_equipement: equipementId
                    }
                });
            }
        }

        // Ajouter des médias à la chambre
        const medias = [
            {
                type_media: 'image',
                url: `/placeholder.svg?height=300&width=500&text=${chambre.type_chambre}`,
                titre: `Photo ${chambre.type_chambre}`,
                description: `Vue de la chambre ${chambre.numero_chambre}`
            },
            {
                type_media: 'image',
                url: `/placeholder.svg?height=300&width=500&text=Salle de bain`,
                titre: 'Salle de bain',
                description: 'Vue de la salle de bain'
            }
        ];

        // Vérifier si des médias existent déjà pour cette chambre
        const existingMedias = await prisma.media.findMany({
            where: { id_chambre: chambreId }
        });

        if (existingMedias.length === 0) {
            for (const media of medias) {
                await prisma.media.create({
                    data: {
                        id_chambre: chambreId,
                        type_media: media.type_media,
                        url: media.url,
                        titre: media.titre,
                        description: media.description
                    }
                });
            }
        }
    }

    console.log('Chambres initialisées avec équipements et médias');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
