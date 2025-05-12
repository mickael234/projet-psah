import TicketSupportModel from "../models/ticketSupport.model.js";
import { ValidationError, NotFoundError} from "../errors/apiError.js"
import PersonnelModel from "../models/personnel.model.js";
import ClientModel from "../models/client.model.js";

class TicketSupportService {
    /**
     * Récupère un ticket par son ID
     * @param {number} ticketId
     * @returns {Promise<Object>}
     */
    static async getTicketById(ticketId) {
        if (!ticketId || isNaN(Number(ticketId))) {
            throw new ValidationError("L'ID du ticket est invalide.");
        }

        const ticket = await TicketSupportModel.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError("Le ticket n'a pas été trouvé.");
        }

        return ticket;
    }

    /**
     * Récupère les tickets du client connecté
     * @param {number} clientId
     * @returns {Promise<Array>}
     */
    static async getTicketsByClient(clientId) {
        if (!clientId || isNaN(Number(clientId))) {
            throw new ValidationError("ID client invalide.");
        }

        const client = ClientModel.getWithRelations(clientId);
        if(!client){
            throw new NotFoundError("Ce client n'existe pas.")
        }

        const tickets = await TicketSupportModel.findByClient(clientId);
        if(!tickets || tickets.length <= 0){
            throw new NotFoundError("Aucun ticket trouvé.")
        }

        return tickets;
    }

    /**
     * Liste tous les tickets avec filtres facultatifs
     * @param {Object} filters
     * @returns {Promise<Array>}
     */
    static async getAllTickets(filters = {}) {
        const tickets = await TicketSupportModel.findAll(filters);
        if(!tickets || tickets.length <= 0){
            throw new NotFoundError("Aucun ticket trouvé.")
        }

        return tickets;
    }

    /**
     * S’assigne un ticket (par le réceptionniste connecté)
     * @param {number} ticketId
     * @param {number} personnelId
     * @returns {Promise<Object>}
     */
    static async assignTicket(ticketId, personnelId) {
        if (!ticketId || !personnelId || isNaN(ticketId) || isNaN(personnelId)) {
            throw new ValidationError("ID du ticket ou du personnel invalide.");
        }

        const ticket = await TicketSupportModel.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError("Le ticket à assigner n'existe pas.");
        }

        const personnel = PersonnelModel.getWithRelations(personnelId);
        if(!personnel){
            throw new NotFoundError("Ce membre du personnel n'existe pas.");
        }

        return TicketSupportModel.assignToSelf(ticketId, personnelId);
    }

    /**
     * Met à jour le statut d’un ticket
     * @param {number} ticketId
     * @param {string} statut
     * @returns {Promise<Object>}
     */
    static async updateTicketStatus(ticketId, statut) {
        const ALLOWED_STATUSES = ['en_attente', 'en_cours', 'resolu', 'ferme'];
        if (!ALLOWED_STATUSES.includes(statut)) {
            throw new ValidationError("Statut de ticket invalide.");
        }

        const ticket = await TicketSupportModel.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError("Ce ticket n'existe pas.");
        }

        return TicketSupportModel.updateStatut(ticketId, statut);
    }

    /**
     * Réassigne un ticket à un autre personnel
     * @param {number} ticketId
     * @param {number} newPersonnelId
     * @returns {Promise<Object>}
     */
    static async reassignTicket(ticketId, newPersonnelId) {
        if (!ticketId || !newPersonnelId || isNaN(ticketId) || isNaN(newPersonnelId)) {
            throw new ValidationError("ID du ticket ou du personnel invalide.");
        }

        const ticket = await TicketSupportModel.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError("Le ticket à réassigner n'existe pas.");
        }

        const personnel = await PersonnelModel.getWithRelations(newPersonnelId);
        if(!personnel){
            throw new NotFoundError("Ce membre du personnel n'existe pas.");
        }

        return TicketSupportModel.reassignTo(ticketId, newPersonnelId);
    }
}

export default TicketSupportService;
