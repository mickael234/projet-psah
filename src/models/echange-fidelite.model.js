const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EchangeFideliteModel {
    /**
     * Crée un nouvel échange de fidélité
     * @param {Object} echangeData - Données de l'échange
     * @returns {Promise<Object>} - L'échange créé
     */
    async create(echangeData) {
        return prisma.echangeFidelite.create({
            data: echangeData
        });
    }

    /**
     * Récupère un échange par son ID
     * @param {number} id - ID de l'échange
     * @returns {Promise<Object>} - L'échange trouvé
     */
    async findById(id) {
        return prisma.echangeFidelite.findUnique({
            where: { id_echange: id },
            include: {
                fidelite: {
                    include: {
                        client: true
                    }
                },
                recompense: true
            }
        });
    }

    /**
     * Récupère tous les échanges d'un programme de fidélité
     * @param {number} idFidelite - ID du programme de fidélité
     * @returns {Promise<Array>} - Liste des échanges
     */
    static findByFidelite(idFidelite) {
        return prisma.echangeFidelite.findMany({
            where: { id_fidelite: idFidelite },
            orderBy: { date_echange: 'desc' },
            include: {
                recompense: true
            }
        });
    }

    /**
     * Récupère tous les échanges
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array>} - Liste des échanges
     */
    async findAll(filters = {}) {
        return prisma.echangeFidelite.findMany({
            where: filters,
            orderBy: { date_echange: 'desc' },
            include: {
                fidelite: {
                    include: {
                        client: true
                    }
                },
                recompense: true
            }
        });
    }

    /**
     * Effectue un échange de points contre une récompense
     * @param {number} idFidelite - ID du programme de fidélité
     * @param {number} idRecompense - ID de la récompense
     * @returns {Promise<Object>} - L'échange créé
     */
    async exchangePoints(idFidelite, idRecompense) {
        // Récupérer le programme de fidélité et la récompense
        const fidelite = await prisma.fidelite.findUnique({
            where: { id_fidelite: idFidelite }
        });

        const recompense = await prisma.catalogueRecompense.findUnique({
            where: { id_recompense: idRecompense }
        });

        if (!fidelite || !recompense) {
            throw new Error('Programme de fidélité ou récompense non trouvé');
        }

        // Vérifier si le client a assez de points
        if (fidelite.solde_points < recompense.points_requis) {
            throw new Error('Points insuffisants');
        }

        // Créer l'échange
        const echange = await this.create({
            id_fidelite: idFidelite,
            id_recompense: idRecompense,
            points_utilises: recompense.points_requis,
            etat: 'en_attente'
        });

        // Mettre à jour le solde du programme de fidélité
        await prisma.fidelite.update({
            where: { id_fidelite: idFidelite },
            data: {
                solde_points: {
                    decrement: recompense.points_requis
                },
                derniere_mise_a_jour: new Date()
            }
        });

        // Créer une transaction négative
        await prisma.transactionFidelite.create({
            data: {
                id_fidelite: idFidelite,
                changement_points: -recompense.points_requis,
                raison: `Échange pour ${recompense.nom}`
            }
        });

        return echange;
    }

    /**
     * Met à jour l'état d'un échange
     * @param {number} id - ID de l'échange
     * @param {string} etat - Nouvel état
     * @returns {Promise<Object>} - L'échange mis à jour
     */
    async updateEtat(id, etat) {
        return prisma.echangeFidelite.update({
            where: { id_echange: id },
            data: { etat }
        });
    }

    /**
     * Annule un échange et rembourse les points
     * @param {number} id - ID de l'échange
     * @returns {Promise<Object>} - L'échange annulé
     */
    async cancelExchange(id) {
        const echange = await this.findById(id);

        if (!echange || echange.etat === 'annule') {
            throw new Error('Échange non trouvé ou déjà annulé');
        }

        // Mettre à jour l'état de l'échange
        await this.updateEtat(id, 'annule');

        // Rembourser les points
        await prisma.fidelite.update({
            where: { id_fidelite: echange.id_fidelite },
            data: {
                solde_points: {
                    increment: echange.points_utilises
                },
                derniere_mise_a_jour: new Date()
            }
        });

        // Créer une transaction positive
        await prisma.transactionFidelite.create({
            data: {
                id_fidelite: echange.id_fidelite,
                changement_points: echange.points_utilises,
                raison: `Remboursement pour annulation d'échange (${echange.recompense.nom})`
            }
        });

        return echange;
    }

    /**
     * Récupère les échanges par période
     * @param {Date} debut - Date de début
     * @param {Date} fin - Date de fin
     * @returns {Promise<Array>} - Liste des échanges
     */
    static findByPeriod(debut, fin) {
        return prisma.echangeFidelite.findMany({
            where: {
                date_echange: {
                    gte: debut,
                    lte: fin
                }
            },
            orderBy: { date_echange: 'desc' },
            include: {
                fidelite: {
                    include: {
                        client: true
                    }
                },
                recompense: true
            }
        });
    }

    /**
     * Récupère les échanges par état
     * @param {string} etat - État recherché
     * @returns {Promise<Array>} - Liste des échanges
     */
    static findByEtat(etat) {
        return prisma.echangeFidelite.findMany({
            where: { etat },
            orderBy: { date_echange: 'desc' },
            include: {
                fidelite: {
                    include: {
                        client: true
                    }
                },
                recompense: true
            }
        });
    }
}

module.exports = EchangeFideliteModel;
