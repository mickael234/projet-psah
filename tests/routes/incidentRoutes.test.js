import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

/**
 * Mock des fonctions utilitaires d'authentification
 */
jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn().mockResolvedValue(123),
    getClientIdFromUser: jest.fn().mockResolvedValue(456),
    getUtilisateurIdFromUser: jest.fn().mockResolvedValue(789)
}));

/**
 * Mock complet du service Incident
 */
jest.unstable_mockModule('../../src/services/incident.service.js', () => ({
    default: {
        signalerIncident: jest.fn(),
        getByTrajetId: jest.fn(),
        getAllIncidents: jest.fn(),
        traiterIncident: jest.fn()
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
    isClient: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'CLIENT' };
        next();
    },
    isPersonnel: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'CHAUFFEUR' };
        next();
    },
    isAdmin: (req, res, next) => {
        req.utilisateur = { email: 'test@example.com', role: 'ADMIN_GENERAL' };
        next();
    }
}));

let app, IncidentService, AuthHelpers;

/**
 * Configuration de l'application Express avant chaque test
 */
beforeEach(async () => {
    jest.resetModules();

    const express = (await import('express')).default;

    // Import des routes d'incidents
    const incidentRoutes = (await import('../../src/routes/incidentRoutes.js')).default;

    IncidentService = (await import('../../src/services/incident.service.js')).default;
    AuthHelpers = await import('../../src/utils/auth.helpers.js');

    // Configurer l'application Express
    app = express();
    app.use(express.json());
    app.use('/api/incidents', incidentRoutes);
});

describe('Incident Routes', () => {
    /**
     * Vérifie qu'un utilisateur peut signaler un incident
     */
    it('POST /api/incidents - devrait signaler un incident', async () => {
        // Préparation du mock
        const incidentData = {
            id_trajet: 42,
            type: 'retard',
            description: 'Le chauffeur a 30 minutes de retard',
            gravite: 'moyenne'
        };
        const mockIncident = { 
            id_incident: 1, 
            ...incidentData,
            id_utilisateur: 789,
            est_traite: false, 
            date_creation: new Date().toISOString() 
        };
        IncidentService.signalerIncident.mockResolvedValue(mockIncident);

        // Exécution du test
        const response = await request(app)
            .post('/api/incidents')
            .send(incidentData)
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(201);
        expect(AuthHelpers.getUtilisateurIdFromUser).toHaveBeenCalledWith('test@example.com');
        expect(IncidentService.signalerIncident).toHaveBeenCalledWith({
            ...incidentData,
            id_utilisateur: 789
        });
        expect(response.body.data).toEqual(mockIncident);
    });

    /**
     * Vérifie qu'un membre du personnel peut récupérer les incidents d'un trajet
     */
    it('GET /api/incidents/trajet/:id - devrait retourner les incidents d\'un trajet', async () => {
        // Préparation du mock
        const mockIncidents = [
            {
                id_incident: 1,
                id_trajet: 5,
                type: 'retard',
                description: 'Retard important',
                est_traite: false
            },
            {
                id_incident: 2,
                id_trajet: 5,
                type: 'technique',
                description: 'Problème moteur',
                est_traite: true
            }
        ];
        IncidentService.getByTrajetId.mockResolvedValue(mockIncidents);

        // Exécution du test
        const response = await request(app)
            .get('/api/incidents/trajet/5')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(IncidentService.getByTrajetId).toHaveBeenCalledWith(5);
        expect(response.body.data).toEqual(mockIncidents);
    });

    /**
     * Vérifie qu'un administrateur peut récupérer tous les incidents
     */
    it('GET /api/incidents - devrait retourner tous les incidents', async () => {
        // Préparation du mock
        const mockIncidents = [
            {
                id_incident: 1,
                id_trajet: 5,
                type: 'retard',
                description: 'Retard important',
                est_traite: false
            },
            {
                id_incident: 2,
                id_trajet: 8,
                type: 'technique',
                description: 'Problème moteur',
                est_traite: true
            }
        ];
        IncidentService.getAllIncidents.mockResolvedValue(mockIncidents);

        // Exécution du test
        const response = await request(app)
            .get('/api/incidents')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(IncidentService.getAllIncidents).toHaveBeenCalled();
        expect(response.body.data).toEqual(mockIncidents);
    });

    /**
     * Vérifie qu'un administrateur peut marquer un incident comme traité
     */
    it('PATCH /api/incidents/:id/traite - devrait marquer un incident comme traité', async () => {
        // Préparation du mock
        const mockIncidentTraite = {
            id_incident: 3,
            id_trajet: 10,
            type: 'comportement',
            description: 'Plainte client',
            est_traite: true,
            date_traitement: new Date().toISOString()
        };
        IncidentService.traiterIncident.mockResolvedValue(mockIncidentTraite);

        // Exécution du test
        const response = await request(app)
            .patch('/api/incidents/3/traite')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(IncidentService.traiterIncident).toHaveBeenCalledWith(3);
        expect(response.body.data).toEqual(mockIncidentTraite);
    });
});