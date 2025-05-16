import DemandeCourseService from '../services/demandeCourse.service.js';
import * as AuthHelpers from '../utils/auth.helpers.js';

class DemandeCourseController {
     /**
     * Récupérer une demande de course par son ID
     * 
     * @route GET /demandes/:id
     * @param {import('express').Request} req - Requête Express contenant l'ID de la demande
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const demande = await DemandeCourseService.getById(id);

            res.status(200).json({
                status: 'OK',
                message: 'Demande de course récupérée avec succès.',
                data: demande
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer les demandes du client connecté
     * 
     * @route GET /demandes/me
     * @param {import('express').Request} req - Requête Express avec utilisateur connecté
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getMesDemandes(req, res, next) {
        try {
            const clientId = await AuthHelpers.getClientIdFromUser(req.user.email);

            const filters = {
                ...(req.query.statut && { statut: req.query.statut }),
                ...(req.query.dateMin && { dateMin: req.query.dateMin }),
                ...(req.query.dateMax && { dateMax: req.query.dateMax })
            };

            const demandes = await DemandeCourseService.getByClient(
                clientId,
                filters
            );

            res.status(200).json({
                status: 'OK',
                message: 'Demandes du client récupérées avec succès.',
                data: demandes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer toutes les demandes en attente pour un chauffeur
     * 
     * @route GET /demandes/en-attente
     * @param {import('express').Request} req - Requête Express avec filtres optionnels
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getEnAttente(req, res, next) {
        try {
            const filters = {
                ...(req.query.dateMin && { dateMin: req.query.dateMin }),
                ...(req.query.dateMax && { dateMax: req.query.dateMax })
            };

            const demandes = await DemandeCourseService.getEnAttente(filters);

            res.status(200).json({
                status: 'OK',
                message: 'Demandes en attente récupérées avec succès.',
                data: demandes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Créer une nouvelle demande de course
     * 
     * @route POST /demandes
     * @param {import('express').Request} req - Requête Express contenant les données de la demande
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async create(req, res, next) {
        try {
            const clientId = await AuthHelpers.getClientIdFromUser(req.user.email);
            const data = {
                ...req.body,
                id_client: clientId
            };

            const demande = await DemandeCourseService.creerDemande(data);

            res.status(201).json({
                status: 'CREATED',
                message: 'Demande de course créée avec succès.',
                data: demande
            });
        } catch (error) {
            next(error);
        }
    }

     /**
     * Modifier une demande existante (lieu, horaire)
     * 
     * @route PATCH /demandes/:id
     * @param {import('express').Request} req - Requête Express contenant l'ID de la demande et les données à modifier
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const demande = await DemandeCourseService.modifierDemande(
                id,
                req.body
            );

            res.status(200).json({
                status: 'OK',
                message: 'Demande modifiée avec succès.',
                data: demande
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Changer le statut d'une demande (acceptee, refusee, annulee)
     * 
     * @route PATCH /demandes/:id/statut
     * @param {import('express').Request} req - Requête Express contenant l'ID de la demande et le nouveau statut
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async updateStatut(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { statut } = req.body;

            const demande = await DemandeCourseService.changerStatut(
                id,
                statut
            );

            res.status(200).json({
                status: 'OK',
                message: `Statut mis à jour : ${statut}`,
                data: demande
            });
        } catch (error) {
            next(error);
        }
    }

     /**
     * Supprimer une demande de course
     * 
     * @route DELETE /demandes/:id
     * @param {import('express').Request} req - Requête Express contenant l'ID de la demande
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async delete(req, res, next) {
        try {
            const id = Number(req.params.id);

            const demande = await DemandeCourseService.supprimer(id);

            res.status(200).json({
                status: 'OK',
                message: 'Demande supprimée avec succès.',
                data: demande
            });
        } catch (error) {
            next(error);
        }
    }
}

export default DemandeCourseController;
