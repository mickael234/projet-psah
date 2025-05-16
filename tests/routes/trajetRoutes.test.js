import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

/**
 * Mock des fonctions utilitaires d'authentification
 */
jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn().mockResolvedValue(123),
    getClientIdFromUser: jest.fn().mockResolvedValue(456)
}));

/**
 * Mock complet du service Trajet
 */
jest.unstable_mockModule('../../src/services/trajet.service.js', () => ({
    default: {
        getById: jest.fn(),
        getByChauffeur: jest.fn(),
        getPlanningParJour: jest.fn(),
        creerTrajet: jest.fn(),
        modifierHoraires: jest.fn(),
        changerStatut: jest.fn()
    }
}));

/**
 * Mock du middleware d'authentification avec différents rôles
 */
jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
    authenticateJWT: (req, res, next) => {
        req.user = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    },
    isClient: (req, res, next) => {
        // Changement du rôle mais conservation de l'email pour que les tests restent cohérents
        req.user = { email: 'test@example.com', role: 'CLIENT' };
        next();
    },
    isPersonnel: (req, res, next) => {
        req.user = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    },
    isAdmin: (req, res, next) => {
        req.user = { email: 'test@example.com', role: 'ADMIN' };
        next();
    }
}));

let app, TrajetService, AuthHelpers;

/**
 * Configuration de l'application Express avant chaque test
 */

beforeEach(async () => {
    jest.resetModules();

    const express = (await import('express')).default;

    const trajetRoutes = (await import('../../src/routes/trajetRoutes.js'))
        .default;

    TrajetService = (await import('../../src/services/trajet.service.js'))
        .default;
		
    AuthHelpers = await import('../../src/utils/auth.helpers.js');

    // Configurer l'application Express
    app = express();
    app.use(express.json());
    app.use('/trajets', trajetRoutes);
});

describe('Trajet Routes', () => {
    /**
     * Vérifie que le chauffeur peut récupérer ses trajets
     */
    it('GET /trajets/me - devrait retourner les trajets du chauffeur', async () => {
        // Préparation du mock
        const mockTrajets = [{ id_trajet: 1 }, { id_trajet: 2 }];
        TrajetService.getByChauffeur.mockResolvedValue(mockTrajets);

        // Exécution du test
        const response = await request(app)
            .get('/trajets/me')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith(
            'test@example.com'
        );
        expect(TrajetService.getByChauffeur).toHaveBeenCalledWith(123, {});
        expect(response.body.data).toEqual(mockTrajets);
    });

    /**
     * Vérifie que le planning peut être récupéré par un chauffeur
     */

    it('GET /trajets/planning - devrait retourner le planning', async () => {
        // Préparation du mock
        const mockPlanning = [{ date: '2025-01-01', trajets: [] }];
        TrajetService.getPlanningParJour.mockResolvedValue(mockPlanning);

        // Exécution du test
        const response = await request(app)
            .get('/trajets/planning')
            .query({ dateMin: '2025-01-01', dateMax: '2025-01-07' })
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith(
            'test@example.com'
        );
        expect(TrajetService.getPlanningParJour).toHaveBeenCalledWith(
            123,
            '2025-01-01',
            '2025-01-07'
        );
        expect(response.body.data).toEqual(mockPlanning);
    });

    /**
     * Vérifie que l'on peut récupérer un trajet par ID
     */

    it('GET /trajets/:id - devrait retourner un trajet', async () => {
        // Préparation du mock
        const mockTrajet = { id_trajet: 1, statut: 'en_cours' };
        TrajetService.getById.mockResolvedValue(mockTrajet);

        // Exécution du test
        const response = await request(app)
            .get('/trajets/1')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith(
            'test@example.com'
        );
        expect(TrajetService.getById).toHaveBeenCalledWith(1, 123);
        expect(response.body.data).toEqual(mockTrajet);
    });

    /**
     * Vérifie que l'on peut créer un trajet
     */

    it('POST /trajets - devrait créer un trajet', async () => {
        // Préparation du mock
        const mockTrajetData = {
            id_personnel: 1,
            id_demande_course: 2,
            date_prise_en_charge: '2025-01-01T10:00',
            date_depose: '2025-01-01T11:00'
        };
        const mockTrajetCreated = { ...mockTrajetData, id_trajet: 42 };
        TrajetService.creerTrajet.mockResolvedValue(mockTrajetCreated);
        const personnelId = 123;
        // Exécution du test
        const response = await request(app)
            .post('/trajets')
            .send(mockTrajetData)
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(201);
        expect(TrajetService.creerTrajet).toHaveBeenCalledWith(personnelId, mockTrajetData);
        expect(response.body.data).toEqual(mockTrajetCreated);
    });

    /**
     * Vérifie que le client peut modifier les horaires d’un trajet
     */

    it('PATCH /trajets/:id/horaires - client peut modifier horaires', async () => {
        // Préparation du mock
        const horairesData = {
            date_prise_en_charge: '2025-01-02T10:00',
            date_depose: '2025-01-02T12:00'
        };
        const mockTrajetModified = { id_trajet: 5, ...horairesData };
        TrajetService.modifierHoraires.mockResolvedValue(mockTrajetModified);

        // Exécution du test
        const response = await request(app)
            .patch('/trajets/5/horaires')
            .send(horairesData)
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getClientIdFromUser).toHaveBeenCalledWith(
            'test@example.com'
        );
        expect(TrajetService.modifierHoraires).toHaveBeenCalledWith(
            5,
            456,
            horairesData.date_prise_en_charge,
            horairesData.date_depose
        );
        expect(response.body.data).toEqual(mockTrajetModified);
    });

    /**
     * Vérifie que le chauffeur peut modifier le statut d’un trajet
     */

    it('PATCH /trajets/:id/statut - chauffeur peut modifier le statut', async () => {
        // Préparation du mock
        const mockTrajetModified = {
            id_trajet: 9,
            statut: 'termine'
        };
        TrajetService.changerStatut.mockResolvedValue(mockTrajetModified);

        // Exécution du test
        const response = await request(app)
            .patch('/trajets/9/statut')
            .send({ statut: 'termine' })
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith(
            'test@example.com'
        );
        expect(TrajetService.changerStatut).toHaveBeenCalledWith(
            9,
            'termine',
            123
        );
        expect(response.body.data).toEqual(mockTrajetModified);
    });
});
