import express from "express";
import ReponseAvisController from "../controllers/reponseAvisController.js";
import { authenticateJWT, checkRole } from "../middleware/auth.js";

const reponseAvisRouter = express.Router();

// Récupérer toutes les réponses
reponseAvisRouter.get(
  "/",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]),
  ReponseAvisController.getAllReponses
);

// Récupérer les réponses d'un avis
reponseAvisRouter.get(
  "/avis/:idAvis",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]),
  ReponseAvisController.getReponsesByAvis
);

// Récupérer une réponse par son id
reponseAvisRouter.get(
  "/:idReponse",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]),
  ReponseAvisController.getReponseById
);

// Créer une réponse
reponseAvisRouter.post(
  "/:idAvis",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]),
  ReponseAvisController.createReponse
);

// Modifier une réponse
reponseAvisRouter.put(
  "/:idReponse",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL"]),
  ReponseAvisController.updateReponse
);

// Supprimer une réponse
reponseAvisRouter.delete(
  "/:idReponse",
  authenticateJWT,
  checkRole(["ADMIN_GENERAL"]),
  ReponseAvisController.deleteReponse
);

export default reponseAvisRouter;
