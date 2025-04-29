import express from 'express';
import DepenseController from '../controllers/depenseController.js';
import { authenticateJWT, checkRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * Routes accessibles au comptable, à l'admin et au super admin
 * Toutes ces routes nécessitent une authentification JWT et un rôle approprié
 */

// Récupérer toutes les dépenses avec options de filtrage et pagination
router.get("/", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getAll);

// Récupérer les données financières pour une période spécifique (dateDebut et dateFin)
router.get("/rapport", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getFinancialDataByPeriod);

// Générer et télécharger un rapport financier PDF pour une période spécifique
router.get("/rapport/export", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.generateFinancialReport);

// Récupérer une dépense spécifique par son ID
router.get("/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getById);

// Créer une nouvelle dépense
router.post("/", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.create);

// Mettre à jour uniquement la description d'une dépense
router.patch("/description/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updateDescription);

// Mettre à jour uniquement le montant d'une dépense
router.patch("/prix/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updatePrice);

// Mettre à jour uniquement la catégorie d'une dépense
router.patch("/categorie/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updateCategory);

// Restaurer une dépense précédemment supprimée (soft delete)
router.patch("/restaurer/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.restoreExpense);

// Supprimer une dépense de façon logique (soft delete)
router.patch("/supprimer/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.deleteExpense);

export default router;