import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

/**
 * Mock des fonctions d’authentification
 */

jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn().mockResolvedValue(123),
    getClientIdFromUser: jest.fn().mockResolvedValue(456)
}));

/**
 * Mock du service DemandeCourse
 */
jest.unstable_mockModule('../../src/services/demandeCourse.service.js', () => ({
    default: {
        getById: jest.fn(),
        getByClient: jest.fn(),
        getEnAttente: jest.fn(),
        creerDemande: jest.fn(),
        modifierDemande: jest.fn(),
        changerStatut: jest.fn(),
        supprimer: jest.fn()
    }
}));


/**
 * Mock du middleware d’authentification avec gestion des rôles
 */

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
    authenticateJWT: (req, res, next) => {
        req.user = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    },
    isClient: (req, res, next) => {
        req.user = { email: 'test@example.com', role: 'CLIENT' };
        next();
    },
    checkRole:
        (...allowedRoles) =>
        (req, res, next) => {
            req.user = { email: 'chauffeur@example.com', role: 'CHAUFFEUR' };
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Accès interdit' });
            }
            next();
        }
}));

let app, DemandeCourseService, AuthHelpers;

/**
 * Réinitialisation et configuration de l'application avant chaque test
 */

beforeEach(async () => {
    jest.resetModules();

    const express = (await import('express')).default;
    const demandeRoutes = (
        await import('../../src/routes/demandeCourseRoute.js')
    ).default;
    DemandeCourseService = (
        await import('../../src/services/demandeCourse.service.js')
    ).default;
    AuthHelpers = await import('../../src/utils/auth.helpers.js');

    app = express();
    app.use(express.json());
    app.use('/demandes', demandeRoutes);
});

describe('DemandeCourse Routes', () => {

    /**
     * Vérifie que l’on peut récupérer une demande par son ID
     */

    it('GET /demandes/:id - devrait retourner une demande', async () => {
        DemandeCourseService.getById.mockResolvedValue({ id_demande: 1 });

        const response = await request(app)
            .get('/demandes/1')
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(200);
        expect(DemandeCourseService.getById).toHaveBeenCalled();
        expect(response.body.data.id_demande).toBe(1);
    });

    /**
     * Vérifie que le client peut récupérer ses propres demandes
     */

    it('GET /demandes/me - devrait retourner les demandes du client', async () => {
        DemandeCourseService.getByClient.mockResolvedValue([]);

        const response = await request(app)
            .get('/demandes/me')
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(200);
        expect(DemandeCourseService.getByClient).toHaveBeenCalled();
    });

    /**
     * Vérifie que le client peut récupérer ses propres demandes
     */

    it('GET /demandes/en-attente - devrait retourner les demandes en attente', async () => {
        DemandeCourseService.getEnAttente.mockResolvedValue([]);

        const response = await request(app)
            .get('/demandes/en-attente')
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(200);
        expect(DemandeCourseService.getEnAttente).toHaveBeenCalled();
    });

    /**
     * Vérifie que la création d’une demande fonctionne
     */

    it('POST /demandes - devrait créer une demande', async () => {
        DemandeCourseService.creerDemande.mockResolvedValue({
            id_demande: 101
        });

        const response = await request(app)
            .post('/demandes')
            .send({ lieu_depart: 'A', lieu_arrivee: 'B' })
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(201);
        expect(DemandeCourseService.creerDemande).toHaveBeenCalled();
    });

    /**
     * Vérifie que la modification d’une demande fonctionne
     */

    it('PATCH /demandes/:id - devrait modifier une demande', async () => {
        DemandeCourseService.modifierDemande.mockResolvedValue({
            id_demande: 22
        });

        const response = await request(app)
            .patch('/demandes/22')
            .send({ lieu_depart: 'Nouveau lieu' })
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(200);
        expect(DemandeCourseService.modifierDemande).toHaveBeenCalled();
    });

    /**
     * Vérifie que le changement de statut d’une demande fonctionne
     */
    
    it('PATCH /demandes/:id/statut - devrait changer le statut de la demande', async () => {
        DemandeCourseService.changerStatut.mockResolvedValue({
            id_demande: 88,
            statut: 'acceptee'
        });

        const response = await request(app)
            .patch('/demandes/88/statut')
            .send({ statut: 'acceptee' })
            .set('Authorization', 'Bearer fake_token');

        expect(response.status).toBe(200);
        expect(DemandeCourseService.changerStatut).toHaveBeenCalled();
    });
});
