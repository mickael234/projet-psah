import express from "express"
import AuthController from "../controllers/authController.js"
import AuthOAuthController from "../controllers/authOAuthController.js"
import PasswordResetController from "../controllers/passwordResetController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

// Routes d'authentification standard
router.post("/register", AuthController.register)
router.post("/login", AuthController.login)

// Routes OAuth
router.get("/oauth/:provider", AuthOAuthController.initiateOAuth)
router.get("/oauth/callback/:provider", AuthOAuthController.oauthCallback)
router.post("/link-account", authenticateJWT, AuthOAuthController.linkAccount)
router.post("/unlink-account", authenticateJWT, AuthOAuthController.unlinkAccount)

// Routes de réinitialisation de mot de passe
router.post("/forgot-password", PasswordResetController.forgotPassword)
router.get("/reset-password/validate/:token", PasswordResetController.validateResetToken)
router.post("/reset-password/:token", PasswordResetController.resetPassword)

export default router
