import { PrismaClient } from "@prisma/client"
import { RoleMapper } from "../utils/roleMapper.js"
const prisma = new PrismaClient()
import { authenticateJWT } from '../middleware/auth.js';
import ReservationModel from '../models/reservation.model.js';

class ReservationController {
  /**
   * Vérifie si l'utilisateur a les permissions nécessaires
   * @param {Object} req - Requête Express
   * @param {Array} rolesAutorises - Rôles autorisés
   * @returns {boolean} - L'utilisateur a-t-il les permissions
   */
  static verifierPermissions(req, rolesAutorises) {
    if (!req.user) return false

    // Utiliser le service RoleMapper pour vérifier les permissions
    return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
  }

  /**
   * Récupère toutes les réservations avec filtres optionnels
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getAllReservations(req, res) {
    try {
      const { page = 1, limit = 10, etat, clientId, dateDebut, dateFin } = req.query
      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

            // Construire les filtres
            const where = {
                ...(etat ? { etat } : {}),
                ...(clientId ? { id_client: Number.parseInt(clientId) } : {}),
                supprime_le: null // Exclure les réservations supprimées
            };

            // Filtrer par période si spécifié
            if (dateDebut || dateFin) {
                where.chambres = {
                    some: {
                        ...(dateDebut && dateFin
                            ? {
                                  OR: [
                                      {
                                          AND: [
                                              {
                                                  date_arrivee: {
                                                      lte: new Date(dateDebut)
                                                  }
                                              },
                                              {
                                                  date_depart: {
                                                      gt: new Date(dateDebut)
                                                  }
                                              }
                                          ]
                                      },
                                      {
                                          AND: [
                                              {
                                                  date_arrivee: {
                                                      lt: new Date(dateFin)
                                                  }
                                              },
                                              {
                                                  date_depart: {
                                                      gte: new Date(dateFin)
                                                  }
                                              }
                                          ]
                                      },
                                      {
                                          AND: [
                                              {
                                                  date_arrivee: {
                                                      gte: new Date(dateDebut)
                                                  }
                                              },
                                              {
                                                  date_depart: {
                                                      lte: new Date(dateFin)
                                                  }
                                              }
                                          ]
                                      }
                                  ]
                              }
                            : {}),
                        ...(dateDebut && !dateFin
                            ? {
                                  date_arrivee: { gte: new Date(dateDebut) }
                              }
                            : {}),
                        ...(!dateDebut && dateFin
                            ? {
                                  date_depart: { lte: new Date(dateFin) }
                              }
                            : {})
                    }
                };
            }

            // Récupérer les réservations avec pagination
            const [reservations, total] = await Promise.all([
                prisma.reservation.findMany({
                    where,
                    skip,
                    take: Number.parseInt(limit),
                    include: {
                        client: true,
                        chambres: {
                            include: {
                                chambre: true
                            }
                        },
                        services: {
                            include: {
                                service: true
                            }
                        },
                        paiements: true
                    },
                    orderBy: {
                        date_reservation: 'desc'
                    }
                }),
                prisma.reservation.count({ where })
            ]);

            res.status(200).json({
                status: 'OK',
                message: 'Réservations récupérées avec succès',
                data: {
                    data: reservations,
                    pagination: {
                        total,
                        page: Number.parseInt(page),
                        limit: Number.parseInt(limit),
                        pages: Math.ceil(total / Number.parseInt(limit))
                    }
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des réservations',
                error: error.message
            });
        }
    }

    /**
     * Récupère une réservation par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getReservationById(req, res) {
        try {
            const { id } = req.params;

            const reservation = await prisma.reservation.findUnique({
                where: {
                    id_reservation: Number.parseInt(id),
                    supprime_le: null // Ajouter cette condition pour exclure les réservations supprimées
                },
                include: {
                    client: true,
                    chambres: {
                        include: {
                            chambre: true
                        }
                    },
                    services: {
                        include: {
                            service: true
                        }
                    },
                    paiements: true,
                    avis: true
                }
            });

            if (!reservation) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Réservation non trouvée ou supprimée'
                });
            }

            res.status(200).json({
                status: 'OK',
                message: 'Réservation récupérée avec succès',
                data: reservation
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération de la réservation',
                error: error.message
            });
        }
    }

  /**
   * Crée une nouvelle réservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async createReservation(req, res) {
    try {
      const { id_client, chambres, services, etat = "en_attente", source_reservation } = req.body
  
      // Validation des données
      if (!id_client || !chambres || chambres.length === 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "Client et au moins une chambre sont requis",
        })
      }
  
      // Vérifier si le client existe
      const clientExists = await prisma.client.findUnique({
        where: { id_client: Number.parseInt(id_client) },
      })
  
      if (!clientExists) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le client spécifié n'existe pas",
        })
      }
  
      // Vérifier la disponibilité des chambres
      for (const chambre of chambres) {
        const { id_chambre, date_arrivee, date_depart } = chambre
  
        const isAvailable = await prisma.$transaction(async (tx) => {
          const reservedRooms = await tx.reservationsChambre.findMany({
            where: {
              id_chambre: Number.parseInt(id_chambre),
              OR: [
                {
                  AND: [
                    { date_arrivee: { lte: new Date(date_arrivee) } },
                    { date_depart: { gt: new Date(date_arrivee) } },
                  ],
                },
                {
                  AND: [
                    { date_arrivee: { lt: new Date(date_depart) } },
                    { date_depart: { gte: new Date(date_depart) } },
                  ],
                },
                {
                  AND: [
                    { date_arrivee: { gte: new Date(date_arrivee) } },
                    { date_depart: { lte: new Date(date_depart) } },
                  ],
                },
              ],
              reservation: {
                etat: {
                  notIn: ["annulee"],
                },
                supprime_le: null, // Exclure les réservations supprimées
              },
            },
          })
  
          return reservedRooms.length === 0
        })
  
        if (!isAvailable) {
          return res.status(400).json({
            status: "ERROR",
            message: `La chambre ${id_chambre} n'est pas disponible pour les dates sélectionnées`,
          })
        }
      }
  
      let prix_total = 0;

    // Calcul du prix total
    for (const chambre of chambres) {
      const { id_chambre, date_arrivee, date_depart } = chambre;
      
      const chambreDetails = await prisma.chambre.findUnique({
        where: { id_chambre: Number.parseInt(id_chambre) },
        select: { prix_par_nuit: true },
      });

      if (chambreDetails && chambreDetails.prix_par_nuit) {
        const prix_par_nuit = chambreDetails.prix_par_nuit;
        const dateArrivee = new Date(date_arrivee);
        const dateDepart = new Date(date_depart);
        const nbNuits = Math.ceil((dateDepart - dateArrivee) / (1000 * 60 * 60 * 24)); // Calcul des nuits

        prix_total += prix_par_nuit * nbNuits;
      } else {
        return res.status(400).json({
          status: "ERROR",
          message: `Le prix de la chambre ${id_chambre} est introuvable.`,
        });
      }
    }

    // Si prix_total est NaN
    if (isNaN(prix_total)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Le prix total est invalide.",
      });
    }

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        id_client: Number.parseInt(id_client),
        date_reservation: new Date(),
        etat,
        prix_total: prix_total.toFixed(2),  // Pas besoin de Prisma.Decimal, juste un string avec 2 décimales
        etat_paiement: "en_attente",
        source_reservation,
        chambres: {
          create: chambres.map((chambre) => ({
            chambre: {
              connect: { id_chambre: Number.parseInt(chambre.id_chambre) },
            },
            date_arrivee: new Date(chambre.date_arrivee),
            date_depart: new Date(chambre.date_depart),
          })),
        },
        ...(services && services.length > 0
          ? {
              services: {
                create: services.map((service) => ({
                  service: {
                    connect: { id_service: Number.parseInt(service.id_service) },
                  },
                  date_demande: new Date(),
                  quantite: service.quantite || 1,
                })),
              },
            }
          : {}),
      },
      include: {
        client: true,
        chambres: {
          include: {
            chambre: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: "OK",
      message: "Réservation créée avec succès",
      data: reservation,
    })

    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la création de la réservation",
        error: error.message,
      })
    }
  }

    /**
     * Met à jour une réservation
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const { etat, prix_total, etat_paiement } = req.body;

            // Vérifier si la réservation existe et n'est pas supprimée
            const existingReservation = await prisma.reservation.findFirst({
                where: {
                    id_reservation: Number.parseInt(id),
                    supprime_le: null
                }
            });

            if (!existingReservation) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Réservation non trouvée ou supprimée'
                });
            }

            // Mettre à jour la réservation
            const reservation = await prisma.reservation.update({
                where: { id_reservation: Number.parseInt(id) },
                data: {
                    ...(etat ? { etat } : {}),
                    ...(prix_total ? { prix_total } : {}),
                    ...(etat_paiement ? { etat_paiement } : {})
                },
                include: {
                    client: true,
                    chambres: {
                        include: {
                            chambre: true
                        }
                    },
                    services: {
                        include: {
                            service: true
                        }
                    },
                    paiements: true
                }
            });

            res.status(200).json({
                status: 'OK',
                message: 'Réservation mise à jour avec succès',
                data: reservation
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour de la réservation',
                error: error.message
            });
        }
    }

    /**
     * Annule une réservation
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async cancelReservation(req, res) {
        try {
            const { id } = req.params;

            // Vérifier si la réservation existe et n'est pas supprimée
            const existingReservation = await prisma.reservation.findFirst({
                where: {
                    id_reservation: Number.parseInt(id),
                    supprime_le: null
                }
            });

            if (!existingReservation) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Réservation non trouvée ou supprimée'
                });
            }

            // Mettre à jour la réservation
            const reservation = await prisma.reservation.update({
                where: { id_reservation: Number.parseInt(id) },
                data: {
                    etat: 'annulee'
                }
            });

            res.status(200).json({
                status: 'OK',
                message: 'Réservation annulée avec succès',
                data: reservation
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de l'annulation de la réservation",
                error: error.message
            });
        }
    }

    /**
     * Supprime une réservation (suppression logique)
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteReservation(req, res) {
        try {
            const { id } = req.params;

            // Vérifier si la réservation existe et n'est pas déjà supprimée
            const existingReservation = await prisma.reservation.findFirst({
                where: {
                    id_reservation: Number.parseInt(id),
                    supprime_le: null
                }
            });

            if (!existingReservation) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Réservation non trouvée ou déjà supprimée'
                });
            }

            // Suppression logique
            const reservation = await prisma.reservation.update({
                where: { id_reservation: Number.parseInt(id) },
                data: {
                    supprime_le: new Date()
                }
            });

            res.status(200).json({
                status: 'OK',
                message: 'Réservation supprimée avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la suppression de la réservation',
                error: error.message
            });
        }
    }

    /**
     * Récupère toutes les réservations passées d'un client.
     *
     * @param {Express.Request} req - Requête contenant `clientId` dans les paramètres.
     * @param {Express.Response} res - Réponse pour renvoyer les données ou les erreurs.
     * @returns {Promise<void>}
     */
    static async getAllUserPastReservations(req, res) {
        try {
            const clientId = Number(req.params.clientId);

            const reservations =
                await ReservationModel.findAllPastReservations(clientId);
            if (!reservations || reservations.length === 0) {
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucune réservation passée n'a été trouvée"
                });
            }

            res.status(200).json({
                status: 'OK',
                data: {
                    reservations
                }
            });
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    /**
     * Récupère toutes les réservations actuelles d'un client.
     * @param {Express.Request} req - Requête contenant `clientId` dans les paramètres.
     * @param {Express.Response} res - Réponse pour renvoyer les données ou les erreurs.
     * @returns {Promise<void>}
     */
    static async getAllUserPresentReservations(req, res) {
        try {
            const clientId = Number(req.params.clientId);

            const reservations =
                await ReservationModel.findAllPresentReservations(clientId);
            if (!reservations || reservations.length === 0) {
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucune réservation actuelle n'a été trouvée"
                });
            }

            res.status(200).json({
                status: 'OK',
                data: {
                    reservations
                }
            });
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }
}

   


export default ReservationController;
