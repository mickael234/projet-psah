import express from "express"
import {
  creerCommunication,
  listerCommunications,
  getCommunicationById,
  repondreCommunication,
  getMessagesNonLus,
  marquerCommeLu,
  getMessagesByDepartement,
} from "../controllers/communicationController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()


router.post("/", authenticateJWT, creerCommunication)
router.get("/", authenticateJWT, listerCommunications)


router.get("/non-lus", authenticateJWT, getMessagesNonLus)


router.get("/departement/:departement", authenticateJWT, getMessagesByDepartement)


router.get("/:id", authenticateJWT, getCommunicationById)


router.post("/:id/repondre", authenticateJWT, repondreCommunication)


router.put("/:id/lu", authenticateJWT, marquerCommeLu)

export default router
