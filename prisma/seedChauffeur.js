import {
    PrismaClient,
    RoleUtilisateur,
    StatutDemandeCourse,
    StatutTrajet,
    Prisma
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

async function main() {
    console.log('Starting seeding...');

    const result = await prisma.$transaction(
        async (tx) => {
            // Créer ou récupérer les rôles
            let roleClient = await tx.role.findUnique({
                where: { code: 'CLIENT' }
            });
            if (!roleClient) {
                roleClient = await tx.role.create({
                    data: {
                        nom: 'Client',
                        code: 'CLIENT',
                        description: 'Client standard'
                    }
                });
                console.log('Role client created');
            }

            let roleChauffeur = await tx.role.findUnique({
                where: { code: 'CHAUFFEUR' }
            });
            if (!roleChauffeur) {
                roleChauffeur = await tx.role.create({
                    data: {
                        nom: 'Chauffeur',
                        code: 'CHAUFFEUR',
                        description: 'Personnel chauffeur'
                    }
                });
                console.log('Role chauffeur created');
            }

            const passwordHash = await hashPassword('password123');

            // Créer les utilisateurs
            const utilisateur1 = await tx.utilisateur.upsert({
                where: { email: 'client1@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'jdupont',
                    mot_de_passe: passwordHash,
                    email: 'client1@example.com',
                    role: RoleUtilisateur.client,
                    id_role: roleClient.id_role
                }
            });

            const utilisateur2 = await tx.utilisateur.upsert({
                where: { email: 'client2@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'mmartin',
                    mot_de_passe: passwordHash,
                    email: 'client2@example.com',
                    role: RoleUtilisateur.client,
                    id_role: roleClient.id_role
                }
            });

            const utilisateur3 = await tx.utilisateur.upsert({
                where: { email: 'chauffeur1@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'pleroy',
                    mot_de_passe: passwordHash,
                    email: 'chauffeur1@example.com',
                    role: RoleUtilisateur.personnel,
                    id_role: roleChauffeur.id_role
                }
            });

            const utilisateur4 = await tx.utilisateur.upsert({
                where: { email: 'chauffeur2@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'sdubois',
                    mot_de_passe: passwordHash,
                    email: 'chauffeur2@example.com',
                    role: RoleUtilisateur.personnel,
                    id_role: roleChauffeur.id_role
                }
            });

            console.log('Utilisateurs created');

            // Créer les clients
            const client1 = await tx.client.upsert({
                where: { id_utilisateur: utilisateur1.id_utilisateur },
                update: {},
                create: {
                    id_utilisateur: utilisateur1.id_utilisateur,
                    prenom: 'Jean',
                    nom: 'Dupont',
                    telephone: '+33612345678',
                    statut_membre: 'premium',
                    consentement_marketing: true
                }
            });

            const client2 = await tx.client.upsert({
                where: { id_utilisateur: utilisateur2.id_utilisateur },
                update: {},
                create: {
                    id_utilisateur: utilisateur2.id_utilisateur,
                    prenom: 'Marie',
                    nom: 'Martin',
                    telephone: '+33687654321',
                    statut_membre: 'standard',
                    consentement_marketing: false
                }
            });

            console.log('Clients created');

            // Créer le personnel
            const personnel1 = await tx.personnel.upsert({
                where: { id_utilisateur: utilisateur3.id_utilisateur },
                update: {},
                create: {
                    id_utilisateur: utilisateur3.id_utilisateur,
                    prenom: 'Pierre',
                    nom: 'Leroy',
                    poste: 'Chauffeur VIP',
                    date_embauche: new Date('2023-01-15'),
                    permis_url: 'permisvalide.jpg',
                    piece_identite_url: 'pieceIdentité.jpg',
                    documents_verifies: true,
                    date_expiration_permis: new Date('2025-08-02')
                }
            });

            const personnel2 = await tx.personnel.upsert({
                where: { id_utilisateur: utilisateur4.id_utilisateur },
                update: {},
                create: {
                    id_utilisateur: utilisateur4.id_utilisateur,
                    prenom: 'Sophie',
                    nom: 'Dubois',
                    poste: 'Chauffeur Standard',
                    date_embauche: new Date('2023-03-20')
                }
            });

            console.log('Personnel created');

            // Créer des demandes de course
            const demandeCourse1 = await tx.demandeCourse.create({
                data: {
                    lieu_depart: 'Gare de Lyon, Paris',
                    lieu_arrivee: 'Hôtel Intercontinental, Paris',
                    date_demande: new Date('2025-05-10T09:00:00Z'),
                    statut: StatutDemandeCourse.acceptee,
                    id_client: client1.id_client
                }
            });

            const demandeCourse2 = await tx.demandeCourse.create({
                data: {
                    lieu_depart: 'Aéroport Charles de Gaulle, Paris',
                    lieu_arrivee: 'Tour Eiffel, Paris',
                    date_demande: new Date('2025-05-11T14:30:00Z'),
                    statut: StatutDemandeCourse.en_attente,
                    id_client: client2.id_client
                }
            });

            const demandeCourse3 = await tx.demandeCourse.create({
                data: {
                    lieu_depart: 'Place de la Concorde, Paris',
                    lieu_arrivee: 'Place Vendôme, Paris',
                    date_demande: new Date('2025-05-12T16:45:00Z'),
                    statut: StatutDemandeCourse.acceptee,
                    id_client: client1.id_client
                }
            });

            const demandeCourse4 = await tx.demandeCourse.create({
                data: {
                    lieu_depart: 'Montmartre, Paris',
                    lieu_arrivee: 'Musée du Louvre, Paris',
                    date_demande: new Date('2025-05-14T10:15:00Z'),
                    statut: StatutDemandeCourse.refusee,
                    id_client: client2.id_client
                }
            });

            console.log('Demandes de courses created');

            // Créer les trajets
            const trajet1 = await tx.trajet.create({
                data: {
                    date_prise_en_charge: new Date('2025-05-10T09:15:00Z'),
                    date_depose: new Date('2025-05-10T09:40:00Z'),
                    statut: StatutTrajet.termine,
                    id_personnel: personnel1.id_personnel,
                    id_demande_course: demandeCourse1.id_demande_course
                }
            });

            console.log('Trajets created');

            return {
                utilisateurs: [
                    utilisateur1,
                    utilisateur2,
                    utilisateur3,
                    utilisateur4
                ],
                clients: [client1, client2],
                personnel: [personnel1, personnel2],
                demandesCourses: [
                    demandeCourse1,
                    demandeCourse2,
                    demandeCourse3,
                    demandeCourse4
                ],
                trajets: [trajet1]
            };
        },
        {
            timeout: 30000,
            maxWait: 5000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
    );

    console.log('Seeding finished successfully');
    console.log(
        `Created ${result.utilisateurs.length} utilisateurs, ${result.clients.length} clients, ${result.personnel.length} personnel`
    );
    console.log(
        `Created ${result.demandesCourses.length} demandes de courses and ${result.trajets.length} trajets`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
