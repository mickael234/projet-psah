import DepenseModel from "../models/depense.model.js";
import DepenseService from "../services/depenseService.js";
import ValidationService from "../services/validationService.js";

class DepenseController {

    /**
     * Récupère une dépense par son ID.
     * @param {Express.Request} req - La requête HTTP.
     * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
     * @returns {Promise<Object>} La réponse HTTP avec la dépense trouvée ou les erreurs.
     */

    static async getById(req, res){
        try {
            const id = parseInt(req.params.id);
            if(isNaN(id) || id === 0){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'ID d de la dépense est invalide."
                });
            }

            const depense = await DepenseModel.findById(id);
            if(!depense){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée."
                });
            }

            res.status(200).json({
                status: 'OK',
                data: depense
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la récuperation de la dépense.',
            });
        }
    }

     /**
     * Récupère toutes les dépenses avec possibilité d'ajouter des filtres.
     * @param {Express.Request} req - La requête HTTP.
     * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
     * @returns {Promise<Object>} La réponse HTTP avec les dépenses trouvées ou les erreurs.
     */

    static async getAll(req, res) {
        try {
            
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            
            // Construction de l'objet filters à partir des query params
            const filters = {
                categorie: req.query.categorie,
                utilisateurId: req.query.utilisateurId,

                dateMin: req.query.dateMin,
                dateMax: req.query.dateMax,
                
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder
            };
            
            // Nettoyage des filtres undefined/null
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
                    delete filters[key];
                }
            });
    
            if (isNaN(page) || page < 1) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "Le numéro de page est invalide. Il doit être un nombre positif."
                });
            }
    
            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "La limite est invalide. Elle doit être un nombre entre 1 et 100."
                });
            }
            
            const depenses = await DepenseModel.findAll(filters, page, limit);
    
            if (!depenses || depenses.length <= 0) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec les filtres n'a été trouvée."
                });
            }

            const total = await DepenseModel.countAll();
    
            // Ajout d'informations de pagination dans la réponse
            return res.status(200).json({
                status: 'OK',
                pagination: {
                    page,
                    limit,
                    totalItems: total,
                    appliedFilters: filters
                },
                data: depenses
            });
                
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la récupération des dépenses.',
            });
        }
    }

    /**
     * Récupère les données financières pour une période spécifique
     * La logique de validation des dates est externalisée dans ValidationService
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Données financières pour la période spécifiée
     */
    static async getFinancialDataByPeriod(req, res) {
        try {
            // Récupération et validation des dates
            const validationResult = ValidationService.validateDatePeriod(req.query);
            if (validationResult.error) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: validationResult.message
                });
            }
            
            const { dateDebutObj, dateFinObj } = validationResult;
            
            // Récupération des données financières
            const resultat = await DepenseModel.findByPeriod(dateDebutObj, dateFinObj);
            
            // Vérification que des données ont été trouvées
            if (!resultat || 
                (!resultat.resume?.totalRevenus && !resultat.resume?.totalDepenses) ||
                (resultat.details?.paiements.length === 0 && resultat.details?.depenses.length === 0)) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune transaction n'a été trouvée pendant cette période."
                });
            }
            
            // Formatage de la période et envoi de la réponse JSON
            return res.status(200).json({
                status: 'OK',
                periode: ValidationService.formatPeriode(resultat.periode),
                data: resultat
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la récupération des données financières.',
            });
        }
    }

    /**
     * Génère un rapport financier PDF pour une période spécifique
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     */
    static async generateFinancialReport(req, res) {
        try {
            // Validation des dates avec le service partagé
            const validationResult = ValidationService.validateDatePeriod(req.query);
            
            if (validationResult.error) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: validationResult.message
                });
            }
            
            // Génération au service PDF
            return DepenseService.generateFinancialReport(req, res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la génération du rapport financier.',
            });
        }
    }

    /**
     * Crée une nouvelle dépense
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Dépense créee
     */

    static async create(req, res){
        try {
            const nouvelleDepense = req.body;
            if(!nouvelleDepense || !nouvelleDepense.id_utilisateur || isNaN(parseInt(nouvelleDepense.montant))){
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'Les données de la requête ne sont pas valides.' 
                });
            }

            const depenseCreee = await DepenseModel.create(nouvelleDepense);

            res.status(201).json({
                status: 'OK',
                data: depenseCreee
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la création d\'une dépense',
            });
        }
    }
    
    /**
     * Met à jour la description d'une dépense
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Dépense mise à jour
     */
    static async updateDescription(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { description } = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'ID de dépense invalide' 
                });
            }
            
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'Description invalide ou manquante' 
                });
            }
            
            const depenseExistante = await DepenseModel.findById(id);
            if(!depenseExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée"
                });
            }

            const depenseAJour = await DepenseModel.updateDescription(parseInt(id), description);

            return res.status(200).json({
                status: 'OK',
                data: depenseAJour
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la mise à jour de la description de la dépense.',
            });
        }
    }
    
    /**
     * Met à jour le montant d'une dépense
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Dépense mise à jour
     */
    static async updatePrice(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { montant } = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'ID de dépense invalide' 
                });
            }
            
            if (montant === undefined || isNaN(parseFloat(montant)) || parseFloat(montant) < 0) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'Montant invalide ou manquant' 
                });
            }

            const depenseExistante = await DepenseModel.findById(id);
            if(!depenseExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée"
                });
            }
            
            
            const depenseAJour = await DepenseModel.updatePrice(parseInt(id), parseFloat(montant));
            
            return res.status(200).json({
                status: 'OK',
                data: depenseAJour
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                status: 'ERREUR SERVEUR', 
                message: 'Erreur lors de la mise à jour du montant'
            });
        }
    }
    
    /**
     * Met à jour la catégorie d'une dépense
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Dépense mise à jour
     */
    static async updateCategory(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { categorie } = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'ID de dépense invalide.' 
                });
            }
            
            if (!categorie || typeof categorie !== 'string') {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'Catégorie invalide ou manquante.' 
                });
            }

            const depenseExistante = await DepenseModel.findById(id);
            if(!depenseExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée."
                });
            }

            
            const depenseAJour = await DepenseModel.updateCategory(parseInt(id), categorie);

            return res.status(200).json({
                status: 'OK',
                data: depenseAJour
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                status: 'ERREUR SERVEUR', 
                message: 'Erreur lors de la mise à jour de la catégorie.'
            });
        }
    }
    
    /**
     * Restaure une dépense supprimée
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Dépense restaurée
     */
    static async restoreExpense(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'ID de dépense invalide.' 
                });
            }

            const depenseExistante = await DepenseModel.findById(id);
            if(!depenseExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée."
                });
            }
            
            const depense = await DepenseModel.restore(parseInt(id));
            
            return res.status(200).json({
                status: 'OK',
                data: depense
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                status: 'ERREUR SERVEUR', 
                message: 'Erreur lors de la restauration de la dépense.'
            });
        }
    }
    
    /**
     * Supprime une dépense de façon logique (soft delete)
     * @param {Request} req - Requête Express
     * @param {Response} res - Réponse Express
     * @returns {Response} - Confirmation de suppression
     */
    static async deleteExpense(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ 
                    status: 'MAUVAISE DEMANDE', 
                    message: 'ID de dépense invalide.' 
                });
            }

            const depenseExistante = await DepenseModel.findById(id);
            if(!depenseExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune dépense avec cet ID n'a été trouvée."
                });
            }

            
            const depenseSupprimee = await DepenseModel.softDelete(parseInt(id));

            return res.status(200).json({
                status: 'OK',
                message: "Dépense supprimée avec succès.",
                data: depenseSupprimee
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la suppression de la dépense.'
            });
        }
    }

}

export default DepenseController;