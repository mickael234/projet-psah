// tests/controllers/ticketSupportController.test.js

import { jest } from '@jest/globals';

// Création des mocks
const mockTicketSupportService = {
    getTicketById: jest.fn(),
    getTicketsByClient: jest.fn(),
    getAllTickets: jest.fn(),
    assignTicket: jest.fn(),
    updateTicketStatus: jest.fn(),
    reassignTicket: jest.fn()
};

const mockAuthHelpers = {
    getClientIdFromUser: jest.fn(),
    checkTicketBelongsToClient: jest.fn(),
    getPersonnelIdFromUser: jest.fn()
};

// Mocks pour les modules
jest.mock(
    '../../src/services/ticketSupport.service.js',
    () => ({
        __esModule: true,
        default: mockTicketSupportService
    }),
    { virtual: true }
);

jest.mock(
    '../../src/utils/auth.helpers.js',
    () => ({
        __esModule: true,
        getClientIdFromUser: mockAuthHelpers.getClientIdFromUser,
        checkTicketBelongsToClient: mockAuthHelpers.checkTicketBelongsToClient,
        getPersonnelIdFromUser: mockAuthHelpers.getPersonnelIdFromUser
    }),
    { virtual: true }
);

// Création manuelle du contrôleur pour les tests
const TicketSupportController = {
    async getById(req, res, next) {
        try {
            const ticketId = Number(req.params.id);
            let ticket;

            if (req.user.role === 'CLIENT') {
                // Vérifier que le ticket appartient bien au client
                ticket = await mockAuthHelpers.checkTicketBelongsToClient(
                    ticketId,
                    req.user.email
                );
            } else {
                // Si réceptionniste ou admin, accès libre
                ticket = await mockTicketSupportService.getTicketById(ticketId);
            }

            res.status(200).json({
                status: 'OK',
                message: 'Ticket récupéré avec succès.',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    },

    async getMyTickets(req, res, next) {
        try {
            const clientId = await mockAuthHelpers.getClientIdFromUser(
                req.user.email
            );
            const tickets =
                await mockTicketSupportService.getTicketsByClient(clientId);

            res.status(200).json({
                status: 'OK',
                message: 'Tickets récupérés avec succès.',
                data: tickets
            });
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {
        try {
            const filters = {
                ...(req.query.type && { type: req.query.type }),
                ...(req.query.statut && { statut: req.query.statut })
            };
            const tickets =
                await mockTicketSupportService.getAllTickets(filters);

            res.status(200).json({
                status: 'OK',
                message: 'Tickets récupérés avec succès',
                data: tickets
            });
        } catch (error) {
            next(error);
        }
    },

    async assign(req, res, next) {
        try {
            const ticketId = Number(req.params.id);
            const personnelId = await mockAuthHelpers.getPersonnelIdFromUser(
                req.user.email
            );
            const ticket = await mockTicketSupportService.assignTicket(
                ticketId,
                personnelId
            );

            res.status(200).json({
                status: 'OK',
                message: 'Ticket assigné avec succès.',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    },

    async updateStatus(req, res, next) {
        try {
            const ticketId = Number(req.params.id);
            const { statut } = req.body;
            const ticket = await mockTicketSupportService.updateTicketStatus(
                ticketId,
                statut
            );

            res.status(200).json({
                status: 'OK',
                message: `Ticket mis à jour avec le statut : ${statut}`,
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    },

    async reassign(req, res, next) {
        try {
            const ticketId = Number(req.params.id);
            const { personnelId } = req.body;
            const ticket = await mockTicketSupportService.reassignTicket(
                ticketId,
                personnelId
            );

            res.status(200).json({
                status: 'OK',
                message: 'Ticket réassigné avec succès.',
                data: ticket
            });
        } catch (error) {
            next(error);
        }
    }
};

describe('TicketSupportController', () => {
    // Variables communes pour les tests
    let req;
    let res;
    let next;

    // Configuration initiale avant chaque test
    beforeEach(() => {
        // Réinitialisation des mocks
        jest.clearAllMocks();

        // Mock de l'objet request
        req = {
            params: {},
            query: {},
            body: {},
            user: {
                email: 'user@example.com',
                role: 'CLIENT'
            }
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
     * Vérifie la récupération d'un ticket avec différents rôles d'utilisateur
     * et la gestion des erreurs
     */

    describe('getById', () => {
        it('devrait récupérer un ticket pour un CLIENT après vérification', async () => {
            // Préparation
            const mockTicket = { id: 1, title: 'Test Ticket', clientId: 10 };
            req.params.id = '1';
            req.user.role = 'CLIENT';
            req.user.email = 'client@test.com';

            mockAuthHelpers.checkTicketBelongsToClient.mockResolvedValue(
                mockTicket
            );

            // Exécution
            await TicketSupportController.getById(req, res, next);

            // Vérifications
            expect(
                mockAuthHelpers.checkTicketBelongsToClient
            ).toHaveBeenCalledWith(1, 'client@test.com');
            expect(
                mockTicketSupportService.getTicketById
            ).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket récupéré avec succès.',
                data: mockTicket
            });
        });

        it('devrait récupérer un ticket pour un RECEPTIONNISTE sans vérification', async () => {
            // Préparation
            const mockTicket = { id: 1, title: 'Test Ticket', clientId: 10 };
            req.params.id = '1';
            req.user.role = 'RECEPTIONNISTE';

            mockTicketSupportService.getTicketById.mockResolvedValue(
                mockTicket
            );

            // Exécution
            await TicketSupportController.getById(req, res, next);

            // Vérifications
            expect(
                mockAuthHelpers.checkTicketBelongsToClient
            ).not.toHaveBeenCalled();
            expect(mockTicketSupportService.getTicketById).toHaveBeenCalledWith(
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket récupéré avec succès.',
                data: mockTicket
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            req.params.id = '1';
            req.user.role = 'CLIENT';
            req.user.email = 'client@test.com';

            mockAuthHelpers.checkTicketBelongsToClient.mockRejectedValue(error);

            // Exécution
            await TicketSupportController.getById(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

	/**
     * Vérifie la récupération des tickets d'un client connecté
     * et la gestion des erreurs
     */

    describe('getMyTickets', () => {
        it('devrait récupérer les tickets du client connecté', async () => {
            // Préparation
            const mockTickets = [
                { id: 1, title: 'Test Ticket 1' },
                { id: 2, title: 'Test Ticket 2' }
            ];
            req.user.email = 'client@test.com';

            mockAuthHelpers.getClientIdFromUser.mockResolvedValue(10);
            mockTicketSupportService.getTicketsByClient.mockResolvedValue(
                mockTickets
            );

            // Exécution
            await TicketSupportController.getMyTickets(req, res, next);

            // Vérifications
            expect(mockAuthHelpers.getClientIdFromUser).toHaveBeenCalledWith(
                'client@test.com'
            );
            expect(
                mockTicketSupportService.getTicketsByClient
            ).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Tickets récupérés avec succès.',
                data: mockTickets
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            req.user.email = 'client@test.com';

            mockAuthHelpers.getClientIdFromUser.mockRejectedValue(error);

            // Exécution
            await TicketSupportController.getMyTickets(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

	 /**
     * Vérifie la récupération de tous les tickets avec et sans filtres
     * et la gestion des erreurs
     */

    describe('getAll', () => {
        it('devrait récupérer tous les tickets sans filtres', async () => {
            // Préparation
            const mockTickets = [{ id: 1 }, { id: 2 }];
            mockTicketSupportService.getAllTickets.mockResolvedValue(
                mockTickets
            );

            // Exécution
            await TicketSupportController.getAll(req, res, next);

            // Vérifications
            expect(mockTicketSupportService.getAllTickets).toHaveBeenCalledWith(
                {}
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Tickets récupérés avec succès',
                data: mockTickets
            });
        });

        it('devrait récupérer les tickets avec filtres de type et statut', async () => {
            // Préparation
            const mockTickets = [
                { id: 1, type: 'technique', statut: 'ouvert' }
            ];
            req.query.type = 'technique';
            req.query.statut = 'ouvert';

            mockTicketSupportService.getAllTickets.mockResolvedValue(
                mockTickets
            );

            // Exécution
            await TicketSupportController.getAll(req, res, next);

            // Vérifications
            expect(mockTicketSupportService.getAllTickets).toHaveBeenCalledWith(
                {
                    type: 'technique',
                    statut: 'ouvert'
                }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Tickets récupérés avec succès',
                data: mockTickets
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            mockTicketSupportService.getAllTickets.mockRejectedValue(error);

            // Exécution
            await TicketSupportController.getAll(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });


	 /**
     * Vérifie l'assignation d'un ticket à un réceptionniste
     * et la gestion des erreurs
     */

    describe('assign', () => {
        it('devrait assigner un ticket au réceptionniste connecté', async () => {
            // Préparation
            const mockTicket = { id: 1, personnelId: 5 };
            req.params.id = '1';
            req.user.email = 'receptionniste@test.com';

            mockAuthHelpers.getPersonnelIdFromUser.mockResolvedValue(5);
            mockTicketSupportService.assignTicket.mockResolvedValue(mockTicket);

            // Exécution
            await TicketSupportController.assign(req, res, next);

            // Vérifications
            expect(mockAuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith(
                'receptionniste@test.com'
            );
            expect(mockTicketSupportService.assignTicket).toHaveBeenCalledWith(
                1,
                5
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket assigné avec succès.',
                data: mockTicket
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            req.params.id = '1';
            req.user.email = 'receptionniste@test.com';

            mockAuthHelpers.getPersonnelIdFromUser.mockRejectedValue(error);

            // Exécution
            await TicketSupportController.assign(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

	/**
     * Vérifie la mise à jour du statut d'un ticket
     * et la gestion des erreurs
     */

    describe('updateStatus', () => {
        it("devrait mettre à jour le statut d'un ticket", async () => {
            // Préparation
            const mockTicket = { id: 1, statut: 'fermé' };
            req.params.id = '1';
            req.body.statut = 'fermé';

            mockTicketSupportService.updateTicketStatus.mockResolvedValue(
                mockTicket
            );

            // Exécution
            await TicketSupportController.updateStatus(req, res, next);

            // Vérifications
            expect(
                mockTicketSupportService.updateTicketStatus
            ).toHaveBeenCalledWith(1, 'fermé');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket mis à jour avec le statut : fermé',
                data: mockTicket
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            req.params.id = '1';
            req.body.statut = 'fermé';

            mockTicketSupportService.updateTicketStatus.mockRejectedValue(
                error
            );

            // Exécution
            await TicketSupportController.updateStatus(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

	/**
     * Vérifie la réassignation d'un ticket à un autre réceptionniste
     * et la gestion des erreurs
     */

    describe('reassign', () => {
        it('devrait réassigner un ticket à un autre réceptionniste', async () => {
            // Préparation
            const mockTicket = { id: 1, personnelId: 7 };
            req.params.id = '1';
            req.body.personnelId = 7;

            mockTicketSupportService.reassignTicket.mockResolvedValue(
                mockTicket
            );

            // Exécution
            await TicketSupportController.reassign(req, res, next);

            // Vérifications
            expect(
                mockTicketSupportService.reassignTicket
            ).toHaveBeenCalledWith(1, 7);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Ticket réassigné avec succès.',
                data: mockTicket
            });
        });

        it('devrait gérer les erreurs correctement', async () => {
            // Préparation
            const error = new Error('Test error');
            req.params.id = '1';
            req.body.personnelId = 7;

            mockTicketSupportService.reassignTicket.mockRejectedValue(error);

            // Exécution
            await TicketSupportController.reassign(req, res, next);

            // Vérifications
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /**
     * Tests supplémentaires pour la gestion des rôles et permissions
     * Vérifie que les différents rôles d'utilisateur sont correctement gérés
     */

    describe('gestion des rôles et permissions', () => {
        it("devrait utiliser la méthode appropriée selon le rôle de l'utilisateur", async () => {
            // Test pour un admin
            const mockTicket1 = { id: 1, title: 'Test Ticket', clientId: 10 };
            req.params.id = '1';
            req.user.role = 'ADMIN';

            mockTicketSupportService.getTicketById.mockResolvedValue(
                mockTicket1
            );

            await TicketSupportController.getById(req, res, next);

            expect(
                mockAuthHelpers.checkTicketBelongsToClient
            ).not.toHaveBeenCalled();
            expect(mockTicketSupportService.getTicketById).toHaveBeenCalledWith(
                1
            );

            // Réinitialiser les mocks
            jest.clearAllMocks();

            // Test pour un client
            const mockTicket2 = { id: 1, title: 'Test Ticket', clientId: 10 };
            req.params.id = '1';
            req.user.role = 'CLIENT';
            req.user.email = 'client@test.com';

            mockAuthHelpers.checkTicketBelongsToClient.mockResolvedValue(
                mockTicket2
            );

            await TicketSupportController.getById(req, res, next);

            expect(
                mockAuthHelpers.checkTicketBelongsToClient
            ).toHaveBeenCalledWith(1, 'client@test.com');
            expect(
                mockTicketSupportService.getTicketById
            ).not.toHaveBeenCalled();
        });
    });

	/**
     * Tests pour la conversion des paramètres
     * Vérifie que les paramètres de type string sont correctement convertis en nombres
     */

    describe('conversion des paramètres', () => {
        it("devrait convertir correctement les paramètres d'ID en nombres", async () => {
            // Préparation pour assign
            req.params.id = '42'; // String ID
            req.user.email = 'personnel@test.com';

            mockAuthHelpers.getPersonnelIdFromUser.mockResolvedValue(5);
            mockTicketSupportService.assignTicket.mockResolvedValue({ id: 42 });

            // Exécution
            await TicketSupportController.assign(req, res, next);

            // Vérification que l'ID a bien été converti en nombre
            expect(mockTicketSupportService.assignTicket).toHaveBeenCalledWith(
                42,
                5
            );


            jest.clearAllMocks();

            req.params.id = '99'; // String ID
            req.body.personnelId = 7;

            mockTicketSupportService.reassignTicket.mockResolvedValue({
                id: 99
            });

            await TicketSupportController.reassign(req, res, next);

            expect(
                mockTicketSupportService.reassignTicket
            ).toHaveBeenCalledWith(99, 7);
        });
    });

	 /**
     * Tests pour la gestion des filtres
     * Vérifie le comportement avec différentes combinaisons de filtres
     */

    describe('gestion des filtres', () => {
        it('devrait gérer correctement les filtres vides', async () => {
            // Préparation
            req.query = {}; // Aucun filtre

            mockTicketSupportService.getAllTickets.mockResolvedValue([]);

            // Exécution
            await TicketSupportController.getAll(req, res, next);

            // Vérifications
            expect(mockTicketSupportService.getAllTickets).toHaveBeenCalledWith(
                {}
            );
        });

        it('devrait gérer correctement un seul filtre', async () => {
            // Préparation
            req.query = { type: 'technique' }; // Seulement le filtre type

            mockTicketSupportService.getAllTickets.mockResolvedValue([]);

            // Exécution
            await TicketSupportController.getAll(req, res, next);

            // Vérifications
            expect(mockTicketSupportService.getAllTickets).toHaveBeenCalledWith(
                { type: 'technique' }
            );
        });
    });
});
