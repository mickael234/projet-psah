// src/routes/reservationRoutes.js
import express from 'express';
import { enregistrerArrivee, enregistrerDepart } from '../controllers/reservationController.js';

const router = express.Router();

router.put('/reservations/:id/checkin', enregistrerArrivee);
router.put('/reservations/:id/checkout', enregistrerDepart);

export default router;
