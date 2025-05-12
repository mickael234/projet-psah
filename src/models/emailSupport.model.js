import prisma from "../config/prisma.js";

class EmailSupportModel {
    /**
     * Envoie un e-mail (création en base)
     * @param {Object} data - Contenu de l'e-mail
     * @returns {Promise<Object>} - EmailSupport créé
     */
    static async sendEmail(data) {
        return prisma.emailSupport.create({
            data : {
                id_ticket: data.id_ticket,
                email_client: data.email_client,
                email_destinataire: data.email_destinataire,
                sujet: data.sujet,
                message: data.message,
                date_envoi: new Date()
            }
        });
    }

    /**
     * Récupère tous les e-mails associés à un ticket
     * @param {Number} ticketId - ID du ticket
     * @returns {Promise<Array>} - Liste des e-mails liés
     */
    static async findByTicket(ticketId) {
        return prisma.emailSupport.findMany({
            where: {
                id_ticket: ticketId
            },
            orderBy: {
                date_envoi: 'asc'
            }
        });
    }
}

export default EmailSupportModel;
