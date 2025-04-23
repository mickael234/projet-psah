import { PrismaClient } from "@prisma/client"; 
import { RoleMapper } from "../utils/roleMapper.js"
const prisma = new PrismaClient()

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
        supprime_le: null, // Exclure les réservations supprimées
      }

      // Filtrer par période si spécifié
      if (dateDebut || dateFin) {
        where.chambres = {
          some: {
            ...(dateDebut && dateFin
              ? {
                  OR: [
                    {
                      AND: [
                        { date_arrivee: { lte: new Date(dateDebut) } },
                        { date_depart: { gt: new Date(dateDebut) } },
                      ],
                    },
                    {
                      AND: [{ date_arrivee: { lt: new Date(dateFin) } }, { date_depart: { gte: new Date(dateFin) } }],
                    },
                    {
                      AND: [
                        { date_arrivee: { gte: new Date(dateDebut) } },
                        { date_depart: { lte: new Date(dateFin) } },
                      ],
                    },
                  ],
                }
              : {}),
            ...(dateDebut && !dateFin
              ? {
                  date_arrivee: { gte: new Date(dateDebut) },
                }
              : {}),
            ...(!dateDebut && dateFin
              ? {
                  date_depart: { lte: new Date(dateFin) },
                }
              : {}),
          },
        }
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
                chambre: true,
              },
            },
            services: {
              include: {
                service: true,
              },
            },
            paiements: true,
          },
          orderBy: {
            date_reservation: "desc",
          },
        }),
        prisma.reservation.count({ where }),
      ])

      res.status(200).json({
        status: "OK",
        message: "Réservations récupérées avec succès",
        data: {
          data: reservations,
          pagination: {
            total,
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            pages: Math.ceil(total / Number.parseInt(limit)),
          },
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération des réservations",
        error: error.message,
      })
    }
  }

  /**
   * Récupère une réservation par son ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getReservationById(req, res) {
    try {
      const { id } = req.params

      const reservation = await prisma.reservation.findUnique({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null, // Ajouter cette condition pour exclure les réservations supprimées
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
          paiements: true,
          avis: true,
        },
      })

      if (!reservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Réservation récupérée avec succès",
        data: reservation,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération de la réservation",
        error: error.message,
      })
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
      const { id } = req.params
      const { etat, prix_total, etat_paiement } = req.body

      // Vérifier si la réservation existe et n'est pas supprimée
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
      })

      if (!existingReservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      // Mettre à jour la réservation
      const reservation = await prisma.reservation.update({
        where: { id_reservation: Number.parseInt(id) },
        data: {
          ...(etat ? { etat } : {}),
          ...(prix_total ? { prix_total } : {}),
          ...(etat_paiement ? { etat_paiement } : {}),
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
          paiements: true,
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Réservation mise à jour avec succès",
        data: reservation,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la mise à jour de la réservation",
        error: error.message,
      })
    }
  }

  /**
   * Annule une réservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async cancelReservation(req, res) {
    try {
      const { id } = req.params

      // Vérifier si la réservation existe et n'est pas supprimée
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
      })

      if (!existingReservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      // Mettre à jour la réservation
      const reservation = await prisma.reservation.update({
        where: { id_reservation: Number.parseInt(id) },
        data: {
          etat: "annulee",
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Réservation annulée avec succès",
        data: reservation,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'annulation de la réservation",
        error: error.message,
      })
    }
  }

  /**
   * Supprime une réservation (suppression logique)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async deleteReservation(req, res) {
    try {
      const { id } = req.params

      // Vérifier si la réservation existe et n'est pas déjà supprimée
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
      })

      if (!existingReservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou déjà supprimée",
        })
      }

      // Suppression logique
      const reservation = await prisma.reservation.update({
        where: { id_reservation: Number.parseInt(id) },
        data: {
          supprime_le: new Date(),
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Réservation supprimée avec succès",
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la suppression de la réservation",
        error: error.message,
      })
    }
  }

  /**
   * Enregistre l'arrivée d'un client (check-in)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async checkIn(req, res) {
    try {
      // Vérifier les permissions (seuls le personnel et l'administrateur peuvent faire un check-in)
      if (
        !ReservationController.verifierPermissions(req, [
          "RECEPTIONNISTE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour effectuer un check-in",
        })
      }

      const { id } = req.params
      const { notes } = req.body

      // Vérifier si la réservation existe et n'est pas supprimée
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
        include: {
          chambres: true,
        },
      })

      if (!existingReservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      // Vérifier si la réservation est dans un état qui permet le check-in
      if (existingReservation.etat !== "confirmee" && existingReservation.etat !== "en_attente") {
        return res.status(400).json({
          status: "ERROR",
          message: `Impossible d'effectuer le check-in. La réservation est dans l'état "${existingReservation.etat}"`,
        })
      }

      // Mettre à jour l'état de la réservation
      const reservation = await prisma.reservation.update({
        where: { id_reservation: Number.parseInt(id) },
        data: {
          etat: "enregistree",
        },
        include: {
          client: true,
          chambres: {
            include: {
              chambre: true,
            },
          },
        },
      })

      // Mettre à jour l'état des chambres
      for (const chambreReservation of existingReservation.chambres) {
        await prisma.chambre.update({
          where: { id_chambre: chambreReservation.id_chambre },
          data: {
            etat: "occupee",
          },
        })
      }

      // CORRECTION: Vérifier si l'utilisateur existe avant d'ajouter une entrée dans le journal
      let userId = null

      if (req.user && req.user.userId) {
        // Vérifier si l'utilisateur existe dans la base de données
        const utilisateur = await prisma.utilisateur.findUnique({
          where: { id_utilisateur: req.user.userId },
        })

        if (utilisateur) {
          userId = req.user.userId
        }
      }

      // Si aucun utilisateur valide n'est trouvé, rechercher un utilisateur par défaut
      if (!userId) {
        // Rechercher un utilisateur avec un rôle approprié
        const defaultUser = await prisma.utilisateur.findFirst({
          where: {
            role: {
              in: ["personnel", "administrateur"],
            },
          },
        })

        if (defaultUser) {
          userId = defaultUser.id_utilisateur
        } else {
          // Si aucun utilisateur n'est trouvé, ne pas créer d'entrée dans le journal
          console.warn("Aucun utilisateur valide trouvé pour le journal des modifications")
        }
      }

      // Ajouter une entrée dans le journal des modifications seulement si un utilisateur valide est trouvé
      if (userId) {
        await prisma.journalModifications.create({
          data: {
            id_utilisateur: userId,
            type_ressource: "reservation",
            id_ressource: Number.parseInt(id),
            action: "check_in",
            details: {
              date: new Date().toISOString(),
              notes: notes || "Check-in effectué",
            },
          },
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Check-in effectué avec succès",
        data: reservation,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors du check-in",
        error: error.message,
      })
    }
  }

  /**
   * Enregistre le départ d'un client (check-out)
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async checkOut(req, res) {
    try {
      // Vérifier les permissions (seuls le personnel et l'administrateur peuvent faire un check-out)
      if (
        !ReservationController.verifierPermissions(req, [
          "RECEPTIONNISTE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour effectuer un check-out",
        })
      }

      const { id } = req.params
      const { notes } = req.body

      // Vérifier si la réservation existe et n'est pas supprimée
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
        include: {
          chambres: true,
          paiements: true,
        },
      })

      if (!existingReservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      // Vérifier si la réservation est dans un état qui permet le check-out
      if (existingReservation.etat !== "enregistree") {
        return res.status(400).json({
          status: "ERROR",
          message: `Impossible d'effectuer le check-out. La réservation est dans l'état "${existingReservation.etat}"`,
        })
      }

      // Vérifier si le paiement est complet
      const totalPaye = existingReservation.paiements
        .filter((p) => p.etat === "complete")
        .reduce((sum, p) => sum + Number(p.montant), 0)

      if (totalPaye < Number(existingReservation.prix_total)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Impossible d'effectuer le check-out. Le paiement n'est pas complet",
          data: {
            prixTotal: Number(existingReservation.prix_total),
            totalPaye: totalPaye,
            reste: Number(existingReservation.prix_total) - totalPaye,
          },
        })
      }

      // Mettre à jour l'état de la réservation
      const reservation = await prisma.reservation.update({
        where: { id_reservation: Number.parseInt(id) },
        data: {
          etat: "depart",
        },
        include: {
          client: true,
          chambres: {
            include: {
              chambre: true,
            },
          },
        },
      })

      // Mettre à jour l'état des chambres
      for (const chambreReservation of existingReservation.chambres) {
        await prisma.chambre.update({
          where: { id_chambre: chambreReservation.id_chambre },
          data: {
            etat: "disponible",
          },
        })
      }

      // CORRECTION: Vérifier si l'utilisateur existe avant d'ajouter une entrée dans le journal
      let userId = null

      if (req.user && req.user.userId) {
        // Vérifier si l'utilisateur existe dans la base de données
        const utilisateur = await prisma.utilisateur.findUnique({
          where: { id_utilisateur: req.user.userId },
        })

        if (utilisateur) {
          userId = req.user.userId
        }
      }

      // Si aucun utilisateur valide n'est trouvé, rechercher un utilisateur par défaut
      if (!userId) {
        // Rechercher un utilisateur avec un rôle approprié
        const defaultUser = await prisma.utilisateur.findFirst({
          where: {
            role: {
              in: ["personnel", "administrateur"],
            },
          },
        })

        if (defaultUser) {
          userId = defaultUser.id_utilisateur
        } else {
          // Si aucun utilisateur n'est trouvé, ne pas créer d'entrée dans le journal
          console.warn("Aucun utilisateur valide trouvé pour le journal des modifications")
        }
      }

      // Ajouter une entrée dans le journal des modifications seulement si un utilisateur valide est trouvé
      if (userId) {
        await prisma.journalModifications.create({
          data: {
            id_utilisateur: userId,
            type_ressource: "reservation",
            id_ressource: Number.parseInt(id),
            action: "check_out",
            details: {
              date: new Date().toISOString(),
              notes: notes || "Check-out effectué",
            },
          },
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Check-out effectué avec succès",
        data: reservation,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors du check-out",
        error: error.message,
      })
    }
  }
}

export default ReservationController
