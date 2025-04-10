const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ServiceLocalModel {
  /**
   * Crée un nouveau service local
   * @param {Object} serviceData - Données du service
   * @returns {Promise<Object>} - Le service créé
   */
  async create(serviceData) {
    return prisma.serviceLocal.create({
      data: serviceData
    });
  }

  /**
   * Récupère un service local par son ID
   * @param {number} id - ID du service
   * @returns {Promise<Object>} - Le service trouvé
   */
  async findById(id) {
    return prisma.serviceLocal.findUnique({
      where: { id_service: id }
    });
  }

  /**
   * Récupère tous les services locaux
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} - Liste des services
   */
  async findAll(filters = {}) {
    return prisma.serviceLocal.findMany({
      where: filters
    });
  }

  /**
   * Met à jour un service local
   * @param {number} id - ID du service
   * @param {Object} serviceData - Nouvelles données
   * @returns {Promise<Object>} - Le service mis à jour
   */
  async update(id, serviceData) {
    return prisma.serviceLocal.update({
      where: { id_service: id },
      data: serviceData
    });
  }

  /**
   * Supprime un service local
   * @param {number} id - ID du service
   * @returns {Promise<Object>} - Le service supprimé
   */
  async delete(id) {
    // Vérifier si le service est utilisé dans des réservations
    const reservations = await prisma.reservationsServicesLocaux.findMany({
      where: { id_service_local: id }
    });
    
    if (reservations.length > 0) {
      throw new Error('Ce service est utilisé dans des réservations et ne peut pas être supprimé');
    }
    
    return prisma.serviceLocal.delete({
      where: { id_service: id }
    });
  }

  /**
   * Récupère les services locaux par catégorie
   * @param {string} categorie - Catégorie recherchée
   * @returns {Promise<Array>} - Liste des services
   */
  static findByCategorie(categorie) {
    return prisma.serviceLocal.findMany({
      where: { categorie }
    });
  }

  /**
   * Réserve un service local pour une réservation
   * @param {number} idReservation - ID de la réservation
   * @param {number} idService - ID du service local
   * @param {Object} reservationData - Données de la réservation
   * @returns {Promise<Object>} - La réservation créée
   */
  async reserveService(idReservation, idService, reservationData) {
    return prisma.reservationsServicesLocaux.create({
      data: {
        id_reservation: idReservation,
        id_service_local: idService,
        heure_reservation: reservationData.heure_reservation,
        etat: reservationData.etat || 'en_attente'
      }
    });
  }

  /**
   * Annule une réservation de service local
   * @param {number} idReservationService - ID de la réservation de service
   * @returns {Promise<Object>} - La réservation annulée
   */
  async cancelReservation(idReservationService) {
    return prisma.reservationsServicesLocaux.update({
      where: { id_reservation_service: idReservationService },
      data: { etat: 'annulee' }
    });
  }

  /**
   * Récupère les réservations d'un service local
   * @param {number} idService - ID du service local
   * @returns {Promise<Array>} - Liste des réservations
   */
  static getReservations(idService) {
    return prisma.reservationsServicesLocaux.findMany({
      where: { id_service_local: idService },
      include: {
        reservation: {
          include: {
            client: true
          }
        }
      }
    });
  }
}

module.exports = ServiceLocalModel;
