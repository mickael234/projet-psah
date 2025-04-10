const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FideliteModel {
    /**
     * Récupère un programme de fidélité avec ses relations
     * @param {number} id - ID du programme
     * @returns {Promise<Object>} - Le programme avec ses relations
     */
    static getWithRelations(id) {
        return prisma.fidelite.findUnique({
            where: { id_fidelite: id },
            include: {
                client: true,
                transactions: true,
                echanges: {
                    include: {
                        recompense: true
                    }
                }
            }
        });
    }

    /**
     * Récupère un programme de fidélité par l'ID du client
     * @param {number} idClient - ID du client
     * @returns {Promise<Object>} - Le programme trouvé
     */
    static findByClient(idClient) {
        return prisma.fidelite.findUnique({
            where: { id_client: idClient }
        });
    }

    /**
     * Crée un nouveau programme de fidélité
     * @param {Object} fideliteData - Données du programme
     * @returns {Promise<Object>} - Le programme créé
     */
    async create(fideliteData) {
        return prisma.fidelite.create({
            data: fideliteData
        });
    }

    /**
     * Récupère un programme de fidélité par son ID
     * @param {number} id - ID du programme
     * @returns {Promise<Object>} - Le programme trouvé
     */
    async findById(id) {
        return prisma.fidelite.findUnique({
            where: { id_fidelite: id },
            include: {
                client: true,
                transactions: true,
                echanges: {
                    include: {
                        recompense: true
                    }
                }
            }
        });
    }

    /**
     * Met à jour un programme de fidélité
     * @param {number} id - ID du programme
     * @param {Object} fideliteData - Nouvelles données
     * @returns {Promise<Object>} - Le programme mis à jour
     */
    async update(id, fideliteData) {
        return prisma.fidelite.update({
            where: { id_fidelite: id },
            data: fideliteData
        });
    }

    /**
     * Ajoute des points à un programme de fidélité
     * @param {number} idClient - ID du client
     * @param {number} points - Points à ajouter
     * @param {string} raison - Raison de l'ajout
     * @returns {Promise<Object>} - Le programme mis à jour
     */
    async addPoints(idClient, points, raison) {
        // Récupérer ou créer le programme de fidélité
        let fidelite = await FideliteModel.findByClient(idClient);

        if (!fidelite) {
            fidelite = await this.create({
                id_client: idClient,
                solde_points: 0
            });
        }

        // Créer la transaction
        await prisma.transactionFidelite.create({
            data: {
                id_fidelite: fidelite.id_fidelite,
                changement_points: points,
                raison
            }
        });

        // Mettre à jour le solde
        return prisma.fidelite.update({
            where: { id_fidelite: fidelite.id_fidelite },
            data: {
                solde_points: fidelite.solde_points + points,
                derniere_mise_a_jour: new Date()
            }
        });
    }

    /**
     * Utilise des points pour une récompense
     * @param {number} idClient - ID du client
     * @param {number} idRecompense - ID de la récompense
     * @returns {Promise<Object>} - L'échange créé
     */
    async usePoints(idClient, idRecompense) {
        // Récupérer le programme de fidélité
        const fidelite = await FideliteModel.findByClient(idClient);

        if (!fidelite) {
            throw new Error('Programme de fidélité non trouvé');
        }

        // Récupérer la récompense
        const recompense = await prisma.catalogueRecompense.findUnique({
            where: { id_recompense: idRecompense }
        });

        if (!recompense) {
            throw new Error('Récompense non trouvée');
        }

        // Vérifier si le client a assez de points
        if (fidelite.solde_points < recompense.points_requis) {
            throw new Error('Points insuffisants');
        }

        // Créer l'échange
        const echange = await prisma.echangeFidelite.create({
            data: {
                id_fidelite: fidelite.id_fidelite,
                id_recompense: idRecompense,
                points_utilises: recompense.points_requis
            }
        });

        // Créer la transaction
        await prisma.transactionFidelite.create({
            data: {
                id_fidelite: fidelite.id_fidelite,
                changement_points: -recompense.points_requis,
                raison: `Échange pour ${recompense.nom}`
            }
        });

        // Mettre à jour le solde
        await prisma.fidelite.update({
            where: { id_fidelite: fidelite.id_fidelite },
            data: {
                solde_points: fidelite.solde_points - recompense.points_requis,
                derniere_mise_a_jour: new Date()
            }
        });

        return echange;
    }

    /**
     * Récupère l'historique des transactions d'un client
     * @param {number} idClient - ID du client
     * @returns {Promise<Array>} - Liste des transactions
     */
    async getTransactions(idClient) {
        const fidelite = await FideliteModel.findByClient(idClient);

        if (!fidelite) {
            return [];
        }

        return prisma.transactionFidelite.findMany({
            where: { id_fidelite: fidelite.id_fidelite },
            orderBy: { date_transaction: 'desc' }
        });
    }

    /**
     * Récupère l'historique des échanges d'un client
     * @param {number} idClient - ID du client
     * @returns {Promise<Array>} - Liste des échanges
     */
    async getEchanges(idClient) {
        const fidelite = await FideliteModel.findByClient(idClient);

        if (!fidelite) {
            return [];
        }

        return prisma.echangeFidelite.findMany({
            where: { id_fidelite: fidelite.id_fidelite },
            include: {
                recompense: true
            },
            orderBy: { date_echange: 'desc' }
        });
    }
}

module.exports = FideliteModel;
