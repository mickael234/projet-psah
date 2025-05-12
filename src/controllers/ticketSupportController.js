import TicketSupportService from '../services/ticketSupport.service.js';
import { getClientIdFromUser, checkTicketBelongsToClient } from '../utils/auth.helpers.js';
import { getPersonnelIdFromUser } from '../utils/auth.helpers.js';

class TicketSupportController {

    /**
     * Récupérer un ticket par son ID
     * 
     * @route GET /tickets/:id
     * @param {import('express').Request} req - Requête Express contenant l'ID du ticket
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async getById(req, res, next) {
        try {

            const ticketId = Number(req.params.id);

            let ticket;

            if (req.user.role === 'CLIENT') {
                // Vérifier que le ticket appartient bien au client
                ticket = await checkTicketBelongsToClient(ticketId, req.user.email);
            } else {
                // Si réceptionniste ou admin, accès libre
                ticket = await TicketSupportService.getTicketById(ticketId);
            }

            res.status(200).json({
                status: "OK",
                message: "Ticket récupéré avec succès.",
                data: ticket,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Lister les tickets du client connecté
     * 
     * @route GET /tickets/my
     * @param {import('express').Request} req - Requête contenant l'ID du client connecté (JWT)
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async getMyTickets(req, res, next) {

        try {

            const clientId = await getClientIdFromUser(req.user.email);
            const tickets = await TicketSupportService.getTicketsByClient(clientId);
        
            res.status(200).json({
                status: "OK",
                message: "Tickets récupérés avec succès.",
                data: tickets,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Lister tous les tickets, avec filtres optionnels
     * 
     * @route GET /tickets?type=...&statut=...
     * @param {import('express').Request} req - Requête contenant les filtres (type, statut)
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async getAll(req, res, next) {
        try {
            const filters = {
                ...(req.query.type && { type: req.query.type }),
                ...(req.query.statut && { statut: req.query.statut })
            };
            const tickets = await TicketSupportService.getAllTickets(filters);

            res.status(200).json({
                status: "OK",
                message: "Tickets récupérés avec succès",
                data: tickets,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Le réceptionniste connecté s'assigne un ticket
     * 
     * @route PATCH /tickets/:id/assign
     * @param {import('express').Request} req - Requête contenant l'ID du ticket et du personnel
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async assign(req, res, next) {
        try {

            const ticketId = Number(req.params.id);
            const personnelId = await getPersonnelIdFromUser(req.user.email);
            const ticket = await TicketSupportService.assignTicket(ticketId, personnelId);

            res.status(200).json({
                status: "OK",
                message: "Ticket assigné avec succès.",
                data: ticket,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Modifier le statut du ticket
     * 
     * @route PATCH /tickets/:id/status
     * @param {import('express').Request} req - Requête contenant le nouveau statut
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async updateStatus(req, res, next) {

        try {

            const ticketId = Number(req.params.id);
            const { statut } = req.body;
            const ticket = await TicketSupportService.updateTicketStatus(ticketId, statut);

            res.status(200).json({
                status: "OK",
                message: `Ticket mis à jour avec le statut : ${statut}`,
                data: ticket,
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Réassigner un ticket à un autre réceptionniste
     * 
     * @route PATCH /tickets/:id/reassign
     * @param {import('express').Request} req - Requête contenant le nouvel ID du réceptionniste
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Fonction de gestion d’erreur Express
     * @returns {Promise<void>}
     */
    static async reassign(req, res, next) {

        try {

            const ticketId = Number(req.params.id);
            const { personnelId } = req.body;
            const ticket = await TicketSupportService.reassignTicket(ticketId, personnelId);

            res.status(200).json({
                status: "OK",
                message: "Ticket réassigné avec succès.",
                data: ticket,
            });

        } catch (error) {
            next(error);
        }
    }
}

export default TicketSupportController;
