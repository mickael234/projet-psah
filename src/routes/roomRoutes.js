import express from "express"
import RoomController from "../controllers/roomController"

const router = express.Router();

router.get("/room/:id", RoomController.getRoomDetails);

export default roomRouter;