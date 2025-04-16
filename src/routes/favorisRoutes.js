import express from 'express';
import {
  ajouterFavori,
  supprimerFavori,
  listerFavorisUtilisateur
} from '../controllers/favorisController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favoris
 *   description: Gestion des favoris utilisateurs
 */

/**
 * @swagger
 * /api/favoris:
 *   post:
 *     summary: Ajouter une chambre aux favoris
 *     tags: [Favoris]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_utilisateur
 *               - id_chambre
 *             properties:
 *               id_utilisateur:
 *                 type: integer
 *                 example: 1
 *               id_chambre:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Favori ajouté avec succès
 *       400:
 *         description: Données manquantes ou favori existant
 *       500:
 *         description: Erreur interne serveur
 */
router.post('/', ajouterFavori);

/**
 * @swagger
 * /api/favoris:
 *   delete:
 *     summary: Supprimer un favori
 *     tags: [Favoris]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_utilisateur
 *               - id_chambre
 *             properties:
 *               id_utilisateur:
 *                 type: integer
 *                 example: 1
 *               id_chambre:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Favori supprimé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur interne serveur
 */
router.delete('/', supprimerFavori);

/**
 * @swagger
 * /api/favoris/{id_utilisateur}:
 *   get:
 *     summary: Récupérer les favoris d’un utilisateur
 *     tags: [Favoris]
 *     parameters:
 *       - in: path
 *         name: id_utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des favoris
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erreur interne serveur
 */
router.get('/:id_utilisateur', listerFavorisUtilisateur);

export default router;
