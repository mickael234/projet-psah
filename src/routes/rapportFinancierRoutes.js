import express from 'express';
import PaiementController from '../controllers/paiementController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get("/financiers", authenticateJWT, PaiementController.generateRapportFinancier)

export default router;