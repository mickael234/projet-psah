import express from "express"
import PaiementController from "../controllers/paiementController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

// Routes protégées (nécessitent une authentification)
router.get('/reservation/:id', authenticateJWT,PaiementController.getPaiementsByReservation);
router.get('/en-retard', authenticateJWT, PaiementController.getPaiementsEnRetard)
router.get('/:id', authenticateJWT, PaiementController.getPaiementById);
router.post('/', authenticateJWT, PaiementController.createPaiement);
router.put('/:id', authenticateJWT, PaiementController.updatePaiement);
router.post('/:id/refund', authenticateJWT, PaiementController.refundPaiement);
router.patch('/:id/status', authenticateJWT, PaiementController.updatePaiementStatus)

export default router;
