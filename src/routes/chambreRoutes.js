import express from "express"
import ChambreController from "../controllers/chambreController.js"

const chambreRouter = express.Router();

chambreRouter.get("/:id", ChambreController.getRoomDetails);

export default chambreRouter;