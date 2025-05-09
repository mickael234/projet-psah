import express from "express"
import {
  creerTachePlanifiee,
  listerTachesPlanifiees,
  getTachePlanifieeById,
  updateTachePlanifiee,
  updateStatutTache,
  ajouterCommentaire,
  getTachesByResponsable,
  getTachesByChambre,
} from "../controllers/planningController.js"
import { authenticateJWT } from "../middleware/auth.js"
import { verifierRoleMaintenance } from "../middleware/role-auth.js"

const router = express.Router()

/**
 * Routes pour la création et la récupération des tâches planifiées
 */
router.post("/", authenticateJWT, verifierRoleMaintenance, creerTachePlanifiee)
router.get("/", authenticateJWT, listerTachesPlanifiees)

/**
 * Route pour récupérer les tâches d'un responsable
 */
router.get("/responsable/:id_responsable", authenticateJWT, getTachesByResponsable)

/**
 * Route pour récupérer les tâches d'une chambre
 */
router.get("/chambre/:id_chambre", authenticateJWT, getTachesByChambre)

/**
 * Routes pour la gestion d'une tâche spécifique
 */
router.get("/:id", authenticateJWT, getTachePlanifieeById)
router.put("/:id", authenticateJWT, updateTachePlanifiee)

/**
 * Route pour mettre à jour le statut d'une tâche
 */
router.put("/:id/statut", authenticateJWT, updateStatutTache)

/**
 * Route pour ajouter un commentaire à une tâche
 */
router.post("/:id/commentaire", authenticateJWT, ajouterCommentaire)

export default router

