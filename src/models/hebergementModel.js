<<<<<<< HEAD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ChambreModel {
  /**
   * Récupère une chambre avec ses relations
   * @param {number} id - ID de la chambre
   * @returns {Promise<Object>} - La chambre avec ses relations
   */
  static getWithRelations(id) {
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
   * Récupère les chambres par type
   * @param {string} type - Type de chambre
   * @returns {Promise<Array>} - Liste des chambres
   */
  static findByType(type) {
    return prisma.chambre.findMany({
      where: { type_chambre: type }
    });
  }

  /**
   * Récupère les chambres disponibles
   * @returns {Promise<Array>} - Liste des chambres disponibles
   */
  static findAvailable() {
    return prisma.chambre.findMany({
      where: { etat: 'disponible' }
    });
  }

  /**
   * Crée une nouvelle chambre
   * @param {Object} chambreData - Données de la chambre
   * @param {Array} equipements - IDs des équipements
   * @returns {Promise<Object>} - La chambre créée
   */
  async create(chambreData, equipements = []) {
    // Créer la chambre
    const chambre = await prisma.chambre.create({
      data: chambreData
    });
    
    // Ajouter les équipements
    if (equipements.length > 0) {
      for (const idEquipement of equipements) {
        await prisma.chambresEquipements.create({
          data: {
            id_chambre: chambre.id_chambre,
            id_equipement: idEquipement
          }
        });
      }
    }
    
    return ChambreModel.getWithRelations(chambre.id_chambre);
  }

  /**
   * Récupère une chambre par son ID
   * @param {number} id - ID de la chambre
   * @returns {Promise<Object>} - La chambre trouvée
   */
  async findById(id) {
    return ChambreModel.getWithRelations(id);
  }

  /**
   * Récupère toutes les chambres
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} - Liste des chambres
   */
  async findAll(filters = {}) {
    return prisma.chambre.findMany({
      where: filters,
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
   * Met à jour une chambre
   * @param {number} id - ID de la chambre
   * @param {Object} chambreData - Nouvelles données
   * @returns {Promise<Object>} - La chambre mise à jour
   */
  async update(id, chambreData) {
    return prisma.chambre.update({
      where: { id_chambre: id },
      data: chambreData
    });
  }

  /**
   * Supprime une chambre
   * @param {number} id - ID de la chambre
   * @returns {Promise<Object>} - La chambre supprimée
   */
  async delete(id) {
    // Supprimer d'abord les relations
    await prisma.chambresEquipements.deleteMany({
      where: { id_chambre: id }
    });
    
    await prisma.media.deleteMany({
      where: { id_chambre: id }
    });
    
    return prisma.chambre.delete({
      where: { id_chambre: id }
    });
  }

  /**
   * Met à jour l'état d'une chambre
   * @param {number} id - ID de la chambre
   * @param {string} etat - Nouvel état
   * @returns {Promise<Object>} - La chambre mise à jour
   */
  async updateEtat(id, etat) {
    return prisma.chambre.update({
      where: { id_chambre: id },
      data: { etat }
    });
  }

  /**
   * Ajoute un équipement à une chambre
   * @param {number} idChambre - ID de la chambre
   * @param {number} idEquipement - ID de l'équipement
   * @returns {Promise<Object>} - La relation créée
   */
  async addEquipement(idChambre, idEquipement) {
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
  async removeEquipement(idChambre, idEquipement) {
    return prisma.chambresEquipements.delete({
      where: {
        id_chambre_id_equipement: {
          id_chambre: idChambre,
          id_equipement: idEquipement
        }
      }
    });
  }

  /**
   * Récupère les chambres par type
   * @param {string} type - Type de chambre
   * @returns {Promise<Array>} - Liste des chambres
   */
  /*async findByType(type) {
    return prisma.chambre.findMany({
      where: { type_chambre: type },
      include: {
        equipements: {
          include: {
            equipement: true
          }
        },
        medias: true
      }
    });
  }*/

  /**
   * Récupère les chambres disponibles
   * @returns {Promise<Array>} - Liste des chambres disponibles
   */
  /*async findAvailable() {
    return prisma.chambre.findMany({
      where: { etat: 'disponible' },
      include: {
        equipements: {
          include: {
            equipement: true
          }
        },
        medias: true
      }
    });
  }*/

  /**
   * Met à jour le prix d'une chambre et enregistre l'historique
   * @param {number} id - ID de la chambre
   * @param {number} nouveauPrix - Nouveau prix
   * @param {string} modifiePar - Qui a modifié le prix
   * @returns {Promise<Object>} - La chambre mise à jour
   */
  async updatePrix(id, nouveauPrix, modifiePar) {
    const chambre = await this.findById(id);
    
    // Enregistrer l'historique
    await prisma.historiquePrix.create({
      data: {
        id_chambre: id,
        ancien_prix: chambre.prix_par_nuit,
        nouveau_prix: nouveauPrix,
        modifie_par: modifiePar
      }
    });
    
    // Mettre à jour le prix
    return prisma.chambre.update({
      where: { id_chambre: id },
      data: { prix_par_nuit: nouveauPrix }
    });
  }
}

module.exports = ChambreModel;
=======
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
    /**
     * mettre à jour l ' etat d'un hebergement
     * @param {number} id - ID de l'hébergement
     * @param {string} etat- Etat de l'hebergement
     * @returns {Promise<Object>}
     */
    static async updateAvailability(id, etat) {
        const ETATS_VALIDES = ['disponible', 'occupe', 'maintenance'];
        if (typeof id !== 'number') {
            throw new TypeError("L'identifiant (id) doit être un nombre.");
        }
        if (!ETATS_VALIDES.includes(etat)) {
            throw new Error(
                `L'état "${etat}" n'est pas valide. États valides : ${ETATS_VALIDES.join(', ')}`
            );
        }
        const updatedChambre = await prisma.chambre.update({
            where: {
                id_chambre: id
            },
            data: {
                etat: etat
            }
        });
        return {
            ...updatedChambre,
            prix_par_nuit: Number(updatedChambre.prix_par_nuit)
        };
    }

    /**
     * mettre à jour le prix par nuit  d'un hebergement
     * @param {number} id - ID de l'hébergement
     * @param {number(10,2)} prix_par_nuit- Prix par nuit
     * @returns {Promise<Object>}
     */
    static async updatePrice(id, prix_par_nuit) {
        if (typeof id !== 'number') {
            throw new TypeError("L'identifiant (id) doit être un nombre.");
        }
        if (typeof prix_par_nuit != 'number') {
            throw new TypeError(
                'Le prix par nuit (prix_par_nuit) doit être un nombre.'
            );
        }

        const updatedChambre = await prisma.chambre.update({
            where: {
                id_chambre: id
            },
            data: {
                prix_par_nuit: prix_par_nuit
            }
        });
        return {
            ...updatedChambre,
            prix_par_nuit: Number(updatedChambre.prix_par_nuit)
        };
    }
}

export default HebergementModel;
>>>>>>> origin/hassan
