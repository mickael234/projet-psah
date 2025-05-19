import prisma from "../config/prisma.js";
import { RoleMapper } from "../utils/roleMapper.js"
import FournitureModel from "../models/fourniture.model.js"


class FournitureController {
  /**
   * Vérifie si l'utilisateur a les permissions nécessaires
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static verifierPermissions(req, rolesAutorises) {
    if (!req.user) return false
    return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
  }

  /**
   * Récupère toutes les fournitures avec filtres optionnels
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getAllFournitures(req, res) {
    try {
      const { categorie, stock_bas, page = 1, limit = 20 } = req.query

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

      // Construire les filtres
      const where = {}

      if (categorie) {
        where.categorie = categorie
      }

      if (stock_bas === "true") {
        where.quantite_stock = {
          lte: prisma.fourniture.fields.seuil_alerte,
        }
      }

      // Récupérer les fournitures
      const [fournitures, total] = await Promise.all([
        prisma.fourniture.findMany({
          where,
          orderBy: {
            nom: "asc",
          },
          skip,
          take: Number.parseInt(limit),
        }),
        prisma.fourniture.count({ where }),
      ])

      res.status(200).json({
        status: "OK",
        message: "Fournitures récupérées avec succès",
        data: {
          fournitures,
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
        message: "Erreur lors de la récupération des fournitures",
        error: error.message,
      })
    }
  }

  /**
   * Crée une nouvelle fourniture
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async createFourniture(req, res) {
    try {
      // Vérifier les permissions
      if (
        !FournitureController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour créer une fourniture",
        })
      }

      const { nom, description, categorie, quantite_stock, unite, prix_unitaire, seuil_alerte } = req.body

      // Validation des données
      if (!nom || !categorie || quantite_stock === undefined) {
        return res.status(400).json({
          status: "ERROR",
          message: "Nom, catégorie et quantité en stock sont requis",
        })
      }

      // Créer la fourniture
      const fourniture = await prisma.fourniture.create({
        data: {
          nom,
          description,
          categorie,
          quantite_stock: Number.parseInt(quantite_stock),
          unite: unite || "unité",
          prix_unitaire: prix_unitaire ? Number.parseFloat(prix_unitaire) : null,
          seuil_alerte: seuil_alerte ? Number.parseInt(seuil_alerte) : 5,
          date_creation: new Date(),
        },
      })

      // Créer une entrée dans le journal des modifications
      if (req.user && req.user.userId) {
        try {
          await prisma.journalModifications.create({
            data: {
              id_utilisateur: req.user.userId,
              type_ressource: "fourniture",
              id_ressource: fourniture.id_fourniture,
              action: "creation",
              details: {
                nom,
                categorie,
                quantite_stock,
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
        message: "Fourniture créée avec succès",
        data: fourniture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la création de la fourniture",
        error: error.message,
      })
    }
  }

  /**
   * Enregistre l'utilisation d'une fourniture
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async enregistrerUtilisation(req, res) {
    try {
      // Vérifier les permissions
      if (
        !FournitureController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour enregistrer l'utilisation d'une fourniture",
        })
      }

      const { id_fourniture } = req.params
      const { quantite, notes, id_chambre } = req.body

      // Validation des données
      if (!quantite || Number.parseInt(quantite) <= 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "Quantité valide requise",
        })
      }

      // Vérifier si la fourniture existe
      const fourniture = await prisma.fourniture.findUnique({
        where: { id_fourniture: Number.parseInt(id_fourniture) },
      })

      if (!fourniture) {
        return res.status(404).json({
          status: "ERROR",
          message: "Fourniture non trouvée",
        })
      }

      // Vérifier si le stock est suffisant
      if (fourniture.quantite_stock < Number.parseInt(quantite)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Stock insuffisant",
          data: {
            stock_disponible: fourniture.quantite_stock,
            quantite_demandee: Number.parseInt(quantite),
          },
        })
      }

      // Créer une utilisation indépendante (sans opération de nettoyage)
      const utilisation = await prisma.utilisationFourniture.create({
        data: {
          id_fourniture: Number.parseInt(id_fourniture),
          quantite: Number.parseInt(quantite),
          date: new Date(),
          notes: notes || null,
          id_chambre: id_chambre ? Number.parseInt(id_chambre) : null,
        },
      })

      // Mettre à jour le stock
      const stockMisAJour = await prisma.fourniture.update({
        where: { id_fourniture: Number.parseInt(id_fourniture) },
        data: {
          quantite_stock: fourniture.quantite_stock - Number.parseInt(quantite),
        },
      })

      // Vérifier si le stock est bas et créer une notification si nécessaire
      if (stockMisAJour.quantite_stock <= stockMisAJour.seuil_alerte) {
        await prisma.notification.create({
          data: {
            id_utilisateur: req.user.userId || 1,
            type: "STOCK_BAS",
            contenu: `Stock bas pour ${fourniture.nom} (${stockMisAJour.quantite_stock} ${stockMisAJour.unite} restants)`,
            etat: "non_lu",
            priorite: "HAUTE",
            envoye_le: new Date(),
          },
        })
      }

      // Créer une entrée dans le journal des modifications
      if (req.user && req.user.userId) {
        try {
          await prisma.journalModifications.create({
            data: {
              id_utilisateur: req.user.userId,
              type_ressource: "fourniture",
              id_ressource: Number.parseInt(id_fourniture),
              action: "utilisation",
              details: {
                quantite: Number.parseInt(quantite),
                stock_restant: stockMisAJour.quantite_stock,
                id_chambre: id_chambre || null,
                notes: notes || null,
              },
            },
          })
        } catch (journalError) {
          console.error("Erreur lors de la création du journal:", journalError)
          // Ne pas bloquer la réponse si le journal échoue
        }
      }

      res.status(200).json({
        status: "OK",
        message: "Utilisation enregistrée avec succès",
        data: {
          utilisation,
          stock_restant: stockMisAJour.quantite_stock,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'enregistrement de l'utilisation",
        error: error.message,
      })
    }
  }

  /**
   * Crée une commande de fournitures
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async creerCommande(req, res) {
    try {
      // Vérifier les permissions
      if (
        !FournitureController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour créer une commande",
        })
      }

      const { reference, fournisseur, details, date_livraison_prevue, notes } = req.body

      // Validation des données
      if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "Détails de la commande requis",
        })
      }

      // Créer la commande
      const commande = await prisma.commandeFourniture.create({
        data: {
          reference: reference || `CMD-${Date.now()}`,
          fournisseur,
          date_commande: new Date(),
          date_livraison_prevue: date_livraison_prevue ? new Date(date_livraison_prevue) : null,
          statut: "EN_ATTENTE",
          notes: notes || null,
          id_utilisateur: req.user.userId || null,
        },
      })

      // Ajouter les détails de la commande
      for (const detail of details) {
        if (detail.id_fourniture && detail.quantite) {
          await prisma.detailCommandeFourniture.create({
            data: {
              id_commande: commande.id_commande,
              id_fourniture: Number.parseInt(detail.id_fourniture),
              quantite: Number.parseInt(detail.quantite),
              prix_unitaire: detail.prix_unitaire ? Number.parseFloat(detail.prix_unitaire) : null,
            },
          })
        }
      }

      // Récupérer la commande complète avec ses détails
      const commandeComplete = await prisma.commandeFourniture.findUnique({
        where: { id_commande: commande.id_commande },
        include: {
          details: {
            include: {
              fourniture: true,
            },
          },
        },
      })

      // Créer une entrée dans le journal des modifications
      if (req.user && req.user.userId) {
        try {
          await prisma.journalModifications.create({
            data: {
              id_utilisateur: req.user.userId,
              type_ressource: "commande_fourniture",
              id_ressource: commande.id_commande,
              action: "creation",
              details: {
                reference: commande.reference,
                fournisseur: commande.fournisseur,
                nombre_articles: details.length,
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
        message: "Commande créée avec succès",
        data: commandeComplete,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la création de la commande",
        error: error.message,
      })
    }
  }

  /**
   * Met à jour le statut d'une commande
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updateCommandeStatus(req, res) {
    try {
      // Vérifier les permissions
      if (
        !FournitureController.verifierPermissions(req, [
          "MAINTENANCE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour mettre à jour une commande",
        })
      }

      const { id_commande } = req.params
      const { statut, notes, date_livraison } = req.body

      // Validation des données
      if (!statut) {
        return res.status(400).json({
          status: "ERROR",
          message: "Statut requis",
        })
      }

      // Vérifier que le statut est valide
      const validStatuts = ["EN_ATTENTE", "CONFIRMEE", "EXPEDIEE", "LIVREE", "ANNULEE"]
      if (!validStatuts.includes(statut)) {
        return res.status(400).json({
          status: "ERROR",
          message: `Statut invalide. Les valeurs acceptées sont: ${validStatuts.join(", ")}`,
        })
      }

      // Vérifier si la commande existe
      const commande = await prisma.commandeFourniture.findUnique({
        where: { id_commande: Number.parseInt(id_commande) },
        include: {
          details: {
            include: {
              fourniture: true,
            },
          },
        },
      })

      if (!commande) {
        return res.status(404).json({
          status: "ERROR",
          message: "Commande non trouvée",
        })
      }

      // Mettre à jour la commande
      const commandeMiseAJour = await prisma.commandeFourniture.update({
        where: { id_commande: Number.parseInt(id_commande) },
        data: {
          statut,
          notes: notes || commande.notes,
          date_livraison:
            statut === "LIVREE" ? new Date() : date_livraison ? new Date(date_livraison) : commande.date_livraison,
        },
      })

      // Si la commande est livrée, mettre à jour les stocks
      if (statut === "LIVREE" && commande.statut !== "LIVREE") {
        for (const detail of commande.details) {
          await prisma.fourniture.update({
            where: { id_fourniture: detail.id_fourniture },
            data: {
              quantite_stock: {
                increment: detail.quantite,
              },
            },
          })
        }
      }

      // Créer une entrée dans le journal des modifications
      if (req.user && req.user.userId) {
        try {
          await prisma.journalModifications.create({
            data: {
              id_utilisateur: req.user.userId,
              type_ressource: "commande_fourniture",
              id_ressource: Number.parseInt(id_commande),
              action: "mise_a_jour_statut",
              details: {
                ancien_statut: commande.statut,
                nouveau_statut: statut,
                notes: notes || null,
              },
            },
          })
        } catch (journalError) {
          console.error("Erreur lors de la création du journal:", journalError)
          // Ne pas bloquer la réponse si le journal échoue
        }
      }

      res.status(200).json({
        status: "OK",
        message: "Statut de la commande mis à jour avec succès",
        data: commandeMiseAJour,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la mise à jour du statut de la commande",
        error: error.message,
      })
    }
  }
}

export default FournitureController
