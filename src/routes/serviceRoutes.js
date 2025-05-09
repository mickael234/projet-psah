// src/routes/serviceRoutes.js
import express from 'express';
import {
  creerService,
  listerServices,
  modifierService,
  supprimerService
} from '../controllers/serviceController.js';

const router = express.Router();



router.post('/', creerService);
router.get('/', listerServices);
router.put('/:id', modifierService);
router.delete('/:id', supprimerService);

export default router;
