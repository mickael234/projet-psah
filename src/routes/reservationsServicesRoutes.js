import express from 'express';
import ReservationsServicesController from '../controllers/reservationsServicesController.js';
import { authenticateJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/reservations/:id/services',
  authenticateJWT,
  checkRole(['ADMIN_GENERAL', 'RECEPTIONNISTE', 'RESPONSABLE_HEBERGEMENT']),
  ReservationsServicesController.ajouter
);

router.put(
  '/reservations/:id/services/:id_service',
  authenticateJWT,
  checkRole(['ADMIN_GENERAL', 'RECEPTIONNISTE', 'RESPONSABLE_HEBERGEMENT']),
  ReservationsServicesController.modifier
);

router.delete(
  '/reservations/:id/services/:id_service',
  authenticateJWT,
  checkRole(['ADMIN_GENERAL', 'RECEPTIONNISTE', 'RESPONSABLE_HEBERGEMENT']),
  ReservationsServicesController.supprimer
);

export default router;
