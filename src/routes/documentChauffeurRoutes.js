import express from 'express';
import DocumentChauffeurController from '../controllers/documentChauffeurController.js';
import { authenticateJWT, checkRole, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Route pour téléverser ou mettre à jour les documents d'un chauffeur connecté.
 * Accessible uniquement par le chauffeur lui-même.
 */
router.post(
    '/',
    authenticateJWT,
    checkRole(['CHAUFFEUR']),
    DocumentChauffeurController.upload
);

/**
 * Route pour valider ou rejeter les documents d'un chauffeur.
 * Accessible uniquement par les utilisateurs avec le rôle administrateur.
 * L'ID du chauffeur est fourni dans l'URL.
 */
router.patch(
    '/:id/valider',
    authenticateJWT,
    isAdmin,
    DocumentChauffeurController.valider
);

/**
 * Route pour récupérer les chauffeurs ayant un permis expiré.
 * Accessible uniquement par les utilisateurs avec le rôle administrateur.
 */
router.get(
    '/permis-expire',
    authenticateJWT,
    isAdmin,
    DocumentChauffeurController.getChauffeursAvecPermisExpire
);

export default router;
