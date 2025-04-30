import express from 'express';
import ReservationsServicesController from '../controllers/reservationsServicesController.js';
import { authenticateJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Autorisé : ADMIN_GENERAL, RECEPTIONNISTE, RESPONSABLE_HEBERGEMENT
router.post(
  '/reservations/:id/services',
  authenticateJWT,
  checkRole(['ADMIN_GENERAL', 'RECEPTIONNISTE', 'RESPONSABLE_HEBERGEMENT']),
  ReservationsServicesController.ajouter
);

export default router;
