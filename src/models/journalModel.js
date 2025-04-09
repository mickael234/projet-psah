// src/models/journalModel.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class JournalModel {
  /**
   * Crée une nouvelle entrée dans le journal des modifications
   * @param {Object} data - Données de l'entrée
   * @returns {Promise<Object>} - Entrée créée
   */
  static async create(data) {
    return prisma.journalModifications.create({
      data: {
        id_utilisateur: data.id_utilisateur,
        type_ressource: data.type_ressource,
        id_ressource: data.id_ressource,
        action: data.action,
        details: data.details,
        date: new Date()
      }
    });
  }
  
  /**
   * Récupère l'historique des modifications pour une ressource
   * @param {string} type_ressource - Type de ressource
   * @param {number} id_ressource - ID de la ressource
   * @param {number} page - Numéro de page
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object>} - Historique paginé
   */
  static async getHistorique(type_ressource, id_ressource, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [journal, total] = await Promise.all([
      prisma.journalModifications.findMany({
        where: {
          type_ressource,
          id_ressource: parseInt(id_ressource)
        },
        include: {
          utilisateur: {
            select: {
              nom_utilisateur: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.journalModifications.count({
        where: {
          type_ressource,
          id_ressource: parseInt(id_ressource)
        }
      })
    ]);
    
    return {
      data: journal,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Récupère les dernières actions d'un utilisateur
   * @param {number} id_utilisateur - ID de l'utilisateur
   * @param {number} limit - Nombre d'éléments à récupérer
   * @returns {Promise<Array>} - Liste des dernières actions
   */
  static async getDernieresActions(id_utilisateur, limit = 10) {
    return prisma.journalModifications.findMany({
      where: {
        id_utilisateur: parseInt(id_utilisateur)
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    });
  }
}

export default JournalModel;