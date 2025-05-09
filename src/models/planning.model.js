import prisma from "../config/prisma.js"

class PlanningModel {
  /**
   * Crée une nouvelle tâche planifiée
   * @param {Object} data - Données de la tâche
   * @returns {Promise<Object>} - La tâche créée
   */
  async create(data) {
    return prisma.tachePlanifiee.create({
      data: {
        titre: data.titre,
        description: data.description,
        date_debut: new Date(data.date_debut),
        date_fin: data.date_fin ? new Date(data.date_fin) : null,
        id_chambre: data.id_chambre,
        id_responsable: data.id_responsable,
        type_tache: data.type_tache,
        priorite: data.priorite || "NORMALE",
        statut: data.statut || "PLANIFIEE",
        recurrence: data.recurrence,
        notes: data.notes,
        // id_createur n'existe pas dans le schéma, nous l'omettons
      },
      include: {
        chambre: true,
        responsable: {
          select: {
            nom_utilisateur: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Récupère toutes les tâches planifiées avec filtres optionnels
   * @param {Object} filters - Filtres à appliquer
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Array>} - Liste des tâches
   */
  async findAll(filters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    return prisma.tachePlanifiee.findMany({
      where: filters,
      include: {
        chambre: true,
        responsable: {
          select: {
            nom_utilisateur: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [
        {
          date_debut: "asc",
        },
        {
          priorite: "desc",
        },
      ],
      skip,
      take: limit,
    })
  }

  /**
   * Récupère une tâche planifiée par son ID
   * @param {number} id - ID de la tâche
   * @returns {Promise<Object>} - La tâche trouvée
   */
  async findById(id) {
    return prisma.tachePlanifiee.findUnique({
      where: { id_tache: id },
      include: {
        chambre: true,
        responsable: {
          select: {
            nom_utilisateur: true,
            email: true,
            role: true,
          },
        },
        commentaires: {
          include: {
            utilisateur: {
              select: {
                nom_utilisateur: true,
                role: true,
              },
            },
          },
          orderBy: {
            date_creation: "desc",
          },
        },
      },
    })
  }

  /**
   * Met à jour une tâche planifiée
   * @param {number} id - ID de la tâche
   * @param {Object} data - Nouvelles données
   * @returns {Promise<Object>} - La tâche mise à jour
   */
  async update(id, data) {
    return prisma.tachePlanifiee.update({
      where: { id_tache: id },
      data: {
        titre: data.titre,
        description: data.description,
        date_debut: data.date_debut ? new Date(data.date_debut) : undefined,
        date_fin: data.date_fin ? new Date(data.date_fin) : undefined,
        id_chambre: data.id_chambre,
        id_responsable: data.id_responsable,
        type_tache: data.type_tache,
        priorite: data.priorite,
        statut: data.statut,
        recurrence: data.recurrence,
        notes: data.notes,
      },
      include: {
        chambre: true,
        responsable: {
          select: {
            nom_utilisateur: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Met à jour le statut d'une tâche planifiée
   * @param {number} id - ID de la tâche
   * @param {string} statut - Nouveau statut
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - La tâche mise à jour
   */
  async updateStatut(id, statut, options = {}) {
    const { commentaire, id_utilisateur } = options

    // Mettre à jour le statut de la tâche
    const tache = await prisma.tachePlanifiee.update({
      where: { id_tache: id },
      data: {
        statut,
        date_fin: statut === "TERMINEE" ? new Date() : undefined,
      },
    })

    // Ajouter un commentaire si fourni
    if (commentaire && id_utilisateur) {
      await prisma.commentaireTache.create({
        data: {
          id_tache: id,
          id_utilisateur,
          contenu: commentaire,
          date_creation: new Date(),
        },
      })
    }

    return tache
  }

  /**
   * Ajoute un commentaire à une tâche
   * @param {number} id_tache - ID de la tâche
   * @param {number} id_utilisateur - ID de l'utilisateur
   * @param {string} contenu - Contenu du commentaire
   * @returns {Promise<Object>} - Le commentaire créé
   */
  async ajouterCommentaire(id_tache, id_utilisateur, contenu) {
    return prisma.commentaireTache.create({
      data: {
        id_tache,
        id_utilisateur,
        contenu,
        date_creation: new Date(),
      },
      include: {
        utilisateur: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
    })
  }

  /**
   * Récupère les tâches planifiées pour un responsable
   * @param {number} id_responsable - ID du responsable
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Array>} - Liste des tâches
   */
  async getByResponsable(id_responsable, options = {}) {
    const { statut, date_debut, date_fin } = options

    const filters = {
      id_responsable,
    }

    if (statut) {
      filters.statut = statut
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

    return prisma.tachePlanifiee.findMany({
      where: filters,
      include: {
        chambre: true,
      },
      orderBy: [
        {
          date_debut: "asc",
        },
        {
          priorite: "desc",
        },
      ],
    })
  }

  /**
   * Récupère les tâches planifiées pour une chambre
   * @param {number} id_chambre - ID de la chambre
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Array>} - Liste des tâches
   */
  async getByChambre(id_chambre, options = {}) {
    const { statut, type_tache } = options

    const filters = {
      id_chambre,
    }

    if (statut) {
      filters.statut = statut
    }

    if (type_tache) {
      filters.type_tache = type_tache
    }

    return prisma.tachePlanifiee.findMany({
      where: filters,
      include: {
        responsable: {
          select: {
            nom_utilisateur: true,
            role: true,
          },
        },
      },
      orderBy: [
        {
          date_debut: "asc",
        },
        {
          priorite: "desc",
        },
      ],
    })
  }
}

export default PlanningModel
