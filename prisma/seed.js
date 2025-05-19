import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
    console.log('Début de l\'initialisation des rôles et permissions...');

    // 1. Créer les rôles
    const roles = [
        { code: 'SUPER_ADMIN', nom: 'Super Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
        { code: 'ADMIN_GENERAL', nom: 'Administrateur Général', description: 'Accès à la plupart des fonctionnalités administratives' },
        { code: 'RESPONSABLE_HEBERGEMENT', nom: 'Responsable Hébergement', description: 'Gestion des chambres et réservations' },
        { code: 'RECEPTIONNISTE', nom: 'Réceptionniste', description: 'Gestion des réservations et accueil clients' },
        { code: 'MAINTENANCE', nom: 'Maintenance', description: 'Gestion des tâches de maintenance' },
        { code: 'PROPRIETAIRE', nom: 'Propriétaire', description: 'Propriétaire d\'hébergement' },
        { code: 'CLIENT', nom: 'Client', description: 'Utilisateur client' },
        { code: 'CHAUFFEUR', nom: 'Chauffeur', description: 'Service de transport' },
        { code: 'COMPTABILITE', nom: 'Comptabilité', description: 'Gestion financière' }
    ];

    // Créer les rôles dans la base de données
    for (const role of roles) {
        try {
            await prisma.role.upsert({
                where: { code: role.code },
                update: {},
                create: {
                    code: role.code,
                    nom: role.nom,
                    description: role.description,
                }
            });
            console.log(`Rôle créé: ${role.code}`);
        } catch (error) {
            console.error(`Erreur lors de la création du rôle ${role.code}:`, error);
        }
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

    // Créer les permissions dans la base de données
    for (const permission of permissions) {
        try {
            await prisma.permission.upsert({
                where: { code: permission.code },
                update: {},
                create: {
                    code: permission.code,
                    nom: permission.nom,
                    description: permission.description,
                }
            });
            console.log(`Permission créée: ${permission.code}`);
        } catch (error) {
            console.error(`Erreur lors de la création de la permission ${permission.code}:`, error);
        }
    }

    // 3. Récupérer les IDs des rôles
    const superAdminRole = await prisma.role.findUnique({
        where: { code: 'SUPER_ADMIN' }
    });
    
    const adminGeneralRole = await prisma.role.findUnique({
        where: { code: 'ADMIN_GENERAL' }
    });
    
    const responsableHebergementRole = await prisma.role.findUnique({
        where: { code: 'RESPONSABLE_HEBERGEMENT' }
    });
    
    const receptionnisteRole = await prisma.role.findUnique({
        where: { code: 'RECEPTIONNISTE' }
    });
    
    const maintenanceRole = await prisma.role.findUnique({
        where: { code: 'MAINTENANCE' }
    });

    // 4. Récupérer les IDs des permissions
    const allPermissions = await prisma.permission.findMany();
    const permissionMap = allPermissions.reduce((map, perm) => {
        map[perm.code] = perm.id_permission;
        return map;
    }, {});

    // 5. Associer les permissions aux rôles
    
    // SUPER_ADMIN a toutes les permissions
    if (superAdminRole) {
        for (const permCode in permissionMap) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: superAdminRole.id_role,
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: superAdminRole.id_role,
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle SUPER_ADMIN`);
            } catch (error) {
                console.error(`Erreur lors de l'association de la permission ${permCode} au rôle SUPER_ADMIN:`, error);
            }
        }
    }

    // ADMIN_GENERAL a presque toutes les permissions sauf MANAGE_PERMISSIONS
    if (adminGeneralRole) {
        const adminPermissions = [
            'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_RESERVATIONS', 
            'MANAGE_ROOMS', 'MANAGE_SERVICES', 'MANAGE_BILLING', 
            'MANAGE_COMMUNICATIONS', 'VIEW_REPORTS'
        ];
        
        for (const permCode of adminPermissions) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: adminGeneralRole.id_role,
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: adminGeneralRole.id_role,
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle ADMIN_GENERAL`);
            } catch (error) {
                console.error(`Erreur lors de l'association de la permission ${permCode} au rôle ADMIN_GENERAL:`, error);
            }
        }
    }

    // RESPONSABLE_HEBERGEMENT
    if (responsableHebergementRole) {
        const respHebergPermissions = [
            'MANAGE_RESERVATIONS', 'MANAGE_ROOMS', 'MANAGE_SERVICES', 
            'VIEW_REPORTS', 'MANAGE_MAINTENANCE'
        ];
        
        for (const permCode of respHebergPermissions) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: responsableHebergementRole.id_role,
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: responsableHebergementRole.id_role,
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle RESPONSABLE_HEBERGEMENT`);
            } catch (error) {
                console.error(`Erreur lors de l'association de la permission ${permCode} au rôle RESPONSABLE_HEBERGEMENT:`, error);
            }
        }
    }

    // RECEPTIONNISTE
    if (receptionnisteRole) {
        const receptionnistePermissions = [
            'MANAGE_RESERVATIONS', 'VIEW_REPORTS'
        ];
        
        for (const permCode of receptionnistePermissions) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: receptionnisteRole.id_role,
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: receptionnisteRole.id_role,
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle RECEPTIONNISTE`);
            } catch (error) {
                console.error(`Erreur lors de l'association de la permission ${permCode} au rôle RECEPTIONNISTE:`, error);
            }
        }
    }

    // MAINTENANCE
    if (maintenanceRole) {
        const maintenancePermissions = [
            'MANAGE_MAINTENANCE'
        ];
        
        for (const permCode of maintenancePermissions) {
            try {
                await prisma.rolePermission.upsert({
                    where: {
                        id_role_id_permission: {
                            id_role: maintenanceRole.id_role,
                            id_permission: permissionMap[permCode]
                        }
                    },
                    update: {},
                    create: {
                        id_role: maintenanceRole.id_role,
                        id_permission: permissionMap[permCode]
                    }
                });
                console.log(`Permission ${permCode} associée au rôle MAINTENANCE`);
            } catch (error) {
                console.error(`Erreur lors de l'association de la permission ${permCode} au rôle MAINTENANCE:`, error);
            }
        }
    }

    console.log('Initialisation des rôles et permissions terminée avec succès');
}

main()
    .catch((e) => {
        console.error('Erreur lors de l\'initialisation des rôles et permissions:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
