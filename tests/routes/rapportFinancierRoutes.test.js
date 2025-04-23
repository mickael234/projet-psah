import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Créer des objets mock directement
const PaiementController = {
  generateRapportFinancier: jest.fn(),
  exportRapportFinancierToPDF: jest.fn(),
  getRevenuTotal: jest.fn()
};

const auth = {
  authenticateJWT: jest.fn((req, res, next) => next())
};

// Mock des modules avec les objets créés
jest.mock('../../src/middleware/auth.js', () => auth);
jest.mock('../../src/controllers/paiementController.js', () => PaiementController);

// Configuration de l'application Express
const app = express();
app.use(express.json());

// Définition des routes pour les tests
app.get('/api/paiements/financiers', 
  auth.authenticateJWT,
  (req, res) => PaiementController.generateRapportFinancier(req, res)
);

app.get('/api/paiements/financiers/export', 
  auth.authenticateJWT,
  (req, res) => PaiementController.exportRapportFinancierToPDF(req, res)
);

app.get('/api/paiements/revenus', 
  auth.authenticateJWT,
  (req, res) => PaiementController.getRevenuTotal(req, res)
);

describe('Routes de rapports financiers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Configuration par défaut pour les réponses du contrôleur
        PaiementController.generateRapportFinancier.mockImplementation((req, res) => {
          res.status(200).json({
            status: 'OK',
            data: [
              { id_paiement: 1, montant: 500, methode_paiement: 'carte' }
            ],
            totalMontant: 500
          });
        });
        
        PaiementController.exportRapportFinancierToPDF.mockImplementation((req, res) => {
          // Simuler l'envoi d'un fichier en réponse
          res.setHeader('Content-disposition', 'attachment; filename=rapport-financier.pdf');
          res.setHeader('Content-type', 'application/pdf');
          res.send('Mock PDF Content');
        });
        
        PaiementController.getRevenuTotal.mockImplementation((req, res) => {
          res.status(200).json({
            status: 'OK',
            data: {
              revenuTotal: 10000
            }
          });
        });
    })

  describe('GET /api/paiements/financiers', () => {
    /** 
     * Test: Vérifie l'appel au middleware d'authentification pour l'accès aux rapports financiers 
     */
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/paiements/financiers?debut=2023-01-01&fin=2023-12-31');
      
      expect(auth.authenticateJWT).toHaveBeenCalled();
      expect(PaiementController.generateRapportFinancier).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    /** 
     * Test: Vérifie que le rapport financier est correctement retourné pour la période spécifiée 
     */
    it('devrait retourner un rapport financier pour une période donnée', async () => {
      const res = await request(app).get('/api/paiements/financiers?debut=2023-01-01&fin=2023-12-31');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: [
          { id_paiement: 1, montant: 500, methode_paiement: 'carte' }
        ],
        totalMontant: 500
      });
    });
    
    /** 
     * Test: Vérifie que les paramètres de requête sont correctement transmis au contrôleur 
     */
    it('devrait transmettre les paramètres de requête au contrôleur', async () => {
      await request(app).get('/api/paiements/financiers?debut=2023-01-01&fin=2023-12-31');
      
      // Vérifier que les paramètres ont été transmis correctement au contrôleur
      const callArgs = PaiementController.generateRapportFinancier.mock.calls[0];
      const req = callArgs[0];
      expect(req.query.debut).toBe('2023-01-01');
      expect(req.query.fin).toBe('2023-12-31');
    });
  });

  describe('GET /api/paiements/financiers/export', () => {
    /** 
     * Test: Vérifie l'appel au middleware d'authentification pour l'export PDF 
     */
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/paiements/financiers/export?debut=2023-01-01&fin=2023-12-31');
      
      expect(auth.authenticateJWT).toHaveBeenCalled();
      expect(PaiementController.exportRapportFinancierToPDF).toHaveBeenCalled();
      expect(res.header['content-disposition']).toBe('attachment; filename=rapport-financier.pdf');
      expect(res.header['content-type']).toContain('application/pdf');
    });
    
    /** 
     * Test: Vérifie que les paramètres d'export sont correctement transmis au contrôleur
     */
    it('devrait transmettre les paramètres de requête au contrôleur', async () => {
      await request(app).get('/api/paiements/financiers/export?debut=2023-01-01&fin=2023-12-31');
      
      // Vérifier que les paramètres ont été transmis correctement au contrôleur
      const callArgs = PaiementController.exportRapportFinancierToPDF.mock.calls[0];
      const req = callArgs[0];
      expect(req.query.debut).toBe('2023-01-01');
      expect(req.query.fin).toBe('2023-12-31');
    });
  });

  describe('GET /api/paiements/revenus', () => {

    /** 
     * Test: Vérifie l'appel au middleware d'authentification pour l'accès aux revenus totaux 
     */

    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/paiements/revenus');
      
      expect(auth.authenticateJWT).toHaveBeenCalled();
      expect(PaiementController.getRevenuTotal).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    /** 
     * Test: Vérifie que les données de revenu total sont correctement retournées 
     */
    it('devrait retourner le revenu total', async () => {
      const res = await request(app).get('/api/paiements/revenus');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: {
          revenuTotal: 10000
        }
      });
    });
  });


  describe('Gestion des erreurs', () => {
    /** 
     * Test: Vérifie que l'erreur d'authentification est correctement gérée
     */
    it('devrait gérer l\'erreur d\'authentification', async () => {

      auth.authenticateJWT.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Authentification requise'
        });
      });
      
      const res = await request(app).get('/api/paiements/financiers');
      
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: 'ERROR',
        message: 'Authentification requise'
      });
    });

    /** 
     * Test: Vérifie que l'erreur de paramètres manquants est correctement gérée 
     */
    it('devrait gérer l\'erreur de paramètres manquants pour le rapport financier', async () => {

      PaiementController.generateRapportFinancier.mockImplementationOnce((req, res) => {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: 'Les dates pour déterminer la période sont requises.'
        });
      });
      
      const res = await request(app).get('/api/paiements/financiers');
      
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: 'MAUVAISE DEMANDE',
        message: 'Les dates pour déterminer la période sont requises.'
      });
    });

    /** 
     * Test: Vérifie que l'erreur de données non trouvées est correctement gérée
     */
    it('devrait gérer l\'erreur de données non trouvées pour le rapport financier', async () => {

      PaiementController.generateRapportFinancier.mockImplementationOnce((req, res) => {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: 'Aucune transaction n\'a été trouvée pour la période spécifiée'
        });
      });
      
      const res = await request(app).get('/api/paiements/financiers?debut=2023-01-01&fin=2023-12-31');
      
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: 'RESSOURCE NON TROUVEE',
        message: 'Aucune transaction n\'a été trouvée pour la période spécifiée'
      });
    });

    /** 
     * Test: Vérifie que l'erreur interne lors de la génération PDF est correctement gérée 
     */
    it('devrait gérer l\'erreur interne lors de la génération du PDF', async () => {

      PaiementController.exportRapportFinancierToPDF.mockImplementationOnce((req, res) => {
        return res.status(500).json({
          status: 'ERREUR INTERNE',
          message: 'Une erreur est survenue lors de la génération du rapport financier au format PDF.'
        });
      });
      
      const res = await request(app).get('/api/paiements/financiers/export?debut=2023-01-01&fin=2023-12-31');
      
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        status: 'ERREUR INTERNE',
        message: 'Une erreur est survenue lors de la génération du rapport financier au format PDF.'
        });
      });
    });
});