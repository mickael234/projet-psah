import TicketSupportModel from "../models/ticketSupport.model.js";
import EmailSupportModel from "../models/emailSupport.model.js";
import { InternalServerError, NotFoundError, ValidationError } from "../errors/apiError.js";
import { transporter } from "./paiement.service.js";

class EmailSupportService {

    /**
     * Envoie un e-mail de support et crée automatiquement un ticket associé.
     * 
     * @param {Object} emailData - Données envoyées depuis le formulaire client
     * @param {string} emailData.email_client - Adresse e-mail du client
     * @param {string} emailData.email_destinataire - Adresse e-mail du réceptionniste
     * @param {string} emailData.sujet - Sujet du message
     * @param {string} emailData.message - Contenu du message
     * @param {string} emailData.type - Type de ticket ('technique', 'service' ou 'autre')
     * @param {number} emailData.clientId - ID du client
     * 
     * @returns {Promise<{ ticket: Object, email: Object }>} Ticket et email créés
     */

    static async sendAndCreateTicket(emailData) {

        const ALLOWED_TYPES = ['technique', 'service', 'autre'];
        if (!ALLOWED_TYPES.includes(emailData.type)) {
            throw new ValidationError( "Type de ticket invalide. Un ticket doit être de type 'technique', 'service' ou 'autre'.");  
        }

        try {
            // Créer un ticket
            const ticket = await TicketSupportModel.create({
                id_client: Number(emailData.clientId),
                id_personnel: null, // non assigné pour le moment
                sujet: emailData.sujet,
                description: emailData.message,
                type: emailData.type, 
                statut: 'en_attente',
                date_creation: new Date()
            });

            // Créer l'e-mail rattaché au ticket
            const email = await EmailSupportModel.sendEmail({
                id_ticket: ticket.id_ticket,
                email_client: emailData.email_client,
                email_destinataire: emailData.email_destinataire,
                sujet: emailData.sujet,
                message: emailData.message,
                date_envoi: new Date()
            });

            // Envoyer l'e-mail via SMTP
            await transporter.sendMail({
                from: `"Support Client" <${emailData.email_client}>`,
                to: emailData.email_destinataire,
                subject: `Nouveau ticket : [${emailData.type.toUpperCase()}] ${emailData.sujet}`,
                text: `Bonjour,

Un nouveau ticket de support a été créé.

Détails du ticket :
- Type : ${emailData.type}
- Client : ${emailData.email_client}
- Sujet : ${emailData.sujet}

Message du client :
"${emailData.message}"

Merci de prendre en charge cette demande dans les meilleurs délais.

Cordialement,
Le système de tickets automatisé`
            });

            return { ticket, email };
            
        } catch (error) {
            console.error(error)
            throw new InternalServerError("Une erreur est survenue lors de la création d'un ticket.")
        }
        
    }

    /**
     * Récupère les e-mails associés à un ticket donné.
     * 
     * @param {number} ticketId - ID du ticket concerné
     * @returns {Promise<Array<Object>>} Liste des e-mails liés au ticket
     */

    static async getEmailsByTicket(ticketId){

        if(!ticketId || isNaN(Number(ticketId)) || ticketId === 0){
            throw new ValidationError("L'id du ticket n'est pas valide.")
        }

        const ticket = await TicketSupportModel.findById(ticketId);

        if(!ticket){
            throw new NotFoundError("Le ticket n'a pas été trouvé.")
        }

        const emails = await EmailSupportModel.findByTicket(ticketId);
        if(!emails || emails.length <= 0){
            throw new NotFoundError("Aucun mail n'a été trouvé concernant ce ticket.")
        }

        return emails;
    }
}

export default EmailSupportService;
