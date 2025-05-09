import express from "express"
import NettoyageController from "../controllers/nettoyageController.js"
import { authenticateJWT } from "../middleware/auth.js"
import { verifierRoleMaintenance } from "../middleware/role-auth.js"

const router = express.Router()

/**
 * Route pour enregistrer une opération de nettoyage pour un hébergement
 */
router.post(
  "/hebergements/:id_chambre",
  authenticateJWT,
  verifierRoleMaintenance,
  NettoyageController.enregistrerNettoyage,
)

/**
 * Route pour récupérer l'historique des nettoyages pour un hébergement
 */
router.get("/hebergements/:id_chambre/historique", authenticateJWT, NettoyageController.getHistoriqueNettoyage)

export default router

