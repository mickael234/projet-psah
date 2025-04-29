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

    static async findAll(filters = {}, page = 1, limit = 10){
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
     * Compte le nombre de dépenses
     * @returns {Promise<number>} - Dépenses en tout
     */

    static async countAll(){
        return await prisma.depense.count();
    }

    /**
     * Récupère les données financières pour une période définie par deux dates
     * @param {Date|String} dateDebut - Date de début de la période
     * @param {Date|String} dateFin - Date de fin de la période
     * @returns {Object} - Données financières pour la période spécifiée
     */
    static async findByPeriod(dateDebut, dateFin) {
        // Conversion et normalisation des dates
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        
        // S'assurer que les dates sont au format correct pour les comparaisons
        debut.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        
        // Conditions communes pour les requêtes paiements
        const paiementConditions = {
            etat: 'complete',
            date_transaction: {
                gte: debut,
                lte: fin
            }
        };
        
        // Conditions communes pour les requêtes dépenses
        const depenseConditions = {
            date_creation: {
                gte: debut,
                lte: fin
            },
            date_suppression: null
        };

        // Obtenir les sommes et statistiques agrégées
        const [
            revenuTotal,
            depensesTotales,
            depensesParCategorie,
            paiementsParMethode,
            listePaiements,
            listeDepenses
        ] = await Promise.all([
            // 1. Somme totale des revenus
            prisma.paiement.aggregate({
                where: paiementConditions,
                _sum: {
                    montant: true
                }
            }),
            
            // 2. Somme totale des dépenses
            prisma.depense.aggregate({
                where: depenseConditions,
                _sum: {
                    montant: true
                }
            }),
            
            // 3. Dépenses groupées par catégorie
            prisma.depense.groupBy({
                by: ['categorie'],
                where: depenseConditions,
                _sum: {
                    montant: true
                }
            }),
            
            // 4. Paiements groupés par méthode
            prisma.paiement.groupBy({
                by: ['methode_paiement'],
                where: paiementConditions,
                _sum: {
                    montant: true
                }
            }),
            
            // 5. Liste détaillée des paiements
            prisma.paiement.findMany({
                where: paiementConditions,
                include: {
                    reservation: {
                        select: {
                            id_reservation: true,
                            client: {
                                select: {
                                    nom: true,
                                    prenom: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    date_transaction: 'desc'
                }
            }),
            
            // 6. Liste détaillée des dépenses
            prisma.depense.findMany({
                where: depenseConditions,
                include: {
                    utilisateur: {
                        select: {
                            nom_utilisateur: true
                        }
                    }
                },
                orderBy: {
                    date_creation: 'desc'
                }
            })
        ]);
        
        // Calculer le solde
        const totalRevenus = revenuTotal._sum.montant || 0;
        const totalDepenses = depensesTotales._sum.montant || 0;
        const solde = totalRevenus - totalDepenses;
        
        // Formater les résultats
        return {
            // Résumé financier
            resume: {
                totalRevenus,
                totalDepenses,
                solde,
                depensesParCategorie: Object.fromEntries(
                    depensesParCategorie.map(depense => [depense.categorie, depense._sum.montant])
                ),
                paiementsParMethode: Object.fromEntries(
                    paiementsParMethode.map(paiement => [paiement.methode_paiement, paiement._sum.montant])
                )
            },
            
            // Données détaillées
            details: {
                paiements: listePaiements,
                depenses: listeDepenses
            },
            
            // Métadonnées de la période
            periode: {
                dateDebut: debut.toISOString().split('T')[0],
                dateFin: fin.toISOString().split('T')[0],
                nbJours: Math.ceil((fin - debut) / (1000 * 60 * 60 * 24))
            }
        };
    }

    /**
     * Crée une nouvelle dépense
     * @param {Object} nouvelleDepense
     * @returns {Promise<Object>} - La dépense crée
     */

    static async create(nouvelleDepense){
        return await prisma.depense.create({
            data : nouvelleDepense
        })
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