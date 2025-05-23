import express from "express"
import AvisController from "../controllers/avisController.js"
import { authenticateJWT, checkClientAccess, checkRole, isClient, verifyClientAccessToReservation } from "../middleware/auth.js";

const avisRouter = express.Router();

/**
 * Routes publiques
 */

// Route pour récupérer tous les avis
avisRouter.get("/", AvisController.getAllAvis);

// Route pour récupérer les avis d'une chambre spécifique par son ID
avisRouter.get("/chambre/:idChambre", AvisController.getAvisByChambre);

// Route pour récupérer la note moyenne des avis
avisRouter.get("/moyenne", AvisController.getNoteMoyenneAvis);

// Route pour récupérer les avis filtrés par note spécifique
avisRouter.get("/note/:note", AvisController.getByNote)

/**
 * Routes protégées 
 */

// Route pour récupérer un avis laissé sur une réservation en tant que client
avisRouter.get("/reservation/:idReservation", authenticateJWT, verifyClientAccessToReservation, AvisController.getByReservation);

// Route pour créer un avisen tant que client
avisRouter.post("/", authenticateJWT, isClient, AvisController.createAvis);

// Route pour répondre à un avis en tant qu'administrateurs ou réceptionniste
avisRouter.put("/:idAvis", authenticateJWT, checkRole(["ADMIN_GENERAL","RECEPTIONNISTE","RESPONSABLE_HEBERGEMENT"]), AvisController.answerToAvis);

// Route pour supprimer un avis (réservée aux administrateurs et au réceptionniste)
avisRouter.delete("/:idAvis", authenticateJWT, checkRole(["ADMIN_GENERAL","RECEPTIONNISTE","RESPONSABLE_HEBERGEMENT"]), AvisController.deleteAvis)


export default avisRouter;