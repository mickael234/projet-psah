const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ServiceModel {
    /**
     * Crée un nouveau service
     * @param {Object} serviceData - Données du service
     * @returns {Promise<Object>} - Le service créé
     */
    async create(serviceData) {
        return prisma.service.create({
            data: serviceData
        });
    }

    /**
     * Récupère un service par son ID
     * @param {number} id - ID du service
     * @returns {Promise<Object>} - Le service trouvé
     */
    async findById(id) {
        return prisma.service.findUnique({
            where: { id_service: id }
        });
    }

    /**
     * Récupère tous les services
     * @returns {Promise<Array>} - Liste des services
     */
    async findAll() {
        return prisma.service.findMany();
    }

    /**
     * Met à jour un service
     * @param {number} id - ID du service
     * @param {Object} serviceData - Nouvelles données
     * @returns {Promise<Object>} - Le service mis à jour
     */
    async update(id, serviceData) {
        return prisma.service.update({
            where: { id_service: id },
            data: serviceData
        });
    }

    /**
     * Supprime un service
     * @param {number} id - ID du service
     * @returns {Promise<Object>} - Le service supprimé
     */
    async delete(id) {
        // Vérifier si le service est utilisé dans des réservations
        const reservations = await prisma.reservationsServices.findMany({
            where: { id_service: id }
        });

        if (reservations.length > 0) {
            throw new Error(
                'Ce service est utilisé dans des réservations et ne peut pas être supprimé'
            );
        }

        return prisma.service.delete({
            where: { id_service: id }
        });
    }

    /**
     * Récupère les réservations qui utilisent un service spécifique
     * @param {number} id - ID du service
     * @returns {Promise<Array>} - Liste des réservations
     */
    static getReservations(id) {
        return prisma.reservationsServices.findMany({
            where: { id_service: id },
            include: {
                reservation: true
            }
        });
    }
}

module.exports = ServiceModel;