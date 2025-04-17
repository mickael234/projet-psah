import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import {
    authenticateJWT,
    checkClientAccess,
    isClient
} from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', ReservationController.getAllReservations);
router.get('/:id', ReservationController.getReservationById);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticateJWT, ReservationController.createReservation);
router.put('/:id', authenticateJWT, ReservationController.updateReservation);
router.delete('/:id', authenticateJWT, ReservationController.deleteReservation);
router.post(
    '/:id/cancel',
    authenticateJWT,
    ReservationController.cancelReservation
);
/**
 * Récupération des réservations actuelles d'un client en vérifiant que l'utilisateur a le droit d'accéder qu'à ses propres données 
router.get(
    '/actuelles/:clientId',
    authenticateJWT,
    checkClientAccess,
    ReservationController.getAllUserPresentReservations
);

/**
* Récupération des réservations passées d'un client en vérifiant que l'utilisateur a le droit d'accéder qu'à ses propres données 
*/
router.get(
    '/passees/:clientId',
    authenticateJWT,
    checkClientAccess,
    ReservationController.getAllUserPastReservations
);

export default router;
