import express from 'express';
import ChambreController from '../controllers/chambreController.js';

const chambreRouter = express.Router();

/**
 * Récupère les détails d’une chambre en fonction de son ID.
 */

chambreRouter.get('/:id', ChambreController.getRoomDetails);

export default chambreRouter;
