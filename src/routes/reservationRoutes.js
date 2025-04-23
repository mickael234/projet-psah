import express from "express"
import ReservationController from "../controllers/reservationController.js"
import { authenticateJWT } from "../middleware/auth.js"

const router = express.Router()

// Routes publiques
router.get("/", ReservationController.getAllReservations)
router.get("/:id", ReservationController.getReservationById)

// Routes protégées (nécessitent une authentification)
router.post("/", authenticateJWT, ReservationController.createReservation)
router.put("/:id", authenticateJWT, ReservationController.updateReservation)
router.delete("/:id", authenticateJWT, ReservationController.deleteReservation)
router.post("/:id/cancel", authenticateJWT, ReservationController.cancelReservation)

// Nouvelles routes pour la gestion des arrivées/départs
router.put("/:id/checkin", authenticateJWT, ReservationController.checkIn)
router.put("/:id/checkout", authenticateJWT, ReservationController.checkOut)


export default router
