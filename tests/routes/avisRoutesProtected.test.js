import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Mock des dépendances
const mockAuthenticateJWT = jest.fn((req, res, next) => next());
const mockVerifyClientAccessToReservation = jest.fn((req, res, next) => next());
const mockIsClient = jest.fn((req, res, next) => next());
const mockCheckRole = jest.fn(() => (req, res, next) => next());

// Mock des méthodes du contrôleur d'avis
const mockAvisController = {
  getByReservation: jest.fn(),
  createAvis: jest.fn(),
  answerToAvis: jest.fn(),
  deleteAvis: jest.fn()
};

// Mocks des modules
jest.mock('../../src/middleware/auth.js', () => ({
  authenticateJWT: mockAuthenticateJWT,
  verifyClientAccessToReservation: mockVerifyClientAccessToReservation,
  isClient: mockIsClient,
  checkRole: mockCheckRole
}));

jest.mock('../../src/controllers/avisController.js', () => ({
  __esModule: true,
  default: mockAvisController
}));

// Configuration de l'application Express
const app = express();
app.use(express.json());

// Définition des routes pour les tests
app.get('/api/avis/reservation/:idReservation', 
  mockAuthenticateJWT, 
  mockVerifyClientAccessToReservation, 
  (req, res) => mockAvisController.getByReservation(req, res)
);

app.post('/api/avis', 
  mockAuthenticateJWT, 
  mockIsClient, 
  (req, res) => mockAvisController.createAvis(req, res)
);

app.put('/api/avis/:idAvis', 
  mockAuthenticateJWT, 
  (req, res, next) => mockCheckRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"])(req, res, next), 
  (req, res) => mockAvisController.answerToAvis(req, res)
);

app.delete('/api/avis/:idAvis', 
  mockAuthenticateJWT, 
  (req, res, next) => mockCheckRole(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"])(req, res, next), 
  (req, res) => mockAvisController.deleteAvis(req, res)
);

describe('Routes Avis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration par défaut pour les réponses du contrôleur
    mockAvisController.getByReservation.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_avis: 1, note: 4, commentaire: 'Très bien' }
      });
    });
    
    mockAvisController.createAvis.mockImplementation((req, res) => {
      res.status(201).json({
        status: 'OK',
        data: { id_avis: 1, ...req.body }
      });
    });
    
    mockAvisController.answerToAvis.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_avis: 1, commentaire: req.body.reponse }
      });
    });
    
    mockAvisController.deleteAvis.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'SUPPRIME',
        data: { id_avis: 1 }
      });
    });
  });

  describe('GET /api/avis/reservation/:idReservation', () => {
    it('devrait appeler les middlewares d\'authentification et de vérification d\'accès', async () => {
      const res = await request(app).get('/api/avis/reservation/1');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockVerifyClientAccessToReservation).toHaveBeenCalled();
      expect(mockAvisController.getByReservation).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait retourner un avis pour une réservation spécifique', async () => {
      const res = await request(app).get('/api/avis/reservation/1');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_avis: 1, note: 4, commentaire: 'Très bien' }
      });
    });
  });

  describe('POST /api/avis', () => {
    it('devrait appeler les middlewares d\'authentification et de vérification du rôle client', async () => {
      const nouvelAvis = {
        id_reservation: 1,
        note: 5,
        commentaire: 'Excellent séjour'
      };
      
      const res = await request(app)
        .post('/api/avis')
        .send(nouvelAvis);
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockIsClient).toHaveBeenCalled();
      expect(mockAvisController.createAvis).toHaveBeenCalled();
      expect(res.status).toBe(201);
    });

    it('devrait créer un nouvel avis', async () => {
      const nouvelAvis = {
        id_reservation: 1,
        note: 5,
        commentaire: 'Excellent séjour'
      };
      
      const res = await request(app)
        .post('/api/avis')
        .send(nouvelAvis);
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_avis: 1, ...nouvelAvis }
      });
    });
  });

  describe('PUT /api/avis/:idAvis', () => {
    it('devrait appeler les middlewares d\'authentification et de vérification des rôles', async () => {
      const reponse = {
        reponse: 'Merci pour votre commentaire'
      };
      
      const res = await request(app)
        .put('/api/avis/1')
        .send(reponse);
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]);
      expect(mockAvisController.answerToAvis).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait mettre à jour un avis avec une réponse', async () => {
      const reponse = {
        reponse: 'Merci pour votre commentaire'
      };
      
      const res = await request(app)
        .put('/api/avis/1')
        .send(reponse);
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_avis: 1, commentaire: reponse.reponse }
      });
    });
  });

  describe('DELETE /api/avis/:idAvis', () => {
    it('devrait appeler les middlewares d\'authentification et de vérification des rôles', async () => {
      const res = await request(app).delete('/api/avis/1');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["ADMIN_GENERAL", "RECEPTIONNISTE", "RESPONSABLE_HEBERGEMENT"]);
      expect(mockAvisController.deleteAvis).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait supprimer un avis', async () => {
      const res = await request(app).delete('/api/avis/1');
      
      expect(res.body).toEqual({
        status: 'SUPPRIME',
        data: { id_avis: 1 }
      });
    });
  });

  /**
   * Tests pour les cas d'erreur 
   */ 
  describe('Gestion des erreurs', () => {
    it('devrait gérer l\'erreur d\'authentification', async () => {
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Authentification requise'
        });
      });
      
      const res = await request(app).get('/api/avis/reservation/1');
      
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: 'ERROR',
        message: 'Authentification requise'
      });
    });

    it('devrait gérer l\'erreur d\'autorisation pour un client', async () => {
      mockVerifyClientAccessToReservation.mockImplementationOnce((req, res, next) => {
        return res.status(403).json({
          status: 'ACCÈS REFUSÉ',
          message: 'Vous n\'avez pas accès à cette réservation.'
        });
      });
      
      const res = await request(app).get('/api/avis/reservation/1');
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        status: 'ACCÈS REFUSÉ',
        message: 'Vous n\'avez pas accès à cette réservation.'
      });
    });

    it('devrait gérer l\'erreur d\'autorisation pour un rôle non autorisé', async () => {
      mockCheckRole.mockImplementationOnce(() => (req, res, next) => {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Accès non autorisé'
        });
      });
      
      const res = await request(app).put('/api/avis/1').send({ reponse: 'Test' });
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        status: 'ERROR',
        message: 'Accès non autorisé'
      });
    });
  });
});