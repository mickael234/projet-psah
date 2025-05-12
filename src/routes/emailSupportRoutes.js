import express from 'express';
import EmailSupportController from '../controllers/emailSupportController.js';
import { authenticateJWT, checkRole, isClient } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', authenticateJWT, isClient, EmailSupportController.sendAndCreateTicket);
router.get('/:ticketId', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), EmailSupportController.getEmailsByTicket);

export default router;
