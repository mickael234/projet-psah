import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Début de l\'initialisation des rôles et permissions ---');

    // 1. Créer les rôles
    const roles = [
        { code: 'SUPER_ADMIN', nom: 'Super Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
        { code: 'ADMIN_GENERAL', nom: 'Administrateur Général', description: 'Gère les opérations courantes de la plateforme' },
        { code: 'RESPONSABLE_HEBERGEMENT', nom: 'Responsable Hébergement', description: 'Supervise les hébergements et les services associés' },
        { code: 'RECEPTIONNISTE', nom: 'Réceptionniste', description: 'Gère les réservations et accueille les clients' },
        { code: 'PROPRIETAIRE', nom: 'Propriétaire', description: 'Accès limité à ses propres hébergements' },
        { code: 'MAINTENANCE', nom: 'Maintenance', description: 'Gère les tâches de maintenance' },
        { code: 'CLIENT', nom: 'Client', description: 'Réserve et utilise les services' },
        { code: 'CHAUFFEUR', nom: 'Chauffeur', description: 'Gère les déplacements des clients' },
        { code: 'COMPTABILITE', nom: 'Comptabilité', description: 'Gère la facturation et les rapports financiers' },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { code: role.code },
            update: {},
            create: role
        });
        console.log(`Rôle créé ou existant : ${role.code}`);
    }

    // 2. Créer les permissions
    const permissions = [
        { code: 'MANAGE_USERS', nom: 'Gérer les utilisateurs', description: 'Permet de créer, modifier et supprimer des utilisateurs' },
        { code: 'MANAGE_ROLES', nom: 'Gérer les rôles', description: 'Permet de créer, modifier et supprimer des rôles' },
        { code: 'MANAGE_PERMISSIONS', nom: 'Gérer les permissions', description: 'Permet de créer, modifier et supprimer des permissions' },
        { code: 'MANAGE_RESERVATIONS', nom: 'Gérer les réservations', description: 'Permet de gérer les réservations' },
        { code: 'MANAGE_ROOMS', nom: 'Gérer les chambres', description: 'Permet de gérer les chambres' },
        { code: 'MANAGE_SERVICES', nom: 'Gérer les services', description: 'Permet de gérer les services' },
        { code: 'MANAGE_BILLING', nom: 'Gérer la facturation', description: 'Permet de gérer la facturation' },
        { code: 'MANAGE_COMMUNICATIONS', nom: 'Gérer les communications', description: 'Permet de gérer les communications entre services' },
        { code: 'VIEW_REPORTS', nom: 'Voir les rapports', description: 'Permet de voir les rapports' },
        { code: 'MANAGE_MAINTENANCE', nom: 'Gérer la maintenance', description: 'Permet de gérer les tâches de maintenance' },
    ];

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { code: permission.code },
            update: {},
            create: permission
        });
        console.log(`Permission créée ou existante : ${permission.code}`);
    }

    // 3. Lier les permissions aux rôles
    const allRoles = await prisma.role.findMany();
    const allPermissions = await prisma.permission.findMany();

    const roleMap = Object.fromEntries(allRoles.map(role => [role.code, role.id_role]));
    const permissionMap = Object.fromEntries(allPermissions.map(p => [p.code, p.id_permission]));

    const rolePermissions = {
        SUPER_ADMIN: Object.keys(permissionMap),
        ADMIN_GENERAL: [
            'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_RESERVATIONS',
            'MANAGE_ROOMS', 'MANAGE_SERVICES', 'MANAGE_BILLING',
            'MANAGE_COMMUNICATIONS', 'VIEW_REPORTS'
        ],
        RESPONSABLE_HEBERGEMENT: [
            'MANAGE_RESERVATIONS', 'MANAGE_ROOMS',
            'MANAGE_SERVICES', 'VIEW_REPORTS', 'MANAGE_MAINTENANCE'
        ],
        RECEPTIONNISTE: ['MANAGE_RESERVATIONS', 'VIEW_REPORTS'],
        MAINTENANCE: ['MANAGE_MAINTENANCE'],
        PROPRIETAIRE: ['VIEW_REPORTS', 'MANAGE_ROOMS'],
        CLIENT: ['MANAGE_RESERVATIONS'],
        CHAUFFEUR: ['MANAGE_COMMUNICATIONS'],
        COMPTABILITE: ['MANAGE_BILLING', 'VIEW_REPORTS'],
    };

    for (const [roleCode, perms] of Object.entries(rolePermissions)) {
        for (const permCode of perms) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: roleMap[roleCode],
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: roleMap[roleCode],
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle ${roleCode}`);
            } catch (error) {
                console.error(`Erreur lors de l'association ${permCode} → ${roleCode} :`, error);
            }
        }
    }

    console.log('--- Initialisation terminée avec succès ---');
}

main()
    .catch((e) => {
        console.error('Erreur durant le seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });