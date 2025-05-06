import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Créer des objets mock pour les composants
const mockPaiementController = {
  getPaiementsByReservation: jest.fn((req, res) => {
    res.status(200).json({
      message: 'getPaiementsByReservation appelé',
      id: req.params.id
    });
  }),
  getPaiementsEnRetard: jest.fn((req, res) => {
    res.status(200).json({
      message: 'getPaiementsEnRetard appelé'
    });
  }),
  getPaiementById: jest.fn((req, res) => {
    res.status(200).json({
      message: 'getPaiementById appelé',
      id: req.params.id
    });
  }),
  createPaiement: jest.fn((req, res) => {
    res.status(201).json({
      message: 'createPaiement appelé',
      body: req.body
    });
  }),
  updatePaiement: jest.fn((req, res) => {
    res.status(200).json({
      message: 'updatePaiement appelé',
      id: req.params.id,
      body: req.body
    });
  }),
  refundPaiement: jest.fn((req, res) => {
    res.status(200).json({
      message: 'refundPaiement appelé',
      id: req.params.id,
      body: req.body
    });
  }),
  updatePaiementStatus: jest.fn((req, res) => {
    res.status(200).json({
      message: 'updatePaiementStatus appelé',
      id: req.params.id,
      body: req.body
    });
  }),
  generateRapportFinancier: jest.fn((req, res) => {
    res.status(200).json({
      message: 'generateRapportFinancier appelé',
      query: req.query
    });
  }),
  exportRapportFinancierToPDF: jest.fn((req, res) => {
    res.status(200).json({
      message: 'exportRapportFinancierToPDF appelé',
      query: req.query
    });
  }),
  getRevenuTotal: jest.fn((req, res) => {
    res.status(200).json({
      message: 'getRevenuTotal appelé'
    });
  }),
  envoyerNotificationPaiementsEnRetard: jest.fn((req, res) => {
    res.status(200).json({
      message: 'envoyerNotificationPaiementsEnRetard appelé',
      body: req.body
    });
  })
};

// Mock du middleware d'authentification
const mockAuthenticateJWT = jest.fn((req, res, next) => {
  req.user = { userId: 1, roles: ['ADMIN_GENERAL'] };
  next();
});

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());

// Configuration des routes à tester
app.get('/api/paiements/reservation/:id', mockAuthenticateJWT, mockPaiementController.getPaiementsByReservation);
app.get('/api/paiements/en-retard', mockAuthenticateJWT, mockPaiementController.getPaiementsEnRetard);
app.get('/api/paiements/:id', mockAuthenticateJWT, mockPaiementController.getPaiementById);
app.post('/api/paiements', mockAuthenticateJWT, mockPaiementController.createPaiement);
app.put('/api/paiements/:id', mockAuthenticateJWT, mockPaiementController.updatePaiement);
app.post('/api/paiements/:id/refund', mockAuthenticateJWT, mockPaiementController.refundPaiement);
app.patch('/api/paiements/:id/status', mockAuthenticateJWT, mockPaiementController.updatePaiementStatus);


describe('Routes de paiement', () => {
  // Réinitialiser les mocks après chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/paiements/reservation/:id', () => {
    it('devrait appeler la méthode getPaiementsByReservation du contrôleur', async () => {
      const response = await request(app)
        .get('/api/paiements/reservation/5')
        .expect(200);

      expect(response.body.message).toBe('getPaiementsByReservation appelé');
      expect(response.body.id).toBe('5');
      expect(mockPaiementController.getPaiementsByReservation).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('GET /api/paiements/en-retard', () => {
    it('devrait appeler la méthode getPaiementsEnRetard du contrôleur', async () => {
      const response = await request(app)
        .get('/api/paiements/en-retard')
        .expect(200);

      expect(response.body.message).toBe('getPaiementsEnRetard appelé');
      expect(mockPaiementController.getPaiementsEnRetard).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('GET /api/paiements/:id', () => {
    it('devrait appeler la méthode getPaiementById du contrôleur', async () => {
      const response = await request(app)
        .get('/api/paiements/1')
        .expect(200);

      expect(response.body.message).toBe('getPaiementById appelé');
      expect(response.body.id).toBe('1');
      expect(mockPaiementController.getPaiementById).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('POST /api/paiements', () => {
    it('devrait appeler la méthode createPaiement du contrôleur', async () => {
      const paiementData = {
        id_reservation: 5,
        montant: 100,
        methode_paiement: 'carte'
      };

      const response = await request(app)
        .post('/api/paiements')
        .send(paiementData)
        .expect(201);

      expect(response.body.message).toBe('createPaiement appelé');
      expect(response.body.body).toEqual(paiementData);
      expect(mockPaiementController.createPaiement).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('PUT /api/paiements/:id', () => {
    it('devrait appeler la méthode updatePaiement du contrôleur', async () => {
      const updateData = {
        etat: 'complete'
      };

      const response = await request(app)
        .put('/api/paiements/1')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('updatePaiement appelé');
      expect(response.body.id).toBe('1');
      expect(response.body.body).toEqual(updateData);
      expect(mockPaiementController.updatePaiement).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('POST /api/paiements/:id/refund', () => {
    it('devrait appeler la méthode refundPaiement du contrôleur', async () => {
      const refundData = {
        raison: 'Annulation client'
      };

      const response = await request(app)
        .post('/api/paiements/1/refund')
        .send(refundData)
        .expect(200);

      expect(response.body.message).toBe('refundPaiement appelé');
      expect(response.body.id).toBe('1');
      expect(response.body.body).toEqual(refundData);
      expect(mockPaiementController.refundPaiement).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/paiements/:id/status', () => {
    it('devrait appeler la méthode updatePaiementStatus du contrôleur', async () => {
      const statusData = {
        etat: 'complete'
      };

      const response = await request(app)
        .patch('/api/paiements/1/status')
        .send(statusData)
        .expect(200);

      expect(response.body.message).toBe('updatePaiementStatus appelé');
      expect(response.body.id).toBe('1');
      expect(response.body.body).toEqual(statusData);
      expect(mockPaiementController.updatePaiementStatus).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateJWT).toHaveBeenCalled();
    });
  });

  describe('Middleware d\'authentification', () => {
    it('devrait bloquer l\'accès si l\'authentification échoue', async () => {
      // Restaurer temporairement le mock pour simuler un échec d'authentification
      const originalImplementation = mockAuthenticateJWT.getMockImplementation();
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Non autorisé' });
      });

      const response = await request(app)
        .get('/api/paiements/1')
        .expect(401);

      expect(response.body.message).toBe('Non autorisé');
      expect(mockPaiementController.getPaiementById).not.toHaveBeenCalled();

      // Restaurer l'implémentation originale pour les autres tests
      mockAuthenticateJWT.mockImplementation(originalImplementation);
    });
  });
});