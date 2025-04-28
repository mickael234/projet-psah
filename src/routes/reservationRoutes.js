// src/routes/reservationRoutes.js

import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { enregistrerArrivee, enregistrerDepart } from '../controllers/checkincheckoutController.js';
import {
  authenticateJWT,
  checkClientAccess
} from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Réservations
 *   description: Opérations sur les réservations (CRUD, check-in, check-out)
 */

// =========================
// Routes publiques
// =========================
router.get('/', ReservationController.getAllReservations);
router.get('/:id', ReservationController.getReservationById);

// =========================
// Routes protégées (authentification obligatoire)
// =========================
router.post('/', authenticateJWT, ReservationController.createReservation);
router.put('/:id', authenticateJWT, ReservationController.updateReservation);
router.delete('/:id', authenticateJWT, ReservationController.deleteReservation);
router.post('/:id/cancel', authenticateJWT, ReservationController.cancelReservation);

// =========================
// Check-in et Check-out
// =========================

/**
 * @swagger
 * /api/reservations/{id}/checkin:
 *   put:
 *     summary: Enregistrer l'arrivée d'un client (Check-in)
 *     tags: [Réservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Check-in effectué avec succès
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/checkin', authenticateJWT, enregistrerArrivee);

/**
 * @swagger
 * /api/reservations/{id}/checkout:
 *   put:
 *     summary: Enregistrer le départ d'un client (Check-out)
 *     tags: [Réservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Check-out effectué avec succès
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/checkout', authenticateJWT, enregistrerDepart);

// =========================
// Récupération des réservations d'un client
// =========================

router.get(
  '/actuelles/:clientId',
  authenticateJWT,
  checkClientAccess,
  ReservationController.getAllUserPresentReservations
);

router.get(
  '/passees/:clientId',
  authenticateJWT,
  checkClientAccess,
  ReservationController.getAllUserPastReservations
);

export default router;
