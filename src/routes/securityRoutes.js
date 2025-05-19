import express from "express"
import SecurityController from "../controllers/securityController.js"
import { authenticateJWT, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Routes pour les utilisateurs authentifiés
router.get("/", authenticateJWT, SecurityController.getSecuritySettings)
router.put("/", authenticateJWT, SecurityController.updateSecuritySettings)
router.post("/change-password", authenticateJWT, SecurityController.changePassword)

// Routes pour les administrateurs
router.get("/logs", authenticateJWT, isAdmin, SecurityController.getSecurityLogs)

export default router
