import express from "express"
import {
  creerMaintenance,
  listerMaintenancesParChambre,
  obtenirNotificationsMaintenance,
  marquerNotificationsCommeLues,
  mettreAJourStatutMaintenance,
  trouverPersonnelParUtilisateur,
  verifierRoleMaintenance,
} from "../controllers/maintenanceController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

/**
 * Middleware d'authentification et de vérification des rôles
 */
router.use(authenticateJWT)
router.use(verifierRoleMaintenance)

/**
 * Route pour trouver l'ID du personnel par l'ID utilisateur
 */
router.get("/find-personnel/:userId", trouverPersonnelParUtilisateur)

/**
 * Routes pour la gestion des maintenances
 */
router.post("/hebergements/:id/maintenance", creerMaintenance)
router.get("/hebergements/:id/maintenance", listerMaintenancesParChambre)
router.get("/notifications", obtenirNotificationsMaintenance)
router.put("/notifications/marquer-comme-lues", marquerNotificationsCommeLues)
router.put("/:idMaintenance/statut", mettreAJourStatutMaintenance)

export default router

