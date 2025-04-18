import express from 'express';
import { enregistrerArrivee, enregistrerDepart } from '../controllers/reservationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/reservations/{id}/checkin:
 *   put:
 *     summary: Enregistrer l'arrivée (check-in) d'un client
 *     tags:
 *       - Réservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la réservation
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-in effectué avec succès.
 *       404:
 *         description: Réservation non trouvée.
 *       500:
 *         description: Erreur lors du check-in.
 */
router.put('/:id/checkin', enregistrerArrivee);

/**
 * @swagger
 * /api/reservations/{id}/checkout:
 *   put:
 *     summary: Enregistrer le départ (check-out) d'un client
 *     tags:
 *       - Réservations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la réservation
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-out effectué avec succès.
 *       404:
 *         description: Réservation non trouvée.
 *       500:
 *         description: Erreur lors du check-out.
 */
router.put('/:id/checkout', enregistrerDepart);

export default router;
