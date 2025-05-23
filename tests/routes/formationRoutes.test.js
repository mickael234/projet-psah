import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

/**
 * Mock des fonctions utilitaires d'authentification
 */
jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn().mockResolvedValue(123),
    getClientIdFromUser: jest.fn().mockResolvedValue(456),
    getUtilisateurIdFromUser: jest.fn().mockResolvedValue(789),
    assertChauffeurAutorise: jest.fn().mockResolvedValue(123)
}));

/**
 * Mock des services
 */
jest.unstable_mockModule('../../src/services/formation.service.js', () => ({
    default: {
        getAll: jest.fn(),
        creer: jest.fn(),
        assigner: jest.fn(),
        completer: jest.fn(),
        getByChauffeur: jest.fn(),
        getChauffeursParFormation: jest.fn(),
        update: jest.fn(),
        disable: jest.fn()
    }
}));

/**
 * Mock du middleware d'authentification avec différents rôles
 */
jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
    authenticateJWT: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    },
    checkRole: (roles) => (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: roles[0] };
        next();
    },
    isAdmin: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'ADMIN_GENERAL' };
        next();
    },
    isPersonnel: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    }
}));

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    default: {
        utilisateur: {
            findUnique: jest.fn().mockResolvedValue({
                email: 'test@example.com',
                role: 'chauffeur',
                personnel: {
                    id_personnel: 10 // celui utilisé dans le test
                },
                client: null
            })
        }
    }
}));


let app, FormationService, AuthHelpers;

/**
 * Configuration de l'application Express avant chaque test
 */
beforeEach(async () => {
    jest.resetModules();

    const express = (await import('express')).default;

    const formationRoutes = (await import('../../src/routes/formationRoutes.js')).default;

    FormationService = (await import('../../src/services/formation.service.js')).default;
    AuthHelpers = await import('../../src/utils/auth.helpers.js');

    // Configurer l'application Express
    app = express();
    app.use(express.json());
    app.use('/api/formations', formationRoutes);
});

describe('Formation Routes', () => {
    /**
     * Vérifie que les formations peuvent être récupérées
     */
    it('GET /api/formations - devrait retourner toutes les formations', async () => {
        // Préparation du mock
        const mockFormations = [{ id: 1, titre: 'Formation 1' }, { id: 2, titre: 'Formation 2' }];
        FormationService.getAll.mockResolvedValue(mockFormations);

        // Exécution du test
        const response = await request(app)
            .get('/api/formations')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.getAll).toHaveBeenCalled();
        expect(response.body.data).toEqual(mockFormations);
    });

    /**
     * Vérifie qu'une formation peut être créée
     */
    it('POST /api/formations - devrait créer une formation', async () => {
        // Préparation du mock
        const formationData = { titre: 'Nouvelle formation', description: 'Description', date_expiration: '2026-01-01' };
        const mockFormation = { id: 42, ...formationData };
        FormationService.creer.mockResolvedValue(mockFormation);

        // Exécution du test
        const response = await request(app)
            .post('/api/formations')
            .send(formationData)
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(201);
        expect(FormationService.creer).toHaveBeenCalledWith(formationData);
        expect(response.body.data).toEqual(mockFormation);
    });

    /**
     * Vérifie qu'une formation peut être assignée à un chauffeur
     */
    it('POST /api/formations/:id/assigner/:chauffeurId - devrait assigner une formation à un chauffeur', async () => {
        // Préparation du mock
        const mockAssignation = { id_formation: 5, id_chauffeur: 10, date_assignation: '2025-05-20' };
        FormationService.assigner.mockResolvedValue(mockAssignation);

        // Exécution du test
        const response = await request(app)
            .post('/api/formations/5/assigner/10')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.assigner).toHaveBeenCalledWith(10, 5);
        expect(response.body.data).toEqual(mockAssignation);
    });

    /**
     * Vérifie qu'une formation peut être marquée comme complétée
     */
    it('PATCH /api/formations/:id/completer/:chauffeurId - devrait compléter une formation', async () => {
        // Préparation du mock
        const mockCompletion = { id_formation: 5, id_chauffeur: 10, date_completion: '2025-05-20' };
        FormationService.completer.mockResolvedValue(mockCompletion);

        // Exécution du test
        const response = await request(app)
            .patch('/api/formations/5/completer/10')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.completer).toHaveBeenCalledWith(10, 5);
        expect(response.body.data).toEqual(mockCompletion);
    });

    /**
     * Vérifie que les formations d'un chauffeur peuvent être récupérées
     */
    it('GET /api/formations/chauffeur/:id - devrait retourner les formations d\'un chauffeur', async () => {
        // Préparation du mock
        const mockFormations = [
            { id: 1, titre: 'Formation 1', date_completion: '2025-01-01' },
            { id: 2, titre: 'Formation 2', date_completion: null }
        ];
        FormationService.getByChauffeur.mockResolvedValue(mockFormations);

        // Exécution du test
        const response = await request(app)
            .get('/api/formations/chauffeur/10')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.getByChauffeur).toHaveBeenCalledWith(10);
        expect(response.body.data).toEqual(mockFormations);
    });

    /**
     * Vérifie que les chauffeurs assignés à une formation peuvent être récupérés
     */
    it('GET /api/formations/:id/chauffeurs - devrait retourner les chauffeurs assignés à une formation', async () => {
        // Préparation du mock
        const mockChauffeurs = [
            { id: 10, nom: 'Dupont', prenom: 'Jean', date_completion: '2025-01-01' },
            { id: 20, nom: 'Martin', prenom: 'Sophie', date_completion: null }
        ];
        FormationService.getChauffeursParFormation.mockResolvedValue(mockChauffeurs);

        // Exécution du test
        const response = await request(app)
            .get('/api/formations/5/chauffeurs')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.getChauffeursParFormation).toHaveBeenCalledWith(5);
        expect(response.body.data).toEqual(mockChauffeurs);
    });

    /**
     * Vérifie qu'une formation peut être mise à jour
     */
    it('PUT /api/formations/:id - devrait mettre à jour une formation', async () => {
        // Préparation du mock
        const updateData = { titre: 'Formation modifiée', description: 'Nouvelle description' };
        const mockUpdated = { id: 5, ...updateData };
        FormationService.update.mockResolvedValue(mockUpdated);

        // Exécution du test
        const response = await request(app)
            .put('/api/formations/5')
            .send(updateData)
            .set('Authorization', 'Bearer fake_token');


        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.update).toHaveBeenCalledWith(5, updateData);
        expect(response.body.data).toEqual(mockUpdated);
    });

    /**
     * Vérifie qu'une formation peut être désactivée
     */
    it('PATCH /api/formations/:id/desactiver - devrait désactiver une formation', async () => {
        // Préparation du mock
        const mockDisabled = { id: 5, titre: 'Formation 5', actif: false };
        FormationService.disable.mockResolvedValue(mockDisabled);

        // Exécution du test
        const response = await request(app)
            .patch('/api/formations/5/desactiver')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(FormationService.disable).toHaveBeenCalledWith(5);
        expect(response.body.data).toEqual(mockDisabled);
    });
});

