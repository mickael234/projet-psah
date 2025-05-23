import { PrismaClient, RoleUtilisateur } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function main() {
    console.log('Lancement du seed...');

    // Créer un rôle ADMIN si non existant
    const adminRole = await prisma.role.upsert({
        where: { code: 'ADMIN_GENERAL' },
        update: {},
        create: {
            code: 'ADMIN_GENERAL',
            nom: 'Administrateur général',
            description: 'Accès global à toutes les fonctionnalités.'
        }
    });

    // Créer un utilisateur administrateur
    const hashedPassword = await hashPassword('admin123');
    const adminUser = await prisma.utilisateur.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            nom_utilisateur: 'adminuser',
            mot_de_passe: hashedPassword,
            email: 'admin@example.com',
            role: RoleUtilisateur.administrateur,
            id_role: adminRole.id_role
        }
    });

    console.log('Utilisateur admin créé :', adminUser.email);

    // Ajouter deux formations
    const formations = await prisma.formation.createMany({
        data: [
            {
                titre: 'Formation sécurité routière',
                description:
                    'Règles essentielles de sécurité pour les chauffeurs',
                obligatoire: true,
                active: true
            },
            {
                titre: 'Formation service client',
                description:
                    'Adopter une posture bienveillante avec les clients',
                obligatoire: false,
                active: true
            }
        ]
    });

    console.log(` ${formations.count} formations ajoutées.`);

    // Créer un incident par un client (utilisateur id 10)
    const clientIncident = await prisma.incident.create({
        data: {
            id_utilisateur: 10,
            type: 'panne',
            description: 'Problème technique lors du trajet.',
            statut: 'ouvert'
        }
    });

    // Créer un incident par un chauffeur (utilisateur id 11)
    const chauffeurIncident = await prisma.incident.create({
        data: {
            id_utilisateur: 11,
            type: 'agression',
            description: 'Comportement agressif d’un client',
            statut: 'ouvert'
        }
    });

    console.log('Incidents créés :', {
        clientIncidentId: clientIncident.id_incident,
        chauffeurIncidentId: chauffeurIncident.id_incident
    });

    console.log('Seed terminé avec succès.');
}

main()
    .catch((e) => {
        console.error('Erreur de seed :', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
