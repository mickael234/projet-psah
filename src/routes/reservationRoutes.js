import express from 'express';
import {
  creerReservation,
  enregistrerArrivee,
  enregistrerDepart
} from '../controllers/reservationController.js';

import { genererFacture } from '../controllers/factureController.js'; //  Ajout pour la génération de facture

const router = express.Router();

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     tags:
 *       - Réservations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_client:
 *                 type: integer
 *               prix_total:
 *                 type: number
 *               etat:
 *                 type: string
 *               etat_paiement:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation créée avec succès.
 *       500:
 *         description: Erreur lors de la création de la réservation.
 */
router.post('/', creerReservation);

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

/**
 * @swagger
 * /api/reservations/{id}/facture:
 *   get:
 *     summary: Générer une facture au format JSON pour une réservation
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
 *         description: Facture générée avec succès.
 *       404:
 *         description: Réservation non trouvée.
 *       500:
 *         description: Erreur lors de la génération de la facture.
 */
router.get('/:id/facture', genererFacture); // Nouvelle route ajoutée

export default router;
