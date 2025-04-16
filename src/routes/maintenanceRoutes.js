import express from 'express';
import {
  creerMaintenance,
  listerMaintenancesParChambre
} from '../controllers/maintenanceController.js';

const router = express.Router();

router.post('/hebergements/:id/maintenance', creerMaintenance);
router.get('/hebergements/:id/maintenance', listerMaintenancesParChambre);

export default router;
