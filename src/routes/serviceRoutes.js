// src/routes/serviceRoutes.js
import express from 'express';
import {
  creerService,
  listerServices,
  modifierService,
  supprimerService
} from '../controllers/serviceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Gestion des services de l'hôtel
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Créer un service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     summary: Obtenir tous les services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Liste des services
 *       500:
 *         description: Erreur serveur
 *
 * /api/services/{id}:
 *   put:
 *     summary: Modifier un service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service modifié avec succès
 *       404:
 *         description: Service non trouvé
 *
 *   delete:
 *     summary: Supprimer un service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Service supprimé avec succès
 *       404:
 *         description: Service non trouvé
 */

router.post('/', creerService);
router.get('/', listerServices);
router.put('/:id', modifierService);
router.delete('/:id', supprimerService);

export default router;
