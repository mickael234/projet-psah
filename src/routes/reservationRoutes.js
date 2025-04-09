import express from "express"
import ReservationController from "../controllers/reservationController.js"

const reservationRouter = express.Router();

reservationRouter.get("/actuelles/:clientId", ReservationController.getAllUserPresentReservations);
reservationRouter.get("/passees/:clientId", ReservationController.getAllUserPastReservations)

export default reservationRouter;