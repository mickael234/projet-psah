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

    // Utilisation d'une transaction pour garantir que toutes les opérations sont atomiques
    // Si une opération échoue, toutes les opérations seront annulées (rollback)
    const result = await prisma.$transaction(
        async (prismaTransaction) => {
            // Création des rôles s'ils n'existent pas
            let roleClient = await prismaTransaction.role.findUnique({
                where: { name: 'CLIENT' }
            });

            if (!roleClient) {
                roleClient = await prismaTransaction.role.create({
                    data: { name: 'CLIENT' }
                });
                console.log('Role client created');
            } else {
                console.log('Role client already exists, using existing role');
            }

            let roleChauffeur = await prismaTransaction.role.findUnique({
                where: { name: 'CHAUFFEUR' }
            });

            if (!roleChauffeur) {
                roleChauffeur = await prismaTransaction.role.create({
                    data: { name: 'CHAUFFEUR' }
                });
                console.log('Role chauffeur created');
            } else {
                console.log(
                    'Role chauffeur already exists, using existing role'
                );
            }

            // Création des users - table User
            const passwordHash = await hashPassword('password123');

            const user1 = await prismaTransaction.user.upsert({
                where: { email: 'client1@example.com' },
                update: {},
                create: {
                    email: 'client1@example.com',
                    password: passwordHash,
                    fullName: 'Jean Dupont',
                    roleId: roleClient.id,
                    phoneNumber: '+33612345678'
                }
            });

            const user2 = await prismaTransaction.user.upsert({
                where: { email: 'client2@example.com' },
                update: {},
                create: {
                    email: 'client2@example.com',
                    password: passwordHash,
                    fullName: 'Marie Martin',
                    roleId: roleClient.id,
                    phoneNumber: '+33687654321'
                }
            });

            const user3 = await prismaTransaction.user.upsert({
                where: { email: 'chauffeur1@example.com' },
                update: {},
                create: {
                    email: 'chauffeur1@example.com',
                    password: passwordHash,
                    fullName: 'Pierre Leroy',
                    roleId: roleChauffeur.id,
                    phoneNumber: '+33698765432'
                }
            });

            const user4 = await prismaTransaction.user.upsert({
                where: { email: 'chauffeur2@example.com' },
                update: {},
                create: {
                    email: 'chauffeur2@example.com',
                    password: passwordHash,
                    fullName: 'Sophie Dubois',
                    roleId: roleChauffeur.id,
                    phoneNumber: '+33654321098'
                }
            });

            console.log('Users created in User table');

            // Création des utilisateurs - table Utilisateur
            const utilisateur1 = await prismaTransaction.utilisateur.upsert({
                where: { email: 'client1@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'jdupont',
                    mot_de_passe: passwordHash,
                    email: 'client1@example.com',
                    role: RoleUtilisateur.client
                }
            });

            const utilisateur2 = await prismaTransaction.utilisateur.upsert({
                where: { email: 'client2@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'mmartin',
                    mot_de_passe: passwordHash,
                    email: 'client2@example.com',
                    role: RoleUtilisateur.client
                }
            });

            const utilisateur3 = await prismaTransaction.utilisateur.upsert({
                where: { email: 'chauffeur1@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'pleroy',
                    mot_de_passe: passwordHash,
                    email: 'chauffeur1@example.com',
                    role: RoleUtilisateur.personnel
                }
            });

            const utilisateur4 = await prismaTransaction.utilisateur.upsert({
                where: { email: 'chauffeur2@example.com' },
                update: {},
                create: {
                    nom_utilisateur: 'sdubois',
                    mot_de_passe: passwordHash,
                    email: 'chauffeur2@example.com',
                    role: RoleUtilisateur.personnel
                }
            });

            console.log('Utilisateurs created in Utilisateur table');

            // Association des utilisateurs clients à la table Client
            const client1 = await prismaTransaction.client.upsert({
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

            const client2 = await prismaTransaction.client.upsert({
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

            console.log('Clients created and associated');

            // Association des utilisateurs chauffeurs à la table Personnel
            const personnel1 = await prismaTransaction.personnel.upsert({
                where: { id_utilisateur: utilisateur3.id_utilisateur },
                update: {},
                create: {
                    id_utilisateur: utilisateur3.id_utilisateur,
                    prenom: 'Pierre',
                    nom: 'Leroy',
                    poste: 'Chauffeur VIP',
                    date_embauche: new Date('2023-01-15')
                }
            });

            const personnel2 = await prismaTransaction.personnel.upsert({
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

            console.log('Personnel created and associated');

            // Création des demandes de courses
            const demandeCourse1 = await prismaTransaction.demandeCourse.create(
                {
                    data: {
                        lieu_depart: 'Gare de Lyon, Paris',
                        lieu_arrivee: 'Hôtel Intercontinental, Paris',
                        date_demande: new Date('2025-05-10T09:00:00Z'),
                        statut: StatutDemandeCourse.acceptee,
                        id_client: client1.id_client
                    }
                }
            );

            const demandeCourse2 = await prismaTransaction.demandeCourse.create(
                {
                    data: {
                        lieu_depart: 'Aéroport Charles de Gaulle, Paris',
                        lieu_arrivee: 'Tour Eiffel, Paris',
                        date_demande: new Date('2025-05-11T14:30:00Z'),
                        statut: StatutDemandeCourse.en_attente,
                        id_client: client2.id_client
                    }
                }
            );

            const demandeCourse3 = await prismaTransaction.demandeCourse.create(
                {
                    data: {
                        lieu_depart: 'Place de la Concorde, Paris',
                        lieu_arrivee: 'Place Vendôme, Paris',
                        date_demande: new Date('2025-05-12T16:45:00Z'),
                        statut: StatutDemandeCourse.acceptee,
                        id_client: client1.id_client
                    }
                }
            );

            const demandeCourse4 = await prismaTransaction.demandeCourse.create(
                {
                    data: {
                        lieu_depart: 'Montmartre, Paris',
                        lieu_arrivee: 'Musée du Louvre, Paris',
                        date_demande: new Date('2025-05-14T10:15:00Z'),
                        statut: StatutDemandeCourse.refusee,
                        id_client: client2.id_client
                    }
                }
            );

            console.log('Demandes de courses created');

            // Création des trajets
            const trajet1 = await prismaTransaction.trajet.create({
                data: {
                    date_prise_en_charge: new Date('2025-05-10T09:15:00Z'),
                    date_depose: new Date('2025-05-10T09:40:00Z'),
                    statut: StatutTrajet.termine,
                    id_personnel: personnel1.id_personnel,
                    id_demande_course: demandeCourse1.id_demande_course
                }
            });

            const trajet2 = await prismaTransaction.trajet.create({
                data: {
                    date_prise_en_charge: new Date('2025-05-12T17:00:00Z'),
                    date_depose: new Date('2025-05-12T17:15:00Z'),
                    statut: StatutTrajet.en_cours,
                    id_personnel: personnel2.id_personnel,
                    id_demande_course: demandeCourse3.id_demande_course
                }
            });

            console.log('Trajets created');

            // Retourner les données créées pour pouvoir les utiliser après la transaction si nécessaire
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
                trajets: [trajet1, trajet2]
            };
        },
        {
            // Options de transaction: timeout plus long pour s'assurer que toutes les opérations ont le temps de s'exécuter
            timeout: 30000, // 30 secondes
            maxWait: 5000, // 5 secondes d'attente max pour obtenir une connexion
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable // Niveau d'isolation le plus strict
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
