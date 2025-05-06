import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Créer des objets mock directement
const PaiementController = {
  getPaiementsByReservation: jest.fn(),
  getPaiementsEnRetard: jest.fn(),
  getPaiementById: jest.fn(),
  createPaiement: jest.fn(),
  updatePaiement: jest.fn(),
  refundPaiement: jest.fn(),
  updatePaiementStatus: jest.fn()
};

const auth = {
  authenticateJWT: jest.fn((_, __, next) => next()) // Simule un middleware d'authentification qui passe directement à la prochaine fonction
};

// Mock des modules avec les objets créés
jest.mock('../../src/middleware/auth.js', () => auth);
jest.mock('../../src/controllers/paiementController.js', () => PaiementController);

// Configuration de l'application Express
const app = express();
app.use(express.json());

// Définir les routes pour les tests
app.get('/api/paiements/reservation/:id', auth.authenticateJWT, (req, res) => PaiementController.getPaiementsByReservation(req, res));
app.get('/api/paiements/en-retard', auth.authenticateJWT, (req, res) => PaiementController.getPaiementsEnRetard(req, res));
app.get('/api/paiements/:id', auth.authenticateJWT, (req, res) => PaiementController.getPaiementById(req, res));
app.post('/api/paiements', auth.authenticateJWT, (req, res) => PaiementController.createPaiement(req, res));
app.put('/api/paiements/:id', auth.authenticateJWT, (req, res) => PaiementController.updatePaiement(req, res));
app.post('/api/paiements/:id/refund', auth.authenticateJWT, (req, res) => PaiementController.refundPaiement(req, res));
app.patch('/api/paiements/:id/status', auth.authenticateJWT, (req, res) => PaiementController.updatePaiementStatus(req, res));

// Fermeture du serveur après tous les tests
let server;
beforeAll(() => {
  server = app.listen(4000); // Lance le serveur sur un port spécifié
});

afterAll((done) => {
  server.close(done); // Ferme le serveur après les tests
});

// Tests
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
      expect(PaiementController.getPaiementsByReservation).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
    });
  });

  describe('GET /api/paiements/en-retard', () => {
    it('devrait appeler la méthode getPaiementsEnRetard du contrôleur', async () => {
      const response = await request(app)
        .get('/api/paiements/en-retard')
        .expect(200);

      expect(response.body.message).toBe('getPaiementsEnRetard appelé');
      expect(PaiementController.getPaiementsEnRetard).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
    });
  });

  describe('GET /api/paiements/:id', () => {
    it('devrait appeler la méthode getPaiementById du contrôleur', async () => {
      const response = await request(app)
        .get('/api/paiements/1')
        .expect(200);

      expect(response.body.message).toBe('getPaiementById appelé');
      expect(response.body.id).toBe('1');
      expect(PaiementController.getPaiementById).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
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
      expect(PaiementController.createPaiement).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
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
      expect(PaiementController.updatePaiement).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
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
      expect(PaiementController.refundPaiement).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
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
      expect(PaiementController.updatePaiementStatus).toHaveBeenCalledTimes(1);
      expect(auth.authenticateJWT).toHaveBeenCalled();
    });
  });

  describe('Middleware d\'authentification', () => {
    it('devrait bloquer l\'accès si l\'authentification échoue', async () => {
      // Restaurer temporairement le mock pour simuler un échec d'authentification
      auth.authenticateJWT.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Non autorisé' });
      });

      const response = await request(app)
        .get('/api/paiements/1')
        .expect(401);

      expect(response.body.message).toBe('Non autorisé');
      // La méthode du contrôleur ne devrait jamais être appelée
      expect(PaiementController.getPaiementById).not.toHaveBeenCalled();
    });
  });
});
