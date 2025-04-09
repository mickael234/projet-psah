// src/routes/reservationRoutes.js
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', ReservationController.getAllReservations);
router.get('/:id', ReservationController.getReservationById);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticateJWT, ReservationController.createReservation);
router.put('/:id', authenticateJWT, ReservationController.updateReservation);
router.delete('/:id', authenticateJWT, ReservationController.deleteReservation);
router.post('/:id/cancel', authenticateJWT, ReservationController.cancelReservation);

export default router;