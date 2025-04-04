// src/routes/profileRoutes.js
import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { authenticateJWT, isClient } from '../middleware/auth.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes de profil
router.use(authenticateJWT);
router.use(isClient);

// Routes pour la gestion du profil
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);
router.post('/photo', upload.single('photo'), ProfileController.updateProfilePhoto);
router.put('/billing', ProfileController.updateBillingInfo);

// Routes pour l'authentification à deux facteurs
router.post('/2fa/setup', ProfileController.setupTwoFactorAuth);
router.post('/2fa/verify', ProfileController.verifyAndEnableTwoFactorAuth);
router.post('/2fa/disable', ProfileController.disableTwoFactorAuth);

export default router;