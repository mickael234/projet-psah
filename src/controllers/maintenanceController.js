import MaintenanceModel from "../models/maintenance.model.js"
import { RoleMapper } from "../utils/roleMapper.js"
import prisma from "../config/prisma.js"

// Middleware de vérification des rôles
const verifierRoleMaintenance = (req, res, next) => {
  const rolesAutorises = ["MAINTENANCE", "SUPER_ADMIN", "ADMIN_GENERAL"]
  if (!RoleMapper.hasAuthorizedRole(req.utilisateur, rolesAutorises)) {
    return res.status(403).json({ message: "Accès non autorisé" })
  }
  next()
}

// Nouvel endpoint pour trouver l'ID du personnel par ID utilisateur
export const trouverPersonnelParUtilisateur = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId)

    // Rechercher le personnel par ID utilisateur
    const personnel = await prisma.personnel.findFirst({
      where: { id_utilisateur: userId },
    })

    if (!personnel) {
      // Si aucun personnel n'est trouvé, rechercher tous les personnels pour déboguer
      const tousLesPersonnels = await prisma.personnel.findMany()

      return res.status(404).json({
        status: "ERROR",
        message: "Personnel non trouvé pour cet utilisateur",
        debug: {
          userId,
          tousLesPersonnels,
        },
      })
    }

    // Retourner les informations du personnel
    res.status(200).json({
      status: "OK",
      message: "Personnel trouvé avec succès",
      data: {
        id_personnel: personnel.id_personnel,
        id_utilisateur: personnel.id_utilisateur,
        nom: personnel.nom,
        prenom: personnel.prenom,
        poste: personnel.poste,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche du personnel:", error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la recherche du personnel",
      error: error.message,
    })
  }
}

// Créer une maintenance avec notification
export const creerMaintenance = async (req, res) => {
  const { id } = req.params
  const { description, date, priorite = "NORMALE" } = req.body

  // Vérification des données obligatoires
  if (!description || !date) {
    return res.status(400).json({
      message: "Description et date sont obligatoires.",
    })
  }

  try {
    // Créer la maintenance
    const maintenance = await MaintenanceModel.createMaintenance({
      id_chambre: Number.parseInt(id),
      description,
      date: new Date(date),
      statut: "EN_ATTENTE",
      priorite,
    })

    // Créer une notification pour le personnel de maintenance (optimisation en parallèle)
    prisma.notification
      .create({
        data: {
          id_utilisateur: req.user.id,
          type: "MAINTENANCE",
          contenu: `Nouvelle maintenance requise - Chambre ${id}: ${description}`,
          etat: "non_lu",
          envoye_le: new Date(),
        },
      })
      .catch((error) => console.error("Erreur notification:", error))

    res.status(201).json(maintenance)
  } catch (error) {
    console.error("Erreur création maintenance:", error)
    res.status(500).json({
      message: "Erreur lors de la création de la maintenance",
      error: error.message,
    })
  }
}

// Récupérer les notifications de maintenance
export const obtenirNotificationsMaintenance = async (req, res) => {
  const { page = 1, limit = 10 } = req.query

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        type: "MAINTENANCE",
        etat: "non_lu",
      },
      orderBy: {
        envoye_le: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    res.status(200).json(notifications)
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications",
      error: error.message,
    })
  }
}

// Marquer les notifications comme lues
export const marquerNotificationsCommeLues = async (req, res) => {
  const { idNotifications } = req.body

  // Vérification que l'ID des notifications est valide
  if (!Array.isArray(idNotifications) || idNotifications.length === 0) {
    return res.status(400).json({
      message: "Aucune notification à marquer comme lue.",
    })
  }

  try {
    await prisma.notification.updateMany({
      where: {
        id_notification: {
          in: idNotifications,
        },
      },
      data: {
        etat: "lu",
      },
    })

    res.status(200).json({ message: "Notifications marquées comme lues" })
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des notifications",
      error: error.message,
    })
  }
}

// Lister les maintenances par chambre avec filtres
export const listerMaintenancesParChambre = async (req, res) => {
  const { id } = req.params
  const { statut, priorite } = req.query

  const validStatuts = ["EN_ATTENTE", "TERMINEE", "EN_COURS"]
  const validPriorites = ["NORMALE", "HAUTE", "BASSE"]

  // Validation des filtres
  if (statut && !validStatuts.includes(statut)) {
    return res.status(400).json({ message: "Statut invalide." })
  }

  if (priorite && !validPriorites.includes(priorite)) {
    return res.status(400).json({ message: "Priorité invalide." })
  }

  try {
    const maintenances = await MaintenanceModel.findByChambre(id, { statut, priorite })
    res.status(200).json(maintenances)
  } catch (error) {
    console.error("Erreur GET maintenance:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération des maintenances",
      error: error.message,
    })
  }
}

// Mettre à jour le statut d'une maintenance
export const mettreAJourStatutMaintenance = async (req, res) => {
  const { idMaintenance } = req.params
  const { statut } = req.body

  // Vérification de statut valide
  const validStatuts = ["EN_ATTENTE", "EN_COURS", "TERMINEE"]
  if (!validStatuts.includes(statut)) {
    return res.status(400).json({ message: "Statut invalide." })
  }

  try {
    const maintenance = await prisma.maintenance.update({
      where: { id_maintenance: Number.parseInt(idMaintenance) },
      data: { statut },
    })

    // Créer une notification de mise à jour
    if (statut === "TERMINEE") {
      await prisma.notification.create({
        data: {
          id_utilisateur: req.user.id,
          type: "MAINTENANCE_TERMINEE",
          contenu: `La maintenance de la chambre ${maintenance.id_chambre} est terminée`,
          etat: "non_lu",
        },
      })
    }

    res.status(200).json(maintenance)
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la maintenance",
      error: error.message,
    })
  }
}

export { verifierRoleMaintenance }
