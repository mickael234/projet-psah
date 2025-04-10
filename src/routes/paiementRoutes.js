// src/routes/paiementRoutes.js
import express from 'express';
import PaiementController from '../controllers/paiementController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.get('/reservation/:id', authenticateJWT, PaiementController.getPaiementsByReservation);
router.get('/:id', authenticateJWT, PaiementController.getPaiementById);
router.post('/', authenticateJWT, PaiementController.createPaiement);
router.put('/:id', authenticateJWT, PaiementController.updatePaiement);
router.post('/:id/refund', authenticateJWT, PaiementController.refundPaiement);

export default router;