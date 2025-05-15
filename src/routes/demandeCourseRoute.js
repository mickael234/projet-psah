import express from 'express';
import DemandeCourseController from '../controllers/demandeCourseController.js';
import {authenticateJWT, checkRole, isClient} from "../middleware/auth.js"

const router = express.Router();

// Récupérer les demandes du client connecté
router.get('/me', authenticateJWT, isClient, DemandeCourseController.getMesDemandes);

// Récupérer les demandes en attente pour les chauffeurs
router.get('/en-attente', authenticateJWT, DemandeCourseController.getEnAttente);

// Récupérer une demande par ID
router.get('/:id', authenticateJWT, DemandeCourseController.getById);

// Créer une nouvelle demande
router.post('/', authenticateJWT, isClient, DemandeCourseController.create);

// Modifier une demande (lieu, horaire) tant que le statut = en_attente
router.patch('/:id', authenticateJWT, isClient, DemandeCourseController.update);

// Modifier le statut (accepter, refuser, annuler)
router.patch('/:id/statut', authenticateJWT, checkRole("CHAUFFEUR", "ADMIN", "SUPER_ADMIN"), DemandeCourseController.updateStatut);

export default router;
