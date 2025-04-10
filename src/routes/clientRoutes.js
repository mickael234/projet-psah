import express from "express"
import ClientController from "../controllers/clientController.js"
import { authenticateJWT, checkRole } from "../middleware/auth.js"

const router = express.Router()

// Routes publiques
router.get("/", ClientController.getAllClients)
router.get("/:id", ClientController.getClientById)
router.post("/", ClientController.createClient)

// Routes protégées avec vérification de rôle
router.put(
  "/:id",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "SUPER_ADMIN", "RECEPTIONNISTE"]),
  ClientController.updateClient,
)
router.delete("/:id", authenticateJWT, checkRole(["ADMIN_GENERAL", "SUPER_ADMIN"]), ClientController.deleteClient)
router.get(
  "/:id/reservations",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "SUPER_ADMIN", "RECEPTIONNISTE", "CLIENT"]),
  ClientController.getClientReservations,
)

export default router

