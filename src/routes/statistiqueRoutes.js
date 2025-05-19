import express from 'express';
import StatistiqueProprieteController from '../controllers/statistiqueProprieteController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get('/statistiques', authenticateJWT, StatistiqueProprieteController.getStatsByUser);

export default router;
