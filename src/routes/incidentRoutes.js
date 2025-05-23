import express from 'express';
import IncidentController from '../controllers/incidentController.js';
import { authenticateJWT, isAdmin, isPersonnel } from '../middleware/auth.js';

const router = express.Router();

/**
 * Route pour signaler un incident.
 */
router.post('/', authenticateJWT, IncidentController.signaler);

/**
 * Route pour récupérer les incidents liés à un trajet spécifique.
 * L'ID du trajet est fourni dans l'URL.
 */
router.get(
    '/trajet/:id',
    authenticateJWT,
    isPersonnel,
    IncidentController.getByTrajet
);

/**
 * Route pour récupérer tous les incidents.
 */
router.get('/', authenticateJWT, isAdmin, IncidentController.getAll);

/**
 * Route pour récupérer un incident spécifique par son ID.
 * L'ID de l'incident est fourni dans l'URL.
 */
router.get('/:id', authenticateJWT, isAdmin, IncidentController.getById);

/**
 * Route pour marquer un incident comme traité.
 * L'ID de l'incident à traiter est fourni dans l'URL.
 */
router.patch(
    '/:id/traite',
    authenticateJWT,
    isAdmin,
    IncidentController.traiter
);

export default router;
