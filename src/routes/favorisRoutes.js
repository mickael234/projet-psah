import express from 'express';
import {
  ajouterFavori,
  supprimerFavori,
  listerFavorisUtilisateur
} from '../controllers/favorisController.js';

const router = express.Router();


router.post('/', ajouterFavori);


router.delete('/', supprimerFavori);


router.get('/:id_utilisateur', listerFavorisUtilisateur);
export default router;
