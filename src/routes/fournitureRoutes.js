import express from "express"
import FournitureController from "../controllers/fournitureController.js"
import { authenticateJWT } from "../middleware/auth.js"
import { verifierRoleMaintenance } from "../middleware/role-auth.js"

const router = express.Router()


router.get("/", authenticateJWT, FournitureController.getAllFournitures)


router.post("/", authenticateJWT, verifierRoleMaintenance, FournitureController.createFourniture)


router.put(
  "/:id_fourniture/utilisation",
  authenticateJWT,
  verifierRoleMaintenance,
  FournitureController.enregistrerUtilisation,
)


router.post("/commande", authenticateJWT, verifierRoleMaintenance, FournitureController.creerCommande)


router.put(
  "/commande/:id_commande/statut",
  authenticateJWT,
  verifierRoleMaintenance,
  FournitureController.updateCommandeStatus,
)

export default router
