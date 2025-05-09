import express from "express"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

// Route de test simple
router.get("/test-status", authenticateJWT, (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Test de statut réussi",
    user: req.user
      ? {
          id: req.user.userId,
          role: req.user.role,
          permissions: req.user.permissions,
        }
      : null,
  })
})

export default router
