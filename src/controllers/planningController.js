import PlanningModel from "../models/planning.model.js"
import { RoleMapper } from "../utils/roleMapper.js"
import prisma from "../config/prisma.js"

const planningModel = new PlanningModel()



/**
 * Vérifie si l'utilisateur a les permissions nécessaires
 * @param {Object} req - Requête Express
 * @param {Array} rolesAutorises - Rôles autorisés
 * @returns {boolean} - L'utilisateur a-t-il les permissions
 */
const verifierPermissions = (req, rolesAutorises) => {
  if (!req.user) return false
  return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
}

/**
 * Crée une nouvelle tâche planifiée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const creerTachePlanifiee = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!verifierPermissions(req, ["MAINTENANCE", "RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour créer une tâche planifiée",
      })
    }

    const {
      titre,
      description,
      date_debut,
      date_fin,
      id_chambre,
      id_responsable,
      id_personnel, // Nouveau champ optionnel
      type_tache,
      priorite,
      recurrence,
      notes,
    } = req.body

    // Validation des données
    if (!titre || !date_debut || !id_chambre || (!id_responsable && !id_personnel) || !type_tache) {
      return res.status(400).json({
        status: "ERROR",
        message: "Titre, date de début, chambre, responsable (ou personnel) et type de tâche sont requis",
      })
    }

    // Vérifier si la chambre existe
    const chambreExists = await prisma.chambre.findUnique({
      where: { id_chambre: Number.parseInt(id_chambre) },
    })

    if (!chambreExists) {
      return res.status(404).json({
        status: "ERROR",
        message: "La chambre spécifiée n'existe pas",
      })
    }

    // Déterminer l'ID de l'utilisateur responsable
    let idUtilisateurResponsable

    // Si id_personnel est fourni, trouver l'id_utilisateur correspondant
    if (id_personnel) {
      const personnel = await prisma.personnel.findUnique({
        where: { id_personnel: Number.parseInt(id_personnel) },
      })

      if (!personnel) {
        return res.status(404).json({
          status: "ERROR",
          message: "Le personnel spécifié n'existe pas",
        })
      }

      idUtilisateurResponsable = personnel.id_utilisateur
    } else {
      // Sinon, utiliser directement id_responsable
      idUtilisateurResponsable = Number.parseInt(id_responsable)

      // Vérifier si l'utilisateur existe
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id_utilisateur: idUtilisateurResponsable },
      })

      if (!utilisateur) {
        return res.status(404).json({
          status: "ERROR",
          message: "L'utilisateur responsable spécifié n'existe pas",
        })
      }
    }

    // Créer la tâche
    const tache = await planningModel.create({
      titre,
      description,
      date_debut,
      date_fin,
      id_chambre: Number.parseInt(id_chambre),
      id_responsable: idUtilisateurResponsable, // Utiliser l'ID utilisateur déterminé
      type_tache,
      priorite,
      recurrence,
      notes,
      id_createur: req.user.userId,
    })

    res.status(201).json({
      status: "OK",
      message: "Tâche planifiée créée avec succès",
      data: tache,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la création de la tâche planifiée",
      error: error.message,
    })
  }
}

/**
 * Récupère toutes les tâches planifiées avec filtres optionnels
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const listerTachesPlanifiees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      statut,
      type_tache,
      priorite,
      date_debut,
      date_fin,
      id_chambre,
      id_responsable,
    } = req.query

    // Construire les filtres
    const filters = {}

    if (statut) {
      filters.statut = statut
    }

    if (type_tache) {
      filters.type_tache = type_tache
    }

    if (priorite) {
      filters.priorite = priorite
    }

    if (id_chambre) {
      filters.id_chambre = Number.parseInt(id_chambre)
    }

    if (id_responsable) {
      filters.id_responsable = Number.parseInt(id_responsable)
    }

    if (date_debut || date_fin) {
      filters.date_debut = {}

      if (date_debut) {
        filters.date_debut.gte = new Date(date_debut)
      }

      if (date_fin) {
        filters.date_debut.lte = new Date(date_fin)
      }
    }

    // Si l'utilisateur n'est pas un administrateur ou responsable, limiter aux tâches dont il est responsable
    if (
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"]) &&
      req.user.personnelId
    ) {
      filters.id_responsable = req.user.personnelId
    }

    // Récupérer les tâches
    const taches = await planningModel.findAll(filters, Number.parseInt(page), Number.parseInt(limit))

    res.status(200).json({
      status: "OK",
      message: "Tâches planifiées récupérées avec succès",
      data: taches,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des tâches planifiées",
      error: error.message,
    })
  }
}

/**
 * Récupère une tâche planifiée par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getTachePlanifieeById = async (req, res) => {
  try {
    const { id } = req.params

    // Récupérer la tâche
    const tache = await planningModel.findById(Number.parseInt(id))

    if (!tache) {
      return res.status(404).json({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      })
    }

    // Vérifier que l'utilisateur est autorisé à voir cette tâche
    if (
      tache.id_responsable !== req.user.personnelId &&
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir cette tâche",
      })
    }

    res.status(200).json({
      status: "OK",
      message: "Tâche planifiée récupérée avec succès",
      data: tache,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération de la tâche planifiée",
      error: error.message,
    })
  }
}

/**
 * Met à jour une tâche planifiée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateTachePlanifiee = async (req, res) => {
  try {
    const { id } = req.params
    const {
      titre,
      description,
      date_debut,
      date_fin,
      id_chambre,
      id_responsable,
      type_tache,
      priorite,
      statut,
      recurrence,
      notes,
    } = req.body

    // Récupérer la tâche
    const tache = await planningModel.findById(Number.parseInt(id))

    if (!tache) {
      return res.status(404).json({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      })
    }

    // Vérifier que l'utilisateur est autorisé à modifier cette tâche
    if (
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"]) &&
      tache.id_createur !== req.user.userId
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à modifier cette tâche",
      })
    }

    // Mettre à jour la tâche
    const tacheMiseAJour = await planningModel.update(Number.parseInt(id), {
      titre,
      description,
      date_debut,
      date_fin,
      id_chambre: id_chambre ? Number.parseInt(id_chambre) : undefined,
      id_responsable: id_responsable ? Number.parseInt(id_responsable) : undefined,
      type_tache,
      priorite,
      statut,
      recurrence,
      notes,
    })

    res.status(200).json({
      status: "OK",
      message: "Tâche planifiée mise à jour avec succès",
      data: tacheMiseAJour,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la mise à jour de la tâche planifiée",
      error: error.message,
    })
  }
}

/**
 * Met à jour le statut d'une tâche planifiée
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateStatutTache = async (req, res) => {
  try {
    const { id } = req.params
    const { statut, commentaire } = req.body

    // Validation des données
    if (!statut) {
      return res.status(400).json({
        status: "ERROR",
        message: "Le statut est requis",
      })
    }

    // Vérifier que le statut est valide
    const validStatuts = ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"]
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({
        status: "ERROR",
        message: `Statut invalide. Les valeurs acceptées sont: ${validStatuts.join(", ")}`,
      })
    }

    // Récupérer la tâche
    const tache = await planningModel.findById(Number.parseInt(id))

    if (!tache) {
      return res.status(404).json({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      })
    }

    // Vérifier que l'utilisateur est autorisé à modifier cette tâche
    if (
      tache.id_responsable !== req.user.personnelId &&
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à modifier cette tâche",
      })
    }

    // Mettre à jour le statut de la tâche
    const tacheMiseAJour = await planningModel.updateStatut(Number.parseInt(id), statut, {
      commentaire,
      id_utilisateur: req.user.userId,
    })

    res.status(200).json({
      status: "OK",
      message: "Statut de la tâche mis à jour avec succès",
      data: tacheMiseAJour,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la mise à jour du statut de la tâche",
      error: error.message,
    })
  }
}

/**
 * Ajoute un commentaire à une tâche
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const ajouterCommentaire = async (req, res) => {
  try {
    const { id } = req.params
    const { contenu } = req.body

    // Validation des données
    if (!contenu) {
      return res.status(400).json({
        status: "ERROR",
        message: "Le contenu du commentaire est requis",
      })
    }

    // Récupérer la tâche
    const tache = await planningModel.findById(Number.parseInt(id))

    if (!tache) {
      return res.status(404).json({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      })
    }

    // Vérifier que l'utilisateur est autorisé à commenter cette tâche
    if (
      tache.id_responsable !== req.user.personnelId &&
      tache.id_createur !== req.user.userId &&
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à commenter cette tâche",
      })
    }

    // Ajouter le commentaire
    const commentaire = await planningModel.ajouterCommentaire(Number.parseInt(id), req.user.userId, contenu)

    res.status(201).json({
      status: "OK",
      message: "Commentaire ajouté avec succès",
      data: commentaire,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'ajout du commentaire",
      error: error.message,
    })
  }
}

/**
 * Récupère les tâches planifiées pour un responsable
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getTachesByResponsable = async (req, res) => {
  try {
    const { id_responsable } = req.params
    const { statut, date_debut, date_fin } = req.query

    // Vérifier que l'utilisateur est autorisé à voir ces tâches
    if (
      Number.parseInt(id_responsable) !== req.user.personnelId &&
      !verifierPermissions(req, ["RESPONSABLE_HEBERGEMENT", "ADMIN_GENERAL", "SUPER_ADMIN"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir ces tâches",
      })
    }

    // Récupérer les tâches
    const taches = await planningModel.getByResponsable(Number.parseInt(id_responsable), {
      statut,
      date_debut,
      date_fin,
    })

    res.status(200).json({
      status: "OK",
      message: "Tâches récupérées avec succès",
      data: taches,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des tâches",
      error: error.message,
    })
  }
}

/**
 * Récupère les tâches planifiées pour une chambre
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getTachesByChambre = async (req, res) => {
  try {
    const { id_chambre } = req.params
    const { statut, type_tache } = req.query

    // Récupérer les tâches
    const taches = await planningModel.getByChambre(Number.parseInt(id_chambre), {
      statut,
      type_tache,
    })

    res.status(200).json({
      status: "OK",
      message: "Tâches récupérées avec succès",
      data: taches,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des tâches",
      error: error.message,
    })
  }
}
