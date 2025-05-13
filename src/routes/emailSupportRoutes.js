import express from 'express';
import EmailSupportController from '../controllers/emailSupportController.js';
import { authenticateJWT, checkRole, isClient } from '../middleware/auth.js';

const router = express.Router();
/**
 * POST /emails/send
 * Envoie un email et crée un ticket de support
 * Accès: Clients authentifiés uniquement
 */
router.post('/send', authenticateJWT, isClient, EmailSupportController.sendAndCreateTicket);

/**
 * GET /emails/:ticketId
 * Récupère les emails associés à un ticket
 * Accès: Personnel autorisé (réceptionnistes, admins)
 */
router.get('/:ticketId', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), EmailSupportController.getEmailsByTicket);

export default router;
