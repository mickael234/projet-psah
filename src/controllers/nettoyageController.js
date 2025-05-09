import { RoleMapper } from "../utils/roleMapper.js"
import NettoyageModel from "../models/nettoyage.model.js"
import prisma from "../config/prisma.js"

class NettoyageController {
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
   * Enregistre une opération de nettoyage pour un hébergement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async enregistrerNettoyage(req, res) {
    try {
      // Vérifier les permissions
      if (
        !NettoyageController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour enregistrer un nettoyage",
        })
      }

      const { id_chambre } = req.params
      const { notes, fournitures_utilisees } = req.body

      // Validation des données
      if (!id_chambre) {
        return res.status(400).json({
          status: "ERROR",
          message: "L'ID de la chambre est requis",
        })
      }

      // Vérifier si la chambre existe
      const chambre = await prisma.chambre.findUnique({
        where: { id_chambre: Number.parseInt(id_chambre) },
      })

      if (!chambre) {
        return res.status(404).json({
          status: "ERROR",
          message: "Chambre non trouvée",
        })
      }

      // Créer l'opération de nettoyage
      const nettoyage = await NettoyageModel.create({
        id_chambre: Number.parseInt(id_chambre),
        id_utilisateur: req.user.userId || null,
        date_nettoyage: new Date(),
        notes: notes || null,
      })

      // Enregistrer les fournitures utilisées si fournies
      if (fournitures_utilisees && Array.isArray(fournitures_utilisees) && fournitures_utilisees.length > 0) {
        await NettoyageModel.enregistrerFournituresUtilisees(nettoyage.id_nettoyage, fournitures_utilisees)
      }

      // Mettre à jour le statut de la chambre à "disponible"
      await prisma.chambre.update({
        where: { id_chambre: Number.parseInt(id_chambre) },
        data: {
          etat: "disponible",
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
              id_ressource: Number.parseInt(id_chambre),
              action: "nettoyage",
              details: {
                date: new Date().toISOString(),
                notes: notes || "Nettoyage effectué",
              },
            },
          })
        } catch (journalError) {
          console.error("Erreur lors de la création du journal:", journalError)
          // Ne pas bloquer la réponse si le journal échoue
        }
      }

      res.status(201).json({
        status: "OK",
        message: "Nettoyage enregistré avec succès",
        data: {
          nettoyage,
          chambre_statut: "disponible",
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'enregistrement du nettoyage",
        error: error.message,
      })
    }
  }

  /**
   * Récupère l'historique des nettoyages pour un hébergement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getHistoriqueNettoyage(req, res) {
    try {
      const { id_chambre } = req.params
      const { page = 1, limit = 10 } = req.query

      // Récupérer l'historique des nettoyages
      const nettoyages = await NettoyageModel.getHistoriqueByChambre(
        Number.parseInt(id_chambre),
        Number.parseInt(page),
        Number.parseInt(limit),
      )

      const total = await prisma.nettoyage.count({
        where: { id_chambre: Number.parseInt(id_chambre) },
      })

      res.status(200).json({
        status: "OK",
        message: "Historique des nettoyages récupéré avec succès",
        data: {
          nettoyages,
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
        message: "Erreur lors de la récupération de l'historique des nettoyages",
        error: error.message,
      })
    }
  }
}

export default NettoyageController
