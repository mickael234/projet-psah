import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import EmailSupportService from '../../src/services/emailSupport.service.js'; 
import EmailSupportModel from '../../src/models/emailSupport.model.js'; 
import TicketSupportModel from '../../src/models/ticketSupport.model.js';
import { ValidationError, NotFoundError, InternalServerError } from '../../src/errors/apiError.js'; 

const mockSendMail = jest.fn();

// Mocker le module transporter avec la bonne structure
jest.mock('../../src/services/paiement.service.js', () => ({
    __esModule: true,
    transporter: { 
        sendMail: mockSendMail
    }
}));


describe('EmailSupportService', () => {

    // Nettoyer les spies après chaque test
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests pour la méthode sendAndCreateTicket
     */
    describe('sendAndCreateTicket', () => {

        it('doit créer un ticket et envoyer un email avec succès', async () => {
            // Arrange
            const emailData = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Description du problème',
                type: 'technique',
                clientId: 123
            };

            const mockTicket = {
                id_ticket: 456,
                id_client: emailData.clientId,
                id_personnel: null,
                sujet: emailData.sujet,
                description: emailData.message,
                type: emailData.type,
                statut: 'en_attente',
                date_creation: new Date()
            };

            const mockEmail = {
                id_email: 789,
                id_ticket: mockTicket.id_ticket,
                email_client: emailData.email_client,
                email_destinataire: emailData.email_destinataire,
                sujet: emailData.sujet,
                message: emailData.message,
                date_envoi: new Date()
            };

            jest.spyOn(TicketSupportModel, 'create').mockResolvedValue(mockTicket);
            jest.spyOn(EmailSupportModel, 'sendEmail').mockResolvedValue(mockEmail);
            mockSendMail.mockResolvedValue({
                messageId: 'mock-message-id',
                response: '250 Message sent'
            });

            // Act
            const result = await EmailSupportService.sendAndCreateTicket(emailData);

            // Assert
            expect(TicketSupportModel.create).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.create).toHaveBeenCalledWith({
                id_client: emailData.clientId,
                id_personnel: null,
                sujet: emailData.sujet,
                description: emailData.message,
                type: emailData.type,
                statut: 'en_attente',
                date_creation: expect.any(Date)
            });

            expect(EmailSupportModel.sendEmail).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.sendEmail).toHaveBeenCalledWith({
                id_ticket: mockTicket.id_ticket,
                email_client: emailData.email_client,
                email_destinataire: emailData.email_destinataire,
                sujet: emailData.sujet,
                message: emailData.message,
                date_envoi: expect.any(Date)
            });

            expect(result).toEqual({ ticket: mockTicket, email: mockEmail });
            
        });

        it('doit lancer ValidationError si le type de ticket est invalide', async () => {
            // Arrange
            const emailData = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Demande d\'assistance',
                message: 'Description de la demande',
                type: 'type_invalide', // Type invalide
                clientId: 123
            };

            jest.spyOn(TicketSupportModel, 'create');
            jest.spyOn(EmailSupportModel, 'sendEmail');

            // Act & Assert
            await expect(EmailSupportService.sendAndCreateTicket(emailData)).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.create).not.toHaveBeenCalled();
            expect(EmailSupportModel.sendEmail).not.toHaveBeenCalled();
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('doit lancer InternalServerError si la création du ticket échoue', async () => {
            // Arrange
            const emailData = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Description du problème',
                type: 'technique',
                clientId: 123
            };

            jest.spyOn(TicketSupportModel, 'create').mockRejectedValue(new Error('Erreur base de données'));
            jest.spyOn(EmailSupportModel, 'sendEmail');

            // Act & Assert
            await expect(EmailSupportService.sendAndCreateTicket(emailData)).rejects.toThrow(InternalServerError);
            expect(TicketSupportModel.create).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.sendEmail).not.toHaveBeenCalled();
            expect(mockSendMail).not.toHaveBeenCalled();
        });

        it('doit lancer InternalServerError si l\'envoi de l\'email échoue', async () => {
            // Arrange
            const emailData = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Description du problème',
                type: 'technique',
                clientId: 123
            };

            const mockTicket = {
                id_ticket: 456,
                id_client: emailData.clientId,
                id_personnel: null,
                sujet: emailData.sujet,
                description: emailData.message,
                type: emailData.type,
                statut: 'en_attente',
                date_creation: new Date()
            };

            jest.spyOn(TicketSupportModel, 'create').mockResolvedValue(mockTicket);
            jest.spyOn(EmailSupportModel, 'sendEmail').mockRejectedValue(new Error('Erreur lors de l\'envoi'));

            // Act & Assert
            await expect(EmailSupportService.sendAndCreateTicket(emailData)).rejects.toThrow(InternalServerError);

            expect(TicketSupportModel.create).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.sendEmail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).not.toHaveBeenCalled();
        });
    })


    /**
     * Tests pour la méthode getEmailsByTicket
     */
    describe('getEmailsByTicket', () => {
        it('doit récupérer les emails associés à un ticket', async () => {
            // Arrange
            const ticketId = 456;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Problème technique',
                statut: 'en_cours'
            };
            const mockEmails = [
                {
                id_email: 1,
                id_ticket: ticketId,    
                email_client: 'client@example.com',
                sujet: 'Premier message',
                message: 'Contenu du premier message'
                },
                {
                id_email: 2,
                id_ticket: ticketId,
                email_client: 'client@example.com',
                sujet: 'Deuxième message',
                message: 'Contenu du deuxième message'
                }
            ];

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(mockTicket);
            jest.spyOn(EmailSupportModel, 'findByTicket').mockResolvedValue(mockEmails);

            // Act
            const result = await EmailSupportService.getEmailsByTicket(ticketId);

            // Assert
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findById).toHaveBeenCalledWith(ticketId);
            expect(EmailSupportModel.findByTicket).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.findByTicket).toHaveBeenCalledWith(ticketId);
            expect(result).toEqual(mockEmails);
        });

        it('doit lancer ValidationError si l\'ID de ticket est invalide', async () => {
            // Arrange
            jest.spyOn(TicketSupportModel, 'findById');
            jest.spyOn(EmailSupportModel, 'findByTicket');

            // Act & Assert
            await expect(EmailSupportService.getEmailsByTicket(null)).rejects.toThrow(ValidationError);
            await expect(EmailSupportService.getEmailsByTicket(0)).rejects.toThrow(ValidationError);
            await expect(EmailSupportService.getEmailsByTicket('abc')).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.findById).not.toHaveBeenCalled();
            expect(EmailSupportModel.findByTicket).not.toHaveBeenCalled();
        });

        it('doit lancer NotFoundError si le ticket n\'existe pas', async () => {
            // Arrange
            const ticketId = 999;
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(null);
            jest.spyOn(EmailSupportModel, 'findByTicket');

            // Act & Assert
            await expect(EmailSupportService.getEmailsByTicket(ticketId)).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.findByTicket).not.toHaveBeenCalled();
        });

        it('doit lancer NotFoundError si aucun email n\'est trouvé pour le ticket', async () => {
            // Arrange
            const ticketId = 456;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Problème technique',
                statut: 'en_cours'
            };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(mockTicket);
            jest.spyOn(EmailSupportModel, 'findByTicket').mockResolvedValue([]);

            // Act & Assert
            await expect(EmailSupportService.getEmailsByTicket(ticketId)).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.findByTicket).toHaveBeenCalledTimes(1);
        });

        it('doit lancer NotFoundError si la recherche d\'emails retourne null', async () => {
            // Arrange
            const ticketId = 456;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Problème technique',
                statut: 'en_cours'
            };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(mockTicket);
            jest.spyOn(EmailSupportModel, 'findByTicket').mockResolvedValue(null);

            // Act & Assert
            await expect(EmailSupportService.getEmailsByTicket(ticketId)).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(EmailSupportModel.findByTicket).toHaveBeenCalledTimes(1);
        });
    });
});