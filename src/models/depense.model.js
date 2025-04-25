import prisma from "../config/prisma.js"

class DepenseModel {
    /**
     * Trouve un dépense par son ID
     * @param {number} id - ID de la dépense
     * @returns {Promise<Object>} - La dépense reécupérée
     */
    static async findById(id){
        return await prisma.depense.findUnique({
            where: {
                id_depense: id
            }
        })
    }

    /**
     * Obtenir toutes les dépenses avec filtres 
     * @param {Object} filters - Filtres à appliquer
     * @param {number} page - Numéro de page
     * @param {number} limit - Nombre d'éléments par page
     * @returns {Promise<Array>} - Les dépenses trouvées
     */

    static async findAll(filters = {}, page, limit = 10){
        const skip = (page - 1) * limit;

        const where = {
            date_suppression : null
        };

        if (filters.categorie) {
            where.categorie = filters.categorie;
        }
    
        if (filters.utilisateurId) {
            where.id_utilisateur = parseInt(filters.utilisateurId);
        }
    
        if (filters.dateMin || filters.dateMax) {
            where.date_creation = {};
            if (filters.dateMin) {
                where.date_creation.gte = new Date(filters.dateMin);
            }
            if (filters.dateMax) {
                where.date_creation.lte = new Date(filters.dateMax);
            }
        }

        const orderBy = {};
        if (filters.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder === 'asc' ? 'asc' : 'desc';
        } else {
            orderBy.date_creation = 'asc';
        }


        return await prisma.depense.findMany({
            where,
            orderBy,
            include : {
                utilisateur : {
                    select : {
                        nom_utilisateur : true
                    }
                }
            },
            skip,
            take: limit
        })
    }

    /**
     * Trouver les dépenses et les paiements selon un mois et une année en particulier
     * @param {number} mois - Mois choisi
     * @param {number} annee - Année choisie
     * @returns {Promise<Array>} - Les dépenses trouvées selon la periode choisie
     */
    
    static async findByPeriod(mois, annee) {
        const dateDebut = new Date(`${annee}-${mois}-01`);
        const dateFin = new Date(`${annee}-${mois}-31`);

        const revenuTotal = await prisma.paiement.aggregate({
            where: {
                etat: 'complete',
                date_transaction: {
                gte: dateDebut,
                lte: dateFin
                }
            },
            _sum: {
                montant: true
            }
        });


        const depensesTotales = await prisma.depense.aggregate({
            where: {
                date_creation: {
                gte: dateDebut,
                lte: dateFin
                },
                date_suppression: null
            },
            _sum: {
                montant: true
            }
        });


        const depensesParCategorie = await prisma.depense.groupBy({
            by: ['categorie'],
            where: {
                date_creation: {
                gte: dateDebut,
                lte: dateFin
                },
                date_suppression: null
            },
            _sum: {
                montant: true
            }
        });


        const paiementsParMethode = await prisma.paiement.groupBy({
            by: ['methode_paiement'],
            where: {
                etat: 'complete',
                date_transaction: {
                gte: dateDebut,
                lte: dateFin
                }
            },
            _sum: {
                montant: true
            }
        });

        return {
            totalRevenus: revenuTotal._sum.montant || 0,
            totalDepenses: depensesTotales._sum.montant || 0,
            solde: (revenuTotal._sum.montant || 0) - (depensesTotales._sum.montant || 0),
            depensesParCategorie: Object.fromEntries(
                depensesParCategorie.map(d => [d.categorie, d._sum.montant])
            ),
            paiementsParMethode: Object.fromEntries(
                paiementsParMethode.map(p => [p.methode_paiement, p._sum.montant])
            )
        }
    }


    /**
     * Mettre à jour la description d'une dépense
     * @param {number} id - ID de la dépense
     * @param {Object} nouvelleDescription - Nouvelle description de la dépense
     * @returns {Promise<Object>} - La dépense modifiée
     */

    static async updateDescription(id, nouvelleDescription){
        return await prisma.depense.update({
            where : {
                id_depense: id
            },
            data : {
                description: nouvelleDescription,
                date_modification: new Date()
            }
        })
    }


    /**
     * Mettre à jour le montant d'une dépense
     * @param {number} id - ID de la dépense
     * @param {Object} nouveauMontant - Nouvelle catégorie de la dépense
     * @returns {Promise<Object>} - La dépense modifiée
     */
    static async updatePrice(id, nouveauMontant){
        return await prisma.depense.update({
            where : {
                id_depense: id
            },
            data : {
                montant: nouveauMontant,
                date_modification: new Date()
            }
        })
    }

    /**
     * Mettre à jour la catégorie d'une dépense
     * @param {number} id - ID de la dépense
     * @param {Object} nouvelleCategorie - Nouvelle catégorie de la dépense
     * @returns {Promise<Object>} - La dépense modifiée
     */

    static async updateCategory(id, nouvelleCategorie){
        return await prisma.depense.update({
            where: {
                id_depense: id
            },
            data : {
                categorie: nouvelleCategorie,
                date_modification: new Date()
            }
        })
    }

    /**
     * Restaure une dépense supprimée
     * @param {number} id - ID de la dépense
     * @returns {Promise<Object>} - La dépense restaurée
     */

    static async restore(id){
        return await prisma.depense.update({
            where: {
                id_depense: id
            },
            data : {
                date_suppression: null
            }
        })
    }

    /**
     * Supprime une dépense par son ID tout en gardant en historique (soft delete)
     * @param {number} id - ID de la dépense
     * @returns {Promise<Object>} - La dépense "supprimée"
     */
    static async softDelete(id){
        return await prisma.depense.update({
            where: {
                id_depense: id
            },
            data : {
                date_suppression: new Date()
            }
        })
    }
}

export default DepenseModel;