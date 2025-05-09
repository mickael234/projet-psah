import express from "express"
import jwt from "jsonwebtoken"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

/**
 * Route de test pour vérifier l'authentification
 */
router.get("/auth-test", authenticateJWT, (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Authentification réussie",
    user: {
      userId: req.user.userId,
      role: req.user.role,
      permissions: req.user.permissions,
    },
  })
})

/**
 * Route pour vérifier un token JWT
 */
router.post("/verify-token", (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        status: "ERROR",
        message: "Token requis",
      })
    }

    // Vérifier le token avec l'algorithme HS256 explicitement spécifié
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] })

    res.status(200).json({
      status: "OK",
      message: "Token valide",
      data: {
        decoded,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error)
    res.status(400).json({
      status: "ERROR",
      message: "Token invalide",
      error: error.message,
    })
  }
})

/**
 * Route pour tester les en-têtes d'autorisation
 */
router.get("/headers", (req, res) => {
  const headers = req.headers
  const authHeader = headers.authorization || "Non défini"

  res.status(200).json({
    status: "OK",
    message: "En-têtes reçus",
    data: {
      allHeaders: headers,
      authHeader: authHeader,
    },
  })
})

export default router
