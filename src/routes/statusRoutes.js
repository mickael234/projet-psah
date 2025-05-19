import express from "express"
import StatusController from "../controllers/statusController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()


router.get("/hebergements/status", authenticateJWT, StatusController.getHebergementsStatus)

/**
 * Route de test simple pour vérifier l'authentification
 */
router.get("/hebergements/status-test", authenticateJWT, StatusController.testStatus)


router.put("/hebergements/status/:id", authenticateJWT, StatusController.updateHebergementStatus)

export default router
