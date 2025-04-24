// src/models/hebergementModel.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class HebergementModel {
    /**
     * Récupère tous les hébergements avec filtres optionnels
     * @param {Object} filters - Filtres à appliquer
     * @param {number} page - Numéro de page
     * @param {number} limit - Nombre d'éléments par page
     * @returns {Promise<Object>} - Hébergements paginés
     */
    static async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        // Construire les filtres
        const where = {
            ...(filters.type_chambre
                ? { type_chambre: filters.type_chambre }
                : {}),
            ...(filters.prix_min
                ? { prix_par_nuit: { gte: parseFloat(filters.prix_min) } }
                : {}),
            ...(filters.prix_max
                ? { prix_par_nuit: { lte: parseFloat(filters.prix_max) } }
                : {}),
            ...(filters.etat ? { etat: filters.etat } : {})
        };

        // Récupérer les hébergements avec pagination
        const [hebergements, total] = await Promise.all([
            prisma.chambre.findMany({
                where,
                skip,
                take: limit,
                include: {
                    equipements: {
                        include: {
                            equipement: true
                        }
                    },
                    medias: true
                },
                orderBy: {
                    id_chambre: 'asc'
                }
            }),
            prisma.chambre.count({ where })
        ]);

        return {
            data: hebergements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Récupère un hébergement par son ID
     * @param {number} id - ID de l'hébergement
     * @returns {Promise<Object>} - Hébergement
     */
    static async findById(id) {
        return prisma.chambre.findUnique({
            where: { id_chambre: id },
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                },
                medias: true
            }
        });
    }

    /**
     * Récupère un média par son ID
     * @param {number} id - ID du média
     * @returns {Promise<Object>} - Média
     */
    static async findMediaById(id) {
        return prisma.media.findUnique({
            where: { id_media: id }
        });
    }

    /**
     * Vérifie la disponibilité d'un hébergement
     * @param {number} id - ID de l'hébergement
     * @param {string} dateArrivee - Date d'arrivée
     * @param {string} dateDepart - Date de départ
     * @returns {Promise<boolean>} - Disponibilité
     */
    static async checkAvailability(id, dateArrivee, dateDepart) {
        const reservations = await prisma.reservationsChambre.findMany({
            where: {
                id_chambre: id,
                OR: [
                    {
                        AND: [
                            { date_arrivee: { lte: new Date(dateArrivee) } },
                            { date_depart: { gt: new Date(dateArrivee) } }
                        ]
                    },
                    {
                        AND: [
                            { date_arrivee: { lt: new Date(dateDepart) } },
                            { date_depart: { gte: new Date(dateDepart) } }
                        ]
                    },
                    {
                        AND: [
                            { date_arrivee: { gte: new Date(dateArrivee) } },
                            { date_depart: { lte: new Date(dateDepart) } }
                        ]
                    }
                ],
                reservation: {
                    etat: {
                        notIn: ['annulee']
                    }
                }
            }
        });

        return reservations.length === 0;
    }

    /**
     * Recherche des hébergements disponibles
     * @param {string} dateArrivee - Date d'arrivée
     * @param {string} dateDepart - Date de départ
     * @param {Object} filters - Filtres à appliquer
     * @param {number} page - Numéro de page
     * @param {number} limit - Nombre d'éléments par page
     * @returns {Promise<Object>} - Hébergements disponibles paginés
     */
    static async findAvailable(
        dateArrivee,
        dateDepart,
        filters = {},
        page = 1,
        limit = 10
    ) {
        const skip = (page - 1) * limit;

        // Récupérer les IDs des chambres réservées pour la période
        const reservedRoomIds = await prisma.reservationsChambre.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            { date_arrivee: { lte: new Date(dateArrivee) } },
                            { date_depart: { gt: new Date(dateArrivee) } }
                        ]
                    },
                    {
                        AND: [
                            { date_arrivee: { lt: new Date(dateDepart) } },
                            { date_depart: { gte: new Date(dateDepart) } }
                        ]
                    },
                    {
                        AND: [
                            { date_arrivee: { gte: new Date(dateArrivee) } },
                            { date_depart: { lte: new Date(dateDepart) } }
                        ]
                    }
                ],
                reservation: {
                    etat: {
                        notIn: ['annulee']
                    }
                }
            },
            select: {
                id_chambre: true
            }
        });

        const reservedIds = reservedRoomIds.map((r) => r.id_chambre);

        // Construire les filtres
        const where = {
            id_chambre: {
                notIn: reservedIds
            },
            ...(filters.type_chambre
                ? { type_chambre: filters.type_chambre }
                : {}),
            ...(filters.prix_min
                ? { prix_par_nuit: { gte: parseFloat(filters.prix_min) } }
                : {}),
            ...(filters.prix_max
                ? { prix_par_nuit: { lte: parseFloat(filters.prix_max) } }
                : {}),
            etat: 'disponible'
        };

        // Récupérer les hébergements disponibles avec pagination
        const [hebergements, total] = await Promise.all([
            prisma.chambre.findMany({
                where,
                skip,
                take: limit,
                include: {
                    equipements: {
                        include: {
                            equipement: true
                        }
                    },
                    medias: true
                },
                orderBy: {
                    prix_par_nuit: 'asc'
                }
            }),
            prisma.chambre.count({ where })
        ]);

        return {
            data: hebergements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Crée un nouvel hébergement
     * @param {Object} data - Données de l'hébergement
     * @returns {Promise<Object>} - Hébergement créé
     */
    static async create(data) {
        const { equipements, ...chambreData } = data;

        return prisma.chambre.create({
            data: {
                numero_chambre: chambreData.numero_chambre,
                type_chambre: chambreData.type_chambre,
                prix_par_nuit: parseFloat(chambreData.prix_par_nuit),
                etat: chambreData.etat || 'disponible',
                description: chambreData.description,
                modifie_par: chambreData.modifie_par,
                date_modification: chambreData.date_modification,
                ...(equipements && equipements.length > 0
                    ? {
                          equipements: {
                              create: equipements.map((id_equipement) => ({
                                  equipement: {
                                      connect: {
                                          id_equipement: parseInt(id_equipement)
                                      }
                                  }
                              }))
                          }
                      }
                    : {})
            },
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                }
            }
        });
    }

    /**
     * Met à jour un hébergement
     * @param {number} id - ID de l'hébergement
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<Object>} - Hébergement mis à jour
     */
    static async update(id, data) {
        const { equipements, ...chambreData } = data;

        // Si des équipements sont fournis, mettre à jour les relations
        if (equipements && equipements.length > 0) {
            // Supprimer les relations existantes
            await prisma.chambresEquipements.deleteMany({
                where: { id_chambre: id }
            });

            // Créer les nouvelles relations
            await Promise.all(
                equipements.map((id_equipement) =>
                    prisma.chambresEquipements.create({
                        data: {
                            id_chambre: id,
                            id_equipement: parseInt(id_equipement)
                        }
                    })
                )
            );
        }

        // Mettre à jour la chambre
        return prisma.chambre.update({
            where: { id_chambre: id },
            data: chambreData,
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                },
                medias: true
            }
        });
    }

    /**
     * Supprime un hébergement
     * @param {number} id - ID de l'hébergement
     * @returns {Promise<void>}
     */
    static async delete(id) {
        // Vérifier s'il y a des réservations futures pour cette chambre
        const futureReservations = await prisma.reservationsChambre.findMany({
            where: {
                id_chambre: id,
                date_depart: {
                    gt: new Date()
                },
                reservation: {
                    etat: {
                        notIn: ['annulee']
                    }
                }
            }
        });

        if (futureReservations.length > 0) {
            throw new Error(
                'Impossible de supprimer cet hébergement car il a des réservations futures'
            );
        }

        // Supprimer les relations avec les équipements
        await prisma.chambresEquipements.deleteMany({
            where: { id_chambre: id }
        });

        // Supprimer les médias associés
        await prisma.media.deleteMany({
            where: { id_chambre: id }
        });

        // Supprimer la chambre
        await prisma.chambre.delete({
            where: { id_chambre: id }
        });
    }

    /**
     * Ajoute un média à un hébergement
     * @param {number} id - ID de l'hébergement
     * @param {Object} mediaData - Données du média
     * @returns {Promise<Object>} - Média ajouté
     */
    static async addMedia(id, mediaData) {
        return prisma.media.create({
            data: {
                id_chambre: id,
                type_media: mediaData.type_media,
                url: mediaData.url,
                titre: mediaData.titre,
                description: mediaData.description
            }
        });
    }

    /**
     * Supprime un média d'un hébergement
     * @param {number} id - ID de l'hébergement
     * @param {number} mediaId - ID du média
     * @returns {Promise<void>}
     */
    static async removeMedia(id, mediaId) {
        await prisma.media.delete({
            where: {
                id_media: mediaId,
                id_chambre: id
            }
        });
    }

    /**
     * Ajoute un équipement à une chambre
     * @param {number} idChambre - ID de la chambre
     * @param {number} idEquipement - ID de l'équipement
     * @returns {Promise<Object>} - La relation créée
     */
    static async addEquipement(idChambre, idEquipement) {
        return prisma.chambresEquipements.create({
            data: {
                id_chambre: idChambre,
                id_equipement: idEquipement
            }
        });
    }

    /**
     * Supprime un équipement d'une chambre
     * @param {number} idChambre - ID de la chambre
     * @param {number} idEquipement - ID de l'équipement
     * @returns {Promise<Object>} - La relation supprimée
     */
    static async removeEquipement(idChambre, idEquipement) {
        return prisma.chambresEquipements.delete({
            where: {
                id_chambre_id_equipement: {
                    id_chambre: idChambre,
                    id_equipement: idEquipement
                }
            }
        });
    }
}

export default HebergementModel;
