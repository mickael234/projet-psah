import express from 'express';
import {
  enregistrerArrivee,
  enregistrerDepart
} from '../controllers/reservationController.js';

import { genererFacture } from '../controllers/factureController.js';
import { genererFacturePDF } from '../controllers/facturePdfController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Réservations
 *   description: Opérations sur les réservations (check-in, check-out, factures)
 */

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
router.put('/:id/checkin', enregistrerArrivee);

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
router.put('/:id/checkout', enregistrerDepart);

/**
 * @swagger
 * /api/reservations/{id}/facture:
 *   get:
 *     summary: Générer une facture JSON pour une réservation
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
 *         description: Facture JSON générée
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/facture', genererFacture);

/**
 * @swagger
 * /api/reservations/{id}/facture/pdf:
 *   get:
 *     summary: Générer une facture PDF pour une réservation
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
 *         description: Facture PDF générée
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/facture/pdf', genererFacturePDF);

export default router;
