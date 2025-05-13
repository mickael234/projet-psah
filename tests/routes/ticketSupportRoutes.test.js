import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Créer des objets mock pour les composants
const mockTicketSupportController = {
    getMyTickets: jest.fn((req, res) => {
        res.status(200).json({
            message: 'getMyTickets appelé',
            userEmail: req.user.email
        });
    }),
    getById: jest.fn((req, res) => {
        res.status(200).json({
            message: 'getById appelé',
            id: req.params.id
        });
    }),
    getAll: jest.fn((req, res) => {
        res.status(200).json({
            message: 'getAll appelé',
            filters: req.query
        });
    }),
    assign: jest.fn((req, res) => {
        res.status(200).json({
            message: 'assign appelé',
            id: req.params.id
        });
    }),
    updateStatus: jest.fn((req, res) => {
        res.status(200).json({
            message: 'updateStatus appelé',
            id: req.params.id,
            statut: req.body.statut
        });
    }),
    reassign: jest.fn((req, res) => {
        res.status(200).json({
            message: 'reassign appelé',
            id: req.params.id,
            personnelId: req.body.personnelId
        });
    })
};

// Mock des middlewares d'authentification
const mockAuthenticateJWT = jest.fn((req, res, next) => {
    req.user = {
        userId: 1,
        email: 'user@test.com',
        role: 'ADMIN_GENERAL'
    };
    next();
});

const mockIsClient = jest.fn((req, res, next) => {
    if (req.user.role === 'CLIENT') {
        return next();
    }
    req.user.role = 'CLIENT'; // Pour les besoins du test, on force le rôle
    next();
});

const mockCheckRole = (...roles) =>
    jest.fn((req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        }
        return res
            .status(403)
            .json({ message: 'Accès refusé: rôle non autorisé' });
    });

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());

// Configuration des routes à tester
app.get(
    '/api/tickets/my',
    mockAuthenticateJWT,
    mockIsClient,
    mockTicketSupportController.getMyTickets
);
app.get(
    '/api/tickets/:id',
    mockAuthenticateJWT,
    mockTicketSupportController.getById
);
app.get(
    '/api/tickets',
    mockAuthenticateJWT,
    mockCheckRole('RECEPTIONNISTE', 'ADMIN_GENERAL', 'SUPER_ADMIN'),
    mockTicketSupportController.getAll
);
app.patch(
    '/api/tickets/:id/assign',
    mockAuthenticateJWT,
    mockCheckRole('RECEPTIONNISTE', 'ADMIN_GENERAL', 'SUPER_ADMIN'),
    mockTicketSupportController.assign
);
app.patch(
    '/api/tickets/:id/status',
    mockAuthenticateJWT,
    mockCheckRole('RECEPTIONNISTE', 'ADMIN_GENERAL', 'SUPER_ADMIN'),
    mockTicketSupportController.updateStatus
);
app.patch(
    '/api/tickets/:id/reassign',
    mockAuthenticateJWT,
    mockCheckRole('RECEPTIONNISTE', 'ADMIN_GENERAL', 'SUPER_ADMIN'),
    mockTicketSupportController.reassign
);

/**
 * Tests pour l'ensemble des routes de tickets
 * Configuration et réinitialisation des mocks après chaque test
 */

describe('Routes de tickets', () => {
    // Réinitialiser les mocks après chaque test
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests pour la route GET /api/tickets/my
     * Vérifie la récupération des tickets du client connecté
     */

    describe('GET /api/tickets/my', () => {
        it('devrait appeler la méthode getMyTickets du contrôleur', async () => {
            const response = await request(app)
                .get('/api/tickets/my')
                .expect(200);

            expect(response.body.message).toBe('getMyTickets appelé');
            expect(
                mockTicketSupportController.getMyTickets
            ).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
            expect(mockIsClient).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la route GET /api/tickets/:id
     * Vérifie la récupération d'un ticket spécifique par son ID
     */

    describe('GET /api/tickets/:id', () => {
        it('devrait appeler la méthode getById du contrôleur', async () => {
            const response = await request(app)
                .get('/api/tickets/5')
                .expect(200);

            expect(response.body.message).toBe('getById appelé');
            expect(response.body.id).toBe('5');
            expect(mockTicketSupportController.getById).toHaveBeenCalledTimes(
                1
            );
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la route GET /api/tickets
     * Vérifie la récupération de tous les tickets avec filtres optionnels
     */

    describe('GET /api/tickets', () => {
        it('devrait appeler la méthode getAll du contrôleur', async () => {
            const response = await request(app).get('/api/tickets').expect(200);

            expect(response.body.message).toBe('getAll appelé');
            expect(mockTicketSupportController.getAll).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });

        it('devrait appeler la méthode getAll avec les filtres', async () => {
            const response = await request(app)
                .get('/api/tickets?type=technique&statut=ouvert')
                .expect(200);

            expect(response.body.message).toBe('getAll appelé');
            expect(response.body.filters).toEqual({
                type: 'technique',
                statut: 'ouvert'
            });
            expect(mockTicketSupportController.getAll).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la route PATCH /api/tickets/:id/assign
     * Vérifie l'assignation d'un ticket à un réceptionniste
     */

    describe('PATCH /api/tickets/:id/assign', () => {
        it('devrait appeler la méthode assign du contrôleur', async () => {
            const response = await request(app)
                .patch('/api/tickets/10/assign')
                .expect(200);

            expect(response.body.message).toBe('assign appelé');
            expect(response.body.id).toBe('10');
            expect(mockTicketSupportController.assign).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la route PATCH /api/tickets/:id/status
     * Vérifie la mise à jour du statut d'un ticket
     */

    describe('PATCH /api/tickets/:id/status', () => {
        it('devrait appeler la méthode updateStatus du contrôleur', async () => {
            const statusData = {
                statut: 'fermé'
            };

            const response = await request(app)
                .patch('/api/tickets/10/status')
                .send(statusData)
                .expect(200);

            expect(response.body.message).toBe('updateStatus appelé');
            expect(response.body.id).toBe('10');
            expect(response.body.statut).toBe('fermé');
            expect(
                mockTicketSupportController.updateStatus
            ).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la route PATCH /api/tickets/:id/reassign
     * Vérifie la réassignation d'un ticket à un autre réceptionniste
     */

    describe('PATCH /api/tickets/:id/reassign', () => {
        it('devrait appeler la méthode reassign du contrôleur', async () => {
            const reassignData = {
                personnelId: 5
            };

            const response = await request(app)
                .patch('/api/tickets/10/reassign')
                .send(reassignData)
                .expect(200);

            expect(response.body.message).toBe('reassign appelé');
            expect(response.body.id).toBe('10');
            expect(response.body.personnelId).toBe(5);
            expect(mockTicketSupportController.reassign).toHaveBeenCalledTimes(
                1
            );
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });
    });

    /**
     * Tests pour le middleware de vérification des rôles
     * Vérifie le blocage d'accès pour les rôles non autorisés
     */

    describe('Middleware de vérification de rôle', () => {
        it("devrait bloquer l'accès avec un rôle non autorisé", async () => {
            // Restaurer temporairement le mock pour simuler un rôle non autorisé
            const originalImplementation =
                mockAuthenticateJWT.getMockImplementation();
            mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    userId: 1,
                    email: 'user@test.com',
                    role: 'ROLE_NON_AUTORISE'
                };
                next();
            });

            const response = await request(app).get('/api/tickets').expect(403);

            expect(response.body.message).toBe(
                'Accès refusé: rôle non autorisé'
            );
            expect(mockTicketSupportController.getAll).not.toHaveBeenCalled();

            // Restaurer l'implémentation originale pour les autres tests
            mockAuthenticateJWT.mockImplementation(originalImplementation);
        });
    });

    /**
     * Tests pour la protection des routes avec JWT
     * Vérifie le comportement en cas d'échec d'authentification
     */

    describe('Protection des routes avec authenticateJWT', () => {
        it("devrait bloquer l'accès si l'authentification échoue", async () => {
            // Restaurer temporairement le mock pour simuler un échec d'authentification
            const originalImplementation =
                mockAuthenticateJWT.getMockImplementation();
            mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
                return res.status(401).json({ message: 'Non autorisé' });
            });

            const response = await request(app)
                .get('/api/tickets/1')
                .expect(401);

            expect(response.body.message).toBe('Non autorisé');
            expect(mockTicketSupportController.getById).not.toHaveBeenCalled();

            // Restaurer l'implémentation originale pour les autres tests
            mockAuthenticateJWT.mockImplementation(originalImplementation);
        });
    });

    /**
     * Tests pour les routes protégées par le middleware isClient
     * Vérifie que le rôle CLIENT est forcé pour certaines routes
     */

    describe('Protection des routes clientes avec isClient', () => {
        it('devrait forcer le rôle CLIENT pour la route /my', async () => {
            const response = await request(app)
                .get('/api/tickets/my')
                .expect(200);

            expect(mockIsClient).toHaveBeenCalled();
            expect(response.body.message).toBe('getMyTickets appelé');
        });
    });
});
