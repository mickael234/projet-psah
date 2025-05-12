import express from 'express';
import TicketSupportController from '../controllers/ticketSupportController.js';
import {authenticateJWT, checkRole, isClient} from "../middleware/auth.js"

const router = express.Router();

/**
 * GET /tickets/my
 * Récupérer les tickets du client connecté
 */
router.get('/my', authenticateJWT, isClient, TicketSupportController.getMyTickets);


/**
 * GET /tickets/:id
 * Récupérer un ticket par son ID
 */
router.get('/:id', authenticateJWT, TicketSupportController.getById);


/**
 * GET /tickets/
 * Lister tous les tickets (avec filtres ?type=...&statut=...)
 */
router.get('/', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), TicketSupportController.getAll);

/**
 * PATCH /tickets/:id/assign
 * S’assigner un ticket (réceptionniste)
 */
router.patch('/:id/assign/', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), TicketSupportController.assign);

/**
 * PATCH /tickets/:id/status
 * Modifier le statut d’un ticket
 */
router.patch('/:id/status', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), TicketSupportController.updateStatus);

/**
 * PATCH /tickets/:id/reassign
 * Réassigner un ticket à un autre réceptionniste
 */
router.patch('/:id/reassign', authenticateJWT, checkRole("RECEPTIONNISTE", "ADMIN_GENERAL", "SUPER_ADMIN"), TicketSupportController.reassign);

export default router;
