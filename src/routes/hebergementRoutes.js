// src/routes/hebergementRoutes.js
import express from 'express';
import HebergementController from '../controllers/hebergementController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Routes publiques
router.get('/', HebergementController.getAllHebergements);
router.get('/search', HebergementController.searchAvailableHebergements);
router.get('/:id', HebergementController.getHebergementById);
router.get('/:id/availability', HebergementController.checkAvailability);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticateJWT, HebergementController.createHebergement);
router.put('/:id', authenticateJWT, HebergementController.updateHebergement);
router.delete('/:id', authenticateJWT, HebergementController.deleteHebergement);

// Routes pour les médias
router.post('/:id/media', authenticateJWT, upload.single('media'), HebergementController.addMedia);
router.delete('/:id/media/:mediaId', authenticateJWT, HebergementController.removeMedia);

export default router;