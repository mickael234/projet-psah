import EmailSupportService from "../services/emailSupport.service.js";
import { getClientIdFromUser } from "../utils/auth.helpers.js";

class EmailSupportController {
    /**
     * @route POST /emails/send
     * Envoie un e-mail client et crée un ticket
     *
     * @param {import('express').Request} req - Requête contenant les données du formulaire client
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Middleware de gestion d’erreur
     * @returns {Promise<void>}
     */
    static async sendAndCreateTicket(req, res, next) {
        try {
            const {
                email_client,
                email_destinataire,
                sujet,
                message,
                type
            } = req.body;

            const clientId = await getClientIdFromUser(req.user.email);

            const { ticket, email } = await EmailSupportService.sendAndCreateTicket({
                email_client,
                email_destinataire,
                sujet,
                message,
                type,
                clientId
            });

            res.status(201).json({
                status: 'OK',
                message: 'Ticket et e-mail envoyés avec succès.',
                data: { ticket, email }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /emails/:ticketId
     * Récupère les e-mails associés à un ticket
     *
     * @param {import('express').Request} req - Requête contenant l’ID du ticket
     * @param {import('express').Response} res - Réponse Express
     * @param {Function} next - Middleware de gestion d’erreur
     * @returns {Promise<void>}
     */
    static async getEmailsByTicket(req, res, next) {
        try {
            const ticketId = Number(req.params.ticketId);
            const emails = await EmailSupportService.getEmailsByTicket(ticketId);

            res.status(200).json({
                status: 'OK',
                message: 'Emails récupérés avec succès.',
                data: emails
            });
        } catch (error) {
            next(error);
        }
    }
}

export default EmailSupportController;