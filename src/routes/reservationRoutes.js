import express from "express"
import ReservationController from "../controllers/reservationController.js"

const reservationRouter = express.Router();

reservationRouter.get("/:clientId", ReservationController.getAllUserBookings);
reservationRouter.get("/past/:clientId", ReservationController.getAllUserPastReservations)

export default reservationRouter;