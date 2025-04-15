import express from "express"
import AvisController from "../controllers/avisController.js"
import { authenticateJWT, checkClientAccess, checkRole, isClient, verifyClientAccessToReservation } from "../middleware/auth.js";

const avisRouter = express.Router();

/**
 * Routes publiques
 */

avisRouter.get("/", AvisController.getAllAvis);
avisRouter.get("/chambre/:idChambre", AvisController.getAvisByChambre)
avisRouter.get("/moyenne", AvisController.getNoteMoyenneAvis)
avisRouter.get("/note/:note", AvisController.getByNote)

/**
 * Routes protégées 
 */
avisRouter.get("/reservation/:idReservation", authenticateJWT, verifyClientAccessToReservation, AvisController.getByReservation)
avisRouter.post("/", authenticateJWT, isClient, AvisController.createAvis)
avisRouter.put("/:idAvis", authenticateJWT, checkRole(["ADMIN_GENERAL","RECEPTIONNISTE","RESPONSABLE_HEBERGEMENT"]), AvisController.answerToAvis)
avisRouter.delete("/:idAvis", authenticateJWT,checkRole(["ADMIN_GENERAL","RECEPTIONNISTE","RESPONSABLE_HEBERGEMENT"]), AvisController.deleteAvis)

export default avisRouter;