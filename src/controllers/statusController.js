import prisma from "../config/prisma.js"
import { RoleMapper } from "../utils/roleMapper.js"

class StatusController {
  /**
   * Vérifie si l'utilisateur a les permissions nécessaires
   * @param {Object} req - Requête Express
   * @param {Array} rolesAutorises - Rôles autorisés
   * @returns {boolean} - L'utilisateur a-t-il les permissions
   */
  static verifierPermissions(req, rolesAutorises) {
    if (!req.user) return false
    return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
  }

  /**
   * Récupère le statut de tous les hébergements avec filtres optionnels
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getHebergementsStatus(req, res) {
    try {
      console.log("Requête reçue pour getHebergementsStatus")
      console.log("Query params:", req.query)
      console.log("User:", req.user) // Ajouter ce log pour vérifier l'utilisateur authentifié
      console.log("URL:", req.originalUrl) // Ajouter l'URL complète

      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          status: "ERROR",
          message: "Authentification requise",
        })
      }

      const { etat, type_chambre, page = 1, limit = 20 } = req.query

      // Construire les filtres
      const where = {}

      if (etat) {
        where.etat = etat
      }

      if (type_chambre) {
        where.type_chambre = type_chambre
      }

      try {
        // Récupérer les hébergements avec leur statut
        const [hebergements, total] = await Promise.all([
          prisma.chambre.findMany({
            where,
            select: {
              id_chambre: true,
              numero_chambre: true,
              type_chambre: true,
              etat: true,
              description: true,
              maintenances: {
                where: {
                  OR: [{ statut: "EN_ATTENTE" }, { statut: "EN_COURS" }],
                },
                orderBy: {
                  date: "desc",
                },
                take: 1,
              },
            },
            skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
            take: Number.parseInt(limit),
            orderBy: {
              numero_chambre: "asc",
            },
          }),
          prisma.chambre.count({ where }),
        ])

        // Formater les données pour l'affichage
        const formattedHebergements = hebergements.map((h) => ({
          id: h.id_chambre,
          numero: h.numero_chambre,
          type: h.type_chambre,
          etat: h.etat,
          description: h.description,
          maintenance_en_cours:
            h.maintenances && h.maintenances.length > 0
              ? {
                  id: h.maintenances[0].id_maintenance,
                  description: h.maintenances[0].description,
                  statut: h.maintenances[0].statut,
                  date: h.maintenances[0].date,
                }
              : null,
        }))

        res.status(200).json({
          status: "OK",
          message: "Statuts des hébergements récupérés avec succès",
          data: {
            hebergements: formattedHebergements,
            pagination: {
              total,
              page: Number.parseInt(page),
              limit: Number.parseInt(limit),
              pages: Math.ceil(total / Number.parseInt(limit)),
            },
          },
        })
      } catch (dbError) {
        console.error("Erreur de base de données:", dbError)
        res.status(500).json({
          status: "ERROR",
          message: "Erreur lors de la récupération des données de la base de données",
          error: dbError.message,
        })
      }
    } catch (error) {
      console.error("Erreur dans getHebergementsStatus:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération des statuts des hébergements",
        error: error.message,
      })
    }
  }

  /**
   * Route de test simple pour vérifier l'authentification
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static testStatus(req, res) {
    console.log("Requête reçue pour testStatus")
    console.log("URL:", req.originalUrl)
    console.log("User:", req.user)

    res.status(200).json({
      status: "OK",
      message: "Test de statut réussi",
      user: req.user ? { id: req.user.userId, role: req.user.role } : null,
    })
  }

  /**
   * Met à jour le statut d'un hébergement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updateHebergementStatus(req, res) {
    try {
      console.log("Requête reçue pour updateHebergementStatus")
      console.log("Params:", req.params)
      console.log("Body:", req.body)
      console.log("User:", req.user)
      console.log("URL:", req.originalUrl)

      // Vérifier les permissions
      if (
        !StatusController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour modifier le statut d'un hébergement",
        })
      }

      const { id } = req.params
      const { etat, notes } = req.body

      // Validation des données
      if (!etat) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le statut est requis",
        })
      }

      // Vérifier que le statut est valide
      const validStatuts = ["disponible", "occupee", "maintenance"]
      if (!validStatuts.includes(etat)) {
        return res.status(400).json({
          status: "ERROR",
          message: `Statut invalide. Les valeurs acceptées sont: ${validStatuts.join(", ")}`,
        })
      }

      // Vérifier si l'hébergement existe
      const hebergement = await prisma.chambre.findUnique({
        where: { id_chambre: Number.parseInt(id) },
      })

      if (!hebergement) {
        return res.status(404).json({
          status: "ERROR",
          message: "Hébergement non trouvé",
        })
      }

      // Mettre à jour le statut de l'hébergement
      const updatedHebergement = await prisma.chambre.update({
        where: { id_chambre: Number.parseInt(id) },
        data: {
          etat,
          modifie_par: req.user.userId || null,
          date_modification: new Date(),
        },
      })

      // Créer une entrée dans le journal des modifications
      if (req.user && req.user.userId) {
        try {
          await prisma.journalModifications.create({
            data: {
              id_utilisateur: req.user.userId,
              type_ressource: "chambre",
              id_ressource: Number.parseInt(id),
              action: "modification_statut",
              details: {
                ancien_statut: hebergement.etat,
                nouveau_statut: etat,
                notes: notes || null,
              },
            },
          })
        } catch (journalError) {
          console.error("Erreur lors de la création du journal:", journalError)
          // Ne pas bloquer la réponse si le journal échoue
        }
      }

      // Si le statut est passé à "maintenance", créer une entrée de maintenance
      if (etat === "maintenance" && hebergement.etat !== "maintenance") {
        try {
          await prisma.maintenance.create({
            data: {
              id_chambre: Number.parseInt(id),
              description: notes || "Mise en maintenance",
              date: new Date(),
              statut: "EN_ATTENTE",
              priorite: "NORMALE",
            },
          })

          // Créer une notification pour le personnel de maintenance
          await prisma.notification.create({
            data: {
              id_utilisateur: req.user.userId || 1, // Utilisateur par défaut si non disponible
              type: "MAINTENANCE",
              contenu: `Chambre ${hebergement.numero_chambre} mise en maintenance: ${notes || "Aucune note"}`,
              etat: "non_lu",
              priorite: "NORMALE",
              envoye_le: new Date(),
            },
          })
        } catch (maintenanceError) {
          console.error("Erreur lors de la création de la maintenance:", maintenanceError)
          // Ne pas bloquer la réponse si la création de maintenance échoue
        }
      }

      res.status(200).json({
        status: "OK",
        message: "Statut de l'hébergement mis à jour avec succès",
        data: updatedHebergement,
      })
    } catch (error) {
      console.error("Erreur dans updateHebergementStatus:", error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la mise à jour du statut de l'hébergement",
        error: error.message,
      })
    }
  }
}

export default StatusController
