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
jest.unstable_mockModule('../../src/services/documentChauffeur.service.js', () => ({
    default: {
        upload: jest.fn(),
        valider: jest.fn(),
        getChauffeursAvecPermisExpire: jest.fn()
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

let app, DocumentChauffeurService, AuthHelpers;

/**
 * Configuration de l'application Express avant chaque test
 */
beforeEach(async () => {
    jest.resetModules();

    const express = (await import('express')).default;

    const documentRoutes = (await import('../../src/routes/documentChauffeurRoutes.js')).default;

    DocumentChauffeurService = (await import('../../src/services/documentChauffeur.service.js')).default;
    AuthHelpers = await import('../../src/utils/auth.helpers.js');

    // Configurer l'application Express
    app = express();
    app.use(express.json());

    app.use('/api/documents', documentRoutes);
});

describe('Document Chauffeur Routes', () => {
    /**
     * Vérifie que les documents peuvent être téléversés
     */
    it('POST /api/documents - devrait téléverser des documents', async () => {
        // Préparation du mock
        const documentsData = {
            permis: { url: 'url/permis.pdf', date_expiration: '2026-05-20' },
            carte_professionnelle: { url: 'url/carte.pdf', date_expiration: '2027-01-15' }
        };
        const mockDocuments = { id_personnel: 123, ...documentsData };
        DocumentChauffeurService.upload.mockResolvedValue(mockDocuments);

        // Exécution du test
        const response = await request(app)
            .post('/api/documents')
            .send(documentsData)
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(AuthHelpers.getPersonnelIdFromUser).toHaveBeenCalledWith('test@example.com');
        expect(DocumentChauffeurService.upload).toHaveBeenCalledWith(123, documentsData);
        expect(response.body.data).toEqual(mockDocuments);
    });

    /**
     * Vérifie que les documents peuvent être validés
     */
    it('PATCH /api/documents/:id/valider - devrait valider les documents d\'un chauffeur', async () => {
        // Préparation du mock
        const mockValidation = { id_personnel: 10, documents_valides: true };
        DocumentChauffeurService.valider.mockResolvedValue(mockValidation);

        // Exécution du test
        const response = await request(app)
            .patch('/api/documents/10/valider')
            .send({ isValid: true })
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(DocumentChauffeurService.valider).toHaveBeenCalledWith(10, true);
        expect(response.body.data).toEqual(mockValidation);
    });

    /**
     * Vérifie que les chauffeurs avec permis expiré peuvent être récupérés
     */
    it('GET /api/documents/permis-expire - devrait retourner les chauffeurs avec permis expiré', async () => {
        // Préparation du mock
        const mockChauffeurs = [
            { id: 10, nom: 'Dupont', prenom: 'Jean', date_expiration_permis: '2025-01-01' },
            { id: 20, nom: 'Martin', prenom: 'Sophie', date_expiration_permis: '2025-02-15' }
        ];
        
        DocumentChauffeurService.getChauffeursAvecPermisExpire.mockResolvedValue(mockChauffeurs);

        // Exécution du test
        const response = await request(app)
            .get('/api/documents/permis-expire')
            .set('Authorization', 'Bearer fake_token');

        // Vérifications
        expect(response.status).toBe(200);
        expect(DocumentChauffeurService.getChauffeursAvecPermisExpire).toHaveBeenCalled();
        expect(response.body.data).toEqual(mockChauffeurs);
    });
});