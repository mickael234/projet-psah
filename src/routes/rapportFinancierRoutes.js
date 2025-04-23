import express from 'express';
import PaiementController from '../controllers/paiementController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get("/financiers", authenticateJWT, PaiementController.generateRapportFinancier);
router.get("/financiers/export", PaiementController.exportRapportFinancierToPDF);
router.get("/revenus", PaiementController.getRevenuTotal);

export default router;