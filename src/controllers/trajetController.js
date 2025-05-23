import TrajetService from '../services/trajet.service.js';
import * as AuthHelpers from '../utils/auth.helpers.js';

class TrajetController {
    /**
     * Récupérer un trajet par son ID
     *
     * @route GET /trajets/:id
     * @param {import('express').Request} req - Requête contenant l'ID du trajet
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getById(req, res, next) {
        try {
            const trajetId = Number(req.params.id);
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );
            const trajet = await TrajetService.getById(trajetId, personnelId);

            res.status(200).json({
                status: 'OK',
                message: 'Trajet récupéré avec succès.',
                data: trajet
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer les trajets du chauffeur connecté
     *
     * @route GET /trajets/me
     * @param {import('express').Request} req - Requête contenant les informations de l'utilisateur
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getMyTrajets(req, res, next) {
        try {
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );

            const filters = {
                ...(req.query.statut && { statut: req.query.statut }),
                ...(req.query.dateMin && { dateMin: req.query.dateMin }),
                ...(req.query.dateMax && { dateMax: req.query.dateMax })
            };

            const trajets = await TrajetService.getByChauffeur(
                personnelId,
                filters
            );

            res.status(200).json({
                status: 'OK',
                message: 'Trajets du chauffeur récupérés avec succès.',
                data: trajets
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer le planning des trajets groupés par jour
     *
     * @route GET /trajets/planning
     * @param {import('express').Request} req - Requête contenant les dates de filtre
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async getPlanning(req, res, next) {
        try {
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );
            const { dateMin, dateMax } = req.query;

            const trajets = await TrajetService.getPlanningParJour(
                personnelId,
                dateMin,
                dateMax
            );

            res.status(200).json({
                status: 'OK',
                message: 'Planning des trajets récupéré avec succès.',
                data: trajets
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Créer un nouveau trajet
     *
     * @route POST /trajets
     * @param {import('express').Request} req - Requête contenant les données du trajet
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async create(req, res, next) {
        try {
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );
            const trajet = await TrajetService.creerTrajet(
                personnelId,
                req.body
            );

            res.status(201).json({
                status: 'CREATED',
                message: 'Trajet créé avec succès.',
                data: trajet
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Modifier les horaires d’un trajet (par le chauffeur)
     *
     * @route PATCH /trajets/:id/horaires
     * @param {import('express').Request} req - Requête contenant les nouvelles dates
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async updateHoraires(req, res, next) {
        try {
            const trajetId = Number(req.params.id);
            const { date_prise_en_charge, date_depose } = req.body;
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );

            const trajet = await TrajetService.modifierHoraires(
                trajetId,
                personnelId,
                date_prise_en_charge,
                date_depose
            );

            res.status(200).json({
                status: 'OK',
                message: 'Horaires du trajet mis à jour avec succès.',
                data: trajet
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Modifier le statut d’un trajet
     *
     * @route PATCH /trajets/:id/statut
     * @param {import('express').Request} req - Requête contenant l'ID du trajet et le nouveau statut
     * @param {import('express').Response} res - Réponse à retourner
     * @param {Function} next - Fonction de gestion des erreurs
     * @returns {Promise<void>}
     */
    static async updateStatut(req, res, next) {
        try {
            const trajetId = Number(req.params.id);
            const { statut } = req.body;
            const personnelId = await AuthHelpers.assertChauffeurAutorise(
                req.utilisateur.email
            );

            const trajet = await TrajetService.changerStatut(
                trajetId,
                statut,
                personnelId
            );

            res.status(200).json({
                status: 'OK',
                message: `Statut du trajet mis à jour : ${statut}`,
                data: trajet
            });
        } catch (error) {
            next(error);
        }
    }
}

export default TrajetController;
