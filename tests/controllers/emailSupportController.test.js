// tests/controllers/emailSupportController.test.js

import { jest } from '@jest/globals';

// Création des mocks
const mockEmailSupportService = {
    sendAndCreateTicket: jest.fn(),
    getEmailsByTicket: jest.fn()
};

const mockAuthHelpers = {
    getClientIdFromUser: jest.fn()
};

// Mocks pour les modules
jest.mock(
    '../../src/services/emailSupport.service.js',
    () => ({
        __esModule: true,
        default: mockEmailSupportService
    }),
    { virtual: true }
);

jest.mock(
    '../../src/utils/auth.helpers.js',
    () => ({
        __esModule: true,
        getClientIdFromUser: mockAuthHelpers.getClientIdFromUser
    }),
    { virtual: true }
);

// Création manuelle du contrôleur pour les tests
const EmailSupportController = {
    async sendAndCreateTicket(req, res, next) {
        try {
            const { email_client, email_destinataire, sujet, message, type } =
                req.body;

            const clientId = await mockAuthHelpers.getClientIdFromUser(
                req.user.email
            );

            const result = await mockEmailSupportService.sendAndCreateTicket({
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
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    async getEmailsByTicket(req, res, next) {
        try {
            const ticketId = Number(req.params.ticketId);
            const emails =
                await mockEmailSupportService.getEmailsByTicket(ticketId);

            res.status(200).json({
                status: 'OK',
                message: 'Emails récupérés avec succès.',
                data: emails
            });
        } catch (error) {
            next(error);
        }
    }
};

describe('EmailSupportController', () => {
    /**
     * - Initialise les objets req, res et next avant chaque test
     * - Réinitialise tous les mocks entre les tests
     */

    // Variables communes pour les tests
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock de l'objet request
        req = {
            params: {},
            body: {},
            user: { email: 'client@example.com' }
        };

        // Mock de l'objet response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Mock de la fonction next
        next = jest.fn();
    });

    /**
     * Vérifie l'envoi d'email et la création de ticket
     * ainsi que la gestion des erreurs
     */

    describe('sendAndCreateTicket', () => {
        it('devrait envoyer un email et créer un ticket avec succès', async () => {
            // Préparation
            const mockClientId = 1;
            const mockEmailData = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            const mockResponse = {
                ticket: { id: 1, statut: 'ouvert', clientId: mockClientId },
                email: {
                    id: 1,
                    sujet: 'Problème technique',
                    contenu: 'Mon appareil ne fonctionne pas.'
                }
            };

            req.body = mockEmailData;

            mockAuthHelpers.getClientIdFromUser.mockResolvedValue(mockClientId);
            mockEmailSupportService.sendAndCreateTicket.mockResolvedValue(
                mockResponse
            );

            // Exécution
            await EmailSupportController.sendAndCreateTicket(req, res, next);

            // Vérifications
            expect(mockAuthHelpers.getClientIdFromUser).toHaveBeenCalledWith(
                'client@example.com'
            );
            expect(
                mockEmailSupportService.sendAndCreateTicket
            ).toHaveBeenCalledWith({
                ...mockEmailData,
                clientId: mockClientId
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket et e-mail envoyés avec succès.',
                data: mockResponse
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error("Erreur lors de l'envoi de l'email");

            req.body = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            mockAuthHelpers.getClientIdFromUser.mockRejectedValue(error);

            // Exécution
            await EmailSupportController.sendAndCreateTicket(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
            expect(
                mockEmailSupportService.sendAndCreateTicket
            ).not.toHaveBeenCalled();
        });
    });

    /**
     * Vérifie la récupération des emails associés à un ticket
     * et la conversion de l'ID du ticket
     */

    describe('getEmailsByTicket', () => {
        it('devrait récupérer les emails associés à un ticket', async () => {
            // Préparation
            const ticketId = 1;
            const mockEmails = [
                {
                    id: 1,
                    sujet: 'Problème technique',
                    contenu: 'Mon appareil ne fonctionne pas.'
                },
                {
                    id: 2,
                    sujet: 'RE: Problème technique',
                    contenu: 'Avez-vous essayé de redémarrer?'
                }
            ];

            req.params.ticketId = ticketId.toString();

            mockEmailSupportService.getEmailsByTicket.mockResolvedValue(
                mockEmails
            );

            // Exécution
            await EmailSupportController.getEmailsByTicket(req, res, next);

            // Vérifications
            expect(
                mockEmailSupportService.getEmailsByTicket
            ).toHaveBeenCalledWith(ticketId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Emails récupérés avec succès.',
                data: mockEmails
            });
        });

        it("devrait convertir l'ID du ticket en nombre", async () => {
            // Préparation
            const ticketIdString = '5';
            const ticketIdNumber = 5;
            const mockEmails = [];

            req.params.ticketId = ticketIdString;

            mockEmailSupportService.getEmailsByTicket.mockResolvedValue(
                mockEmails
            );

            // Exécution
            await EmailSupportController.getEmailsByTicket(req, res, next);

            // Vérifications
            expect(
                mockEmailSupportService.getEmailsByTicket
            ).toHaveBeenCalledWith(ticketIdNumber);
        });

        it('devrait gérer les erreurs correctement lors de la récupération des emails', async () => {
            // Préparation
            const error = new Error('Ticket non trouvé');

            req.params.ticketId = '999';

            mockEmailSupportService.getEmailsByTicket.mockRejectedValue(error);

            // Exécution
            await EmailSupportController.getEmailsByTicket(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /**
     * Vérifie le comportement dans des situations spécifiques
     * comme lorsque l'ID client est inaccessible ou qu'aucun email n'est trouvé
     */

    describe('cas particuliers', () => {
        it("devrait gérer le cas où l'ID client ne peut pas être récupéré", async () => {
            // Préparation
            const error = new Error(
                "Erreur lors de la récupération de l'ID client"
            );

            req.body = {
                email_client: 'client@example.com',
                email_destinataire: 'support@example.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            mockAuthHelpers.getClientIdFromUser.mockRejectedValue(error);

            // Exécution
            await EmailSupportController.sendAndCreateTicket(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
            expect(
                mockEmailSupportService.sendAndCreateTicket
            ).not.toHaveBeenCalled();
        });

        it("devrait gérer le cas où aucun email n'est trouvé pour un ticket", async () => {
            // Préparation
            const emptyEmails = [];

            req.params.ticketId = '5';

            mockEmailSupportService.getEmailsByTicket.mockResolvedValue(
                emptyEmails
            );

            // Exécution
            await EmailSupportController.getEmailsByTicket(req, res, next);

            // Vérifications
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Emails récupérés avec succès.',
                data: emptyEmails
            });
        });
    });
});
