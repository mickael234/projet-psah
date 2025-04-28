// src/routes/maintenanceRoutes.js
import express from 'express';
import {
  creerMaintenance,
  listerMaintenancesParChambre
} from '../controllers/maintenanceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Gestion des maintenances des chambres
 */

/**
 * @swagger
 * /api/hebergements/{id}/maintenance:
 *   post:
 *     summary: Créer une maintenance pour une chambre
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la chambre concernée
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - date_debut
 *               - date_fin
 *             properties:
 *               description:
 *                 type: string
 *               date_debut:
 *                 type: string
 *                 format: date-time
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Maintenance créée avec succès
 *       500:
 *         description: Erreur lors de la création de la maintenance
 *
 *   get:
 *     summary: Obtenir les maintenances d’une chambre
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la chambre
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des maintenances
 *       500:
 *         description: Erreur lors de la récupération des maintenances
 */

router.post('/hebergements/:id/maintenance', creerMaintenance);
router.get('/hebergements/:id/maintenance', listerMaintenancesParChambre);

export default router;
