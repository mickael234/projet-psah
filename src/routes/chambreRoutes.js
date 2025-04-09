import express from 'express';
import ChambreController from '../controllers/chambreController.js';

const chambreRouter = express.Router();

/**
 * @route GET /:id
 * @group Chambres - Opérations liées aux chambres
 * @param {number} id.path.required - ID de la chambre à récupérer
 * @returns {object} 200 - Détails de la chambre
 * @returns {object} 400 - Requête invalide si l'ID n'est pas un nombre
 * @returns {object} 404 - Chambre non trouvée
 * @returns {object} 500 - Erreur serveur
 * @description Récupère les détails d’une chambre en fonction de son ID.
 */

chambreRouter.get('/:id', ChambreController.getRoomDetails);

export default chambreRouter;
