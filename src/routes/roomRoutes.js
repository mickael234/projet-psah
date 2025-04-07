import express from "express"
import RoomController from "../controllers/roomController.js"

const roomRouter = express.Router();

roomRouter.get("/:id", RoomController.getRoomDetails);

export default roomRouter;