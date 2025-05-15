import express from 'express';
import TrajetController from '../controllers/trajetController.js';
import { authenticateJWT, isClient } from '../middleware/auth.js';

const router = express.Router();

// Récupérer les trajets du chauffeur connecté
router.get('/me', authenticateJWT, TrajetController.getMyTrajets);

// Récupérer le planning groupé par jour
router.get('/planning', authenticateJWT, TrajetController.getPlanning);

// Récupérer un trajet par ID
router.get('/:id', authenticateJWT, TrajetController.getById);

// Modifier les horaires d'un trajet (par le client)
router.patch(
    '/:id/horaires',
    authenticateJWT,
    isClient,
    TrajetController.updateHoraires
);

// Modifier le statut d'un trajet
router.patch('/:id/statut', authenticateJWT, TrajetController.updateStatut);

// Créer un trajet
router.post('/', authenticateJWT, TrajetController.create);

export default router;
