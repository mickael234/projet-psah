import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEquipementSiPasExiste(nom) {
  const existant = await prisma.equipement.findFirst({ where: { nom } });
  if (!existant) {
    return await prisma.equipement.create({ data: { nom } });
  }
  return existant;
}

async function main() {
  // 🔹 Création des rôles
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

  console.log('✅ Rôles initialisés');

  // 🔹 Création des équipements
  const wifi = await createEquipementSiPasExiste('Wi-Fi');
  const television = await createEquipementSiPasExiste('Télévision');

  console.log('✅ Équipements ajoutés');

  // 🔹 Création de la chambre si elle n'existe pas déjà
  const chambreExistante = await prisma.chambre.findFirst({
    where: { numero_chambre: '101' }
  });

  if (!chambreExistante) {
    await prisma.chambre.create({
      data: {
        numero_chambre: '101',
        type_chambre: 'Double',
        prix_par_nuit: 90.00,
        etat: 'disponible',
        description: 'Chambre avec Wi-Fi et Télévision pour 2 personnes',
        equipements: {
          create: [
            { equipement: { connect: { id_equipement: wifi.id_equipement } } },
            { equipement: { connect: { id_equipement: television.id_equipement } } }
          ]
        }
      }
    });

    console.log('✅ Chambre 101 ajoutée avec équipements');
  } else {
    console.log('ℹ️ Chambre 101 existe déjà, non ajoutée');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur dans seed.js', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
