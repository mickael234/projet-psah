import express from 'express'
import DepenseController from '../controllers/depenseController.js';
import { authenticateJWT, checkRole, isPersonnel } from '../middleware/auth.js';

const router = express.Router();

/**
 * Routes accessibles au comptable, à l'admin et au super admin
 */

router.get("/", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getAll);
router.get("/rapport",authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getFinancialDataByPeriod);
router.get("/rapport/export", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.generateFinancialReport)
router.get("/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.getById)
router.post("/", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.create)

router.patch("/description/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updateDescription);
router.patch("/prix/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updatePrice);
router.patch("/categorie/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.updateCategory);
router.patch("/restaurer/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.restoreExpense);
router.patch("/supprimer/:id", authenticateJWT, checkRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]), DepenseController.deleteExpense);

export default router;


