import express from 'express';
import FormationController from '../controllers/formationController.js';
import { authenticateJWT, checkRole, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Route pour récupérer toutes les formations.
 * Accessible uniquement par les utilisateurs avec les rôles SUPER_ADMIN ou ADMIN_GENERAL.
 */
router.get(
    '/',
    authenticateJWT,
    checkRole(['SUPER_ADMIN', 'ADMIN_GENERAL']),
    FormationController.getAll
);

/**
 * Route pour créer une nouvelle formation.
 * Accessible uniquement par les utilisateurs ayant le rôle d'administrateurs.
 */
router.post('/', authenticateJWT, isAdmin, FormationController.create);

/**
 * Route pour assigner une formation à un chauffeur.
 * L'ID de la formation et du chauffeur sont fournis dans l'URL.
 * Accessible uniquement par les utilisateurs ayant le rôle d'administrateurs.
 */
router.post(
    '/:id/assigner/:chauffeurId',
    authenticateJWT,
    isAdmin,
    FormationController.assigner
);

/**
 * Route pour marquer une formation comme complétée pour un chauffeur.
 * Accessible uniquement par les utilisateurs avec les rôles ADMIN_GENERAL ou SUPER_ADMIN.
 */
router.patch(
    '/:id/completer/:chauffeurId',
    authenticateJWT,
    checkRole(['ADMIN_GENERAL', 'SUPER_ADMIN']),
    FormationController.completer
);

/**
 * Route pour récupérer les formations d'un chauffeur spécifique.
 * Accessible par les chauffeurs eux-mêmes ainsi que les utilisateurs ayant les rôles ADMIN_GENERAL ou SUPER_ADMIN.
 */
router.get(
    '/chauffeur/:id',
    authenticateJWT,
    checkRole(['CHAUFFEUR', 'ADMIN_GENERAL', 'SUPER_ADMIN']),
    FormationController.getByChauffeur
);

/**
 * Route pour récupérer tous les chauffeurs affectés à une formation spécifique.
 * Accessible uniquement par les utilisateurs ayant le rôle d'administrateurs.
 */
router.get(
    '/:id/chauffeurs',
    authenticateJWT,
    isAdmin,
    FormationController.getChauffeursParFormation
);

/**
 * Route pour mettre à jour une formation existante.
 * Accessible uniquement par les utilisateurs ayant le rôle d'administrateurs.
 */
router.put('/:id', authenticateJWT, isAdmin, FormationController.update);

/**
 * Route pour désactiver une formation dans le catalogue.
 * Accessible uniquement par les utilisateurs ayant le rôle d'administrateurs.
 */
router.patch(
    '/:id/desactiver',
    authenticateJWT,
    isAdmin,
    FormationController.disable
);

export default router;
