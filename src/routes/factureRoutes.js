import express from "express"
import FactureController from "../controllers/factureController.js"
import { authenticateJWT } from "../middleware/auth.js"
import { checkRole } from "../middleware/role-auth.js"

const router = express.Router()

// Définir les rôles autorisés pour les opérations de facturation
const ROLES_GESTION_FACTURES = ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]
const ROLES_CONSULTATION_FACTURES = ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]

// Routes protégées (nécessitent une authentification et des rôles spécifiques)
router.get("/", authenticateJWT, checkRole(ROLES_CONSULTATION_FACTURES), FactureController.getAllFactures)

router.get("/:id", authenticateJWT, checkRole(ROLES_CONSULTATION_FACTURES), FactureController.getFactureById)

router.get(
  "/reservation/:id",
  authenticateJWT,
  checkRole(ROLES_CONSULTATION_FACTURES),
  FactureController.getFactureByReservation,
)

router.post("/", authenticateJWT, checkRole(ROLES_GESTION_FACTURES), FactureController.createFacture)

router.put("/:id", authenticateJWT, checkRole(ROLES_GESTION_FACTURES), FactureController.updateFacture)

router.post("/:id/envoyer", authenticateJWT, checkRole(ROLES_GESTION_FACTURES), FactureController.envoyerFacture)

// Nouvelles routes pour gérer les factures
router.post("/:id/payer", authenticateJWT, checkRole(ROLES_GESTION_FACTURES), FactureController.marquerCommePaye)

router.post("/:id/annuler", authenticateJWT, checkRole(ROLES_GESTION_FACTURES), FactureController.annulerFacture)

// Route pour générer une facture à partir d'une réservation
router.post(
  "/generer-facture/:id",
  authenticateJWT,
  checkRole(ROLES_GESTION_FACTURES),
  FactureController.genererFacture,
)

// Route pour générer un PDF de la facture
router.get("/:id/pdf", authenticateJWT, checkRole(ROLES_CONSULTATION_FACTURES), FactureController.genererFacturePDF)

export default router
