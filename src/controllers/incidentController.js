import IncidentService from '../services/incident.service.js';
import * as AuthHelpers from '../utils/auth.helpers.js';

class IncidentController {
    /**
     * Déclarer un incident (chauffeur ou client)
     * @route POST /incidents
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async signaler(req, res, next) {
        try {
            const utilisateurId = await AuthHelpers.getUtilisateurIdFromUser(req.user.email);
            const data = {
                ...req.body,
                id_utilisateur: utilisateurId
            };
            const incident = await IncidentService.signalerIncident(data);

            res.status(201).json({
                status: 'CREATED',
                message: "Incident signalé avec succès.",
                data: incident
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer les incidents liés à un trajet
     * @route GET /incidents/trajet/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getByTrajet(req, res, next) {
        try {
            const idTrajet = Number(req.params.id);
            const incident = await IncidentService.getByTrajetId(idTrajet);

            res.status(200).json({
                status: 'OK',
                message: 'Incident récupéré avec succès.',
                data: incident
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Lister tous les incidents
     * @route GET /incidents
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getAll(req, res, next) {
        try {
            const incidents = await IncidentService.getAllIncidents();
            res.status(200).json({
                status: 'OK',
                message: 'Liste des incidents récupérée avec succès.',
                data: incidents
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marquer un incident comme traité
     * @route PATCH /incidents/:id/traite
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async traiter(req, res, next) {
        try {
            const incidentId = Number(req.params.id);
            const updated = await IncidentService.traiterIncident(incidentId);

            res.status(200).json({
                status: 'OK',
                message: 'Incident marqué comme traité.',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }
}

export default IncidentController;