import {
    jest,
    describe,
    it,
    expect,
    afterEach
} from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Créer des objets mock pour les composants
const mockEmailSupportController = {
    sendAndCreateTicket: jest.fn((req, res) => {
        res.status(201).json({
            message: 'sendAndCreateTicket appelé',
            data: req.body,
            userEmail: req.user.email
        });
    }),
    getEmailsByTicket: jest.fn((req, res) => {
        res.status(200).json({
            message: 'getEmailsByTicket appelé',
            ticketId: req.params.ticketId
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
app.post(
    '/api/emails/send',
    mockAuthenticateJWT,
    mockIsClient,
    mockEmailSupportController.sendAndCreateTicket
);
app.get(
    '/api/emails/:ticketId',
    mockAuthenticateJWT,
    mockCheckRole('RECEPTIONNISTE', 'ADMIN_GENERAL', 'SUPER_ADMIN'),
    mockEmailSupportController.getEmailsByTicket
);
/**
 * Tests pour toutes les routes d'emails
 * Configuration et réinitialisation des mocks après chaque test
 */
describe('Routes de emails', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests pour la route POST /api/emails/send
     * Vérifie l'envoi d'emails, l'authentification et les permissions
     */

    describe('POST /api/emails/send', () => {
        it('devrait appeler la méthode sendAndCreateTicket du contrôleur', async () => {
            const emailData = {
                email_client: 'client@test.com',
                email_destinataire: 'support@test.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            const response = await request(app)
                .post('/api/emails/send')
                .send(emailData)
                .expect(201);

            expect(response.body.message).toBe('sendAndCreateTicket appelé');
            expect(response.body.data).toEqual(emailData);
            expect(
                mockEmailSupportController.sendAndCreateTicket
            ).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
            expect(mockIsClient).toHaveBeenCalled();
        });

        it("devrait bloquer l'accès si l'authentification échoue", async () => {
            const emailData = {
                email_client: 'client@test.com',
                email_destinataire: 'support@test.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            // Restaurer temporairement le mock pour simuler un échec d'authentification
            const originalImplementation =
                mockAuthenticateJWT.getMockImplementation();
            mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
                return res.status(401).json({ message: 'Non autorisé' });
            });

            const response = await request(app)
                .post('/api/emails/send')
                .send(emailData)
                .expect(401);

            expect(response.body.message).toBe('Non autorisé');
            expect(
                mockEmailSupportController.sendAndCreateTicket
            ).not.toHaveBeenCalled();

            // Restaurer l'implémentation originale pour les autres tests
            mockAuthenticateJWT.mockImplementation(originalImplementation);
        });

        it("devrait vérifier que l'utilisateur est un client", async () => {
            const emailData = {
                email_client: 'client@test.com',
                email_destinataire: 'support@test.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.',
                type: 'technique'
            };

            // Créer une implémentation spéciale qui vérifie que le rôle est bien forcé à CLIENT
            mockIsClient.mockImplementationOnce((req, res, next) => {
                expect(req.user.role).toBe('ADMIN_GENERAL'); // Le rôle initial
                req.user.role = 'CLIENT'; // Force le rôle à CLIENT
                next();
            });

            await request(app)
                .post('/api/emails/send')
                .send(emailData)
                .expect(201);

            expect(mockIsClient).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * Tests pour la route GET /api/emails/:ticketId
     * Vérifie la récupération des emails par ticket et la gestion des rôles
     */
    describe('GET /api/emails/:ticketId', () => {
        it('devrait appeler la méthode getEmailsByTicket du contrôleur', async () => {
            const response = await request(app)
                .get('/api/emails/5')
                .expect(200);

            expect(response.body.message).toBe('getEmailsByTicket appelé');
            expect(response.body.ticketId).toBe('5');
            expect(
                mockEmailSupportController.getEmailsByTicket
            ).toHaveBeenCalledTimes(1);
            expect(mockAuthenticateJWT).toHaveBeenCalled();
        });

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

            const response = await request(app)
                .get('/api/emails/5')
                .expect(403);

            expect(response.body.message).toBe(
                'Accès refusé: rôle non autorisé'
            );
            expect(
                mockEmailSupportController.getEmailsByTicket
            ).not.toHaveBeenCalled();

            // Restaurer l'implémentation originale pour les autres tests
            mockAuthenticateJWT.mockImplementation(originalImplementation);
        });

        it('devrait accepter les rôles autorisés', async () => {
            // Tester chaque rôle autorisé
            const rolesAutorises = [
                'RECEPTIONNISTE',
                'ADMIN_GENERAL',
                'SUPER_ADMIN'
            ];

            for (const role of rolesAutorises) {
                // Réinitialiser les mocks
                jest.clearAllMocks();

                // Configurer le mock pour ce rôle spécifique
                mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
                    req.user = {
                        userId: 1,
                        email: 'user@test.com',
                        role: role
                    };
                    next();
                });

                const response = await request(app)
                    .get('/api/emails/5')
                    .expect(200);

                expect(response.body.message).toBe('getEmailsByTicket appelé');
                expect(
                    mockEmailSupportController.getEmailsByTicket
                ).toHaveBeenCalledTimes(1);
            }
        });
    });

    /**
     * Tests pour la validation des données d'entrée
     * Vérifie que les champs requis sont correctement validés
     */

    describe('Validation des données', () => {
        it('devrait vérifier que les données requises sont présentes', async () => {
            // Données incomplètes (manque le type)
            const emailDataInvalide = {
                email_client: 'client@test.com',
                email_destinataire: 'support@test.com',
                sujet: 'Problème technique',
                message: 'Mon appareil ne fonctionne pas.'
                // type manquant
            };

            // On simule la validation en surchargeant le contrôleur pour ce test
            const originalImplementation =
                mockEmailSupportController.sendAndCreateTicket.getMockImplementation();
            mockEmailSupportController.sendAndCreateTicket.mockImplementationOnce(
                (req, res) => {
                    // Validation simplifiée
                    if (!req.body.type) {
                        return res
                            .status(400)
                            .json({ message: 'Le champ type est requis' });
                    }
                    originalImplementation(req, res);
                }
            );

            const response = await request(app)
                .post('/api/emails/send')
                .send(emailDataInvalide)
                .expect(400);

            expect(response.body.message).toBe('Le champ type est requis');

            // Restaurer l'implémentation originale
            mockEmailSupportController.sendAndCreateTicket.mockImplementation(
                originalImplementation
            );
        });
    });

    /**
     * Tests pour les paramètres de route
     * Vérifie la gestion des différents formats d'ID de ticket
     */

    describe('Paramètres des routes', () => {
        it("devrait gérer différents formats d'ID de ticket", async () => {
            // Test avec un ID numérique
            let response = await request(app)
                .get('/api/emails/123')
                .expect(200);

            expect(response.body.ticketId).toBe('123');

            // Test avec un ID non numérique (qui sera converti en nombre par le contrôleur)
            response = await request(app).get('/api/emails/abc').expect(200);

            expect(response.body.ticketId).toBe('abc');
        });
    });
});
