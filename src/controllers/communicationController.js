import prisma from "../config/prisma.js";
import CommunicationModel from "../models/communication.model.js"
import { RoleMapper } from "../utils/roleMapper.js"




const communicationModel = new CommunicationModel()

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
 * Crée un nouveau message de communication
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const creerCommunication = async (req, res) => {
  try {
    const { sujet, contenu, id_destinataire, departement_destinataire, priorite } = req.body

    // Validation des données
    if (!sujet || !contenu || (!id_destinataire && !departement_destinataire)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Sujet, contenu et destinataire (utilisateur ou département) sont requis",
      })
    }

    // Récupérer les informations de l'expéditeur
    const id_expediteur = req.user.userId
    let departement_expediteur = null

    // Déterminer le département de l'expéditeur en fonction de son rôle
    if (req.user.role === "MAINTENANCE") {
      departement_expediteur = "MAINTENANCE"
    } else if (req.user.role === "RECEPTIONNISTE") {
      departement_expediteur = "RECEPTION"
    } else if (req.user.role === "RESPONSABLE_HEBERGEMENT") {
      departement_expediteur = "HEBERGEMENT"
    } else if (req.user.role === "COMPTABILITE") {
      departement_expediteur = "COMPTABILITE"
    } else {
      departement_expediteur = "ADMINISTRATION"
    }

    // Créer le message
    const communication = await communicationModel.create({
      sujet,
      contenu,
      id_expediteur,
      id_destinataire,
      departement_expediteur,
      departement_destinataire,
      priorite,
    })

    res.status(201).json({
      status: "OK",
      message: "Message envoyé avec succès",
      data: communication,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'envoi du message",
      error: error.message,
    })
  }
}

/**
 * Récupère tous les messages avec filtres optionnels
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const listerCommunications = async (req, res) => {
  try {
    const { page = 1, limit = 20, statut, priorite, departement } = req.query

    // Construire les filtres
    const filters = {}

    // Filtrer par statut si spécifié
    if (statut) {
      filters.statut = statut
    }

    // Filtrer par priorité si spécifiée
    if (priorite) {
      filters.priorite = priorite
    }

    // Filtrer par département si spécifié
    if (departement) {
      filters.OR = [{ departement_expediteur: departement }, { departement_destinataire: departement }]
    }

    // Filtrer par utilisateur (messages envoyés ou reçus)
    if (req.user && req.user.userId) {
      if (!filters.OR) {
        filters.OR = []
      }
      filters.OR.push({ id_expediteur: req.user.userId }, { id_destinataire: req.user.userId })
    }

    // Récupérer les messages
    const communications = await communicationModel.findAll(filters, Number.parseInt(page), Number.parseInt(limit))

    res.status(200).json({
      status: "OK",
      message: "Messages récupérés avec succès",
      data: communications,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des messages",
      error: error.message,
    })
  }
}

/**
 * Récupère un message par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getCommunicationById = async (req, res) => {
  try {
    const { id } = req.params

    // Récupérer le message
    const communication = await communicationModel.findById(Number.parseInt(id))

    if (!communication) {
      return res.status(404).json({
        status: "ERROR",
        message: "Message non trouvé",
      })
    }

    // Vérifier que l'utilisateur est autorisé à voir ce message
    if (
      communication.id_expediteur !== req.user.userId &&
      communication.id_destinataire !== req.user.userId &&
      !verifierPermissions(req, ["ADMIN_GENERAL", "SUPER_ADMIN", "RESPONSABLE_HEBERGEMENT"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir ce message",
      })
    }

    // Si l'utilisateur est le destinataire et que le message est non lu, le marquer comme lu
    if (communication.id_destinataire === req.user.userId && communication.statut === "NON_LU") {
      await communicationModel.updateStatut(Number.parseInt(id), "LU")
      communication.statut = "LU"
    }

    res.status(200).json({
      status: "OK",
      message: "Message récupéré avec succès",
      data: communication,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération du message",
      error: error.message,
    })
  }
}

/**
 * Répond à un message
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const repondreCommunication = async (req, res) => {
  try {
    const { id } = req.params
    const { contenu } = req.body

    // Validation des données
    if (!contenu) {
      return res.status(400).json({
        status: "ERROR",
        message: "Le contenu de la réponse est requis",
      })
    }

    // Récupérer le message parent
    const messageParent = await communicationModel.findById(Number.parseInt(id))

    if (!messageParent) {
      return res.status(404).json({
        status: "ERROR",
        message: "Message parent non trouvé",
      })
    }

    // Vérifier que l'utilisateur est autorisé à répondre à ce message
    if (
      messageParent.id_expediteur !== req.user.userId &&
      messageParent.id_destinataire !== req.user.userId &&
      !verifierPermissions(req, ["ADMIN_GENERAL", "SUPER_ADMIN", "RESPONSABLE_HEBERGEMENT"])
    ) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à répondre à ce message",
      })
    }

    // Créer la réponse
    const reponse = await communicationModel.repondre(Number.parseInt(id), {
      contenu,
      id_expediteur: req.user.userId,
    })

    // Mettre à jour le statut du message parent si l'expéditeur de la réponse est le destinataire du message parent
    if (messageParent.id_destinataire === req.user.userId && messageParent.statut !== "REPONDU") {
      await communicationModel.updateStatut(Number.parseInt(id), "REPONDU")
    }

    res.status(201).json({
      status: "OK",
      message: "Réponse envoyée avec succès",
      data: reponse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de l'envoi de la réponse",
      error: error.message,
    })
  }
}

/**
 * Récupère les messages non lus pour l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getMessagesNonLus = async (req, res) => {
  try {
    // Récupérer les messages non lus
    const messagesNonLus = await communicationModel.getNonLus(req.user.userId)

    res.status(200).json({
      status: "OK",
      message: "Messages non lus récupérés avec succès",
      data: {
        count: messagesNonLus.length,
        messages: messagesNonLus,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des messages non lus",
      error: error.message,
    })
  }
}

/**
 * Marque un message comme lu
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const marquerCommeLu = async (req, res) => {
  try {
    const { id } = req.params

    // Récupérer le message
    const message = await communicationModel.findById(Number.parseInt(id))

    if (!message) {
      return res.status(404).json({
        status: "ERROR",
        message: "Message non trouvé",
      })
    }

    // Vérifier que l'utilisateur est le destinataire du message
    if (message.id_destinataire !== req.user.userId) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à marquer ce message comme lu",
      })
    }

    // Marquer le message comme lu
    await communicationModel.updateStatut(Number.parseInt(id), "LU")

    res.status(200).json({
      status: "OK",
      message: "Message marqué comme lu avec succès",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors du marquage du message comme lu",
      error: error.message,
    })
  }
}

/**
 * Récupère les messages par département
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getMessagesByDepartement = async (req, res) => {
  try {
    const { departement } = req.params

    // Vérifier que l'utilisateur est autorisé à voir les messages du département
    if (!verifierPermissions(req, ["ADMIN_GENERAL", "SUPER_ADMIN", "RESPONSABLE_HEBERGEMENT"])) {
      return res.status(403).json({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir les messages de ce département",
      })
    }

    // Récupérer les messages
    const messages = await communicationModel.getByDepartement(departement)

    res.status(200).json({
      status: "OK",
      message: `Messages du département ${departement} récupérés avec succès`,
      data: messages,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: "ERROR",
      message: "Erreur lors de la récupération des messages du département",
      error: error.message,
    })
  }
}
