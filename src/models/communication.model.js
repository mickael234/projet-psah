import prisma from "../config/prisma.js"

class CommunicationModel {
  /**
   * Crée un nouveau message de communication
   * @param {Object} data - Données du message
   * @returns {Promise<Object>} - Le message créé
   */
  async create(data) {
    return prisma.communication.create({
      data: {
        sujet: data.sujet,
        contenu: data.contenu,
        id_expediteur: data.id_expediteur,
        id_destinataire: data.id_destinataire,
        departement_expediteur: data.departement_expediteur,
        departement_destinataire: data.departement_destinataire,
        priorite: data.priorite || "NORMALE",
        statut: data.statut || "NON_LU",
        // Utiliser date_creation au lieu de date_envoi (qui n'existe pas dans le schéma)
        // date_creation est automatiquement définie par @default(now())
      },
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Récupère tous les messages avec filtres optionnels
   * @param {Object} filters - Filtres à appliquer
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des messages
   */
  async findAll(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    return prisma.communication.findMany({
      where: filters,
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        reponses: {
          include: {
            expediteur: {
              select: {
                nom_utilisateur: true,
                role: true,
              },
            },
          },
          orderBy: {
            date_creation: "asc", // Utiliser date_creation au lieu de date_envoi
          },
        },
      },
      orderBy: {
        date_creation: "desc", // Utiliser date_creation au lieu de date_envoi
      },
      skip,
      take: limit,
    })
  }

  /**
   * Récupère un message par son ID
   * @param {number} id - ID du message
   * @returns {Promise<Object>} - Le message trouvé
   */
  async findById(id) {
    return prisma.communication.findUnique({
      where: { id_communication: id },
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        reponses: {
          include: {
            expediteur: {
              select: {
                nom_utilisateur: true,
                role: true,
              },
            },
          },
          orderBy: {
            date_creation: "asc", // Utiliser date_creation au lieu de date_envoi
          },
        },
      },
    })
  }

  /**
   * Met à jour le statut d'un message
   * @param {number} id - ID du message
   * @param {string} statut - Nouveau statut
   * @returns {Promise<Object>} - Le message mis à jour
   */
  async updateStatut(id, statut) {
    return prisma.communication.update({
      where: { id_communication: id },
      data: { statut },
    })
  }

  /**
   * Ajoute une réponse à un message
   * @param {number} id - ID du message parent
   * @param {Object} data - Données de la réponse
   * @returns {Promise<Object>} - La réponse créée
   */
  async repondre(id, data) {
    // Vérifier si le message parent existe
    const messageParent = await prisma.communication.findUnique({
      where: { id_communication: id },
    })

    if (!messageParent) {
      throw new Error("Message parent non trouvé")
    }

    // Créer la réponse
    return prisma.reponseCommunication.create({
      data: {
        id_communication: id,
        contenu: data.contenu,
        id_expediteur: data.id_expediteur,
        // date_creation est automatiquement définie par @default(now())
      },
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Récupère les messages non lus pour un utilisateur
   * @param {number} id_utilisateur - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des messages non lus
   */
  async getNonLus(id_utilisateur) {
    return prisma.communication.findMany({
      where: {
        id_destinataire: id_utilisateur,
        statut: "NON_LU",
      },
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
      orderBy: {
        date_creation: "desc", // Utiliser date_creation au lieu de date_envoi
      },
    })
  }

  /**
   * Récupère les messages par département
   * @param {string} departement - Nom du département
   * @returns {Promise<Array>} - Liste des messages
   */
  async getByDepartement(departement) {
    return prisma.communication.findMany({
      where: {
        OR: [{ departement_expediteur: departement }, { departement_destinataire: departement }],
      },
      include: {
        expediteur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
      orderBy: {
        date_creation: "desc", // Utiliser date_creation au lieu de date_envoi
      },
    })
  }
}

export default CommunicationModel
