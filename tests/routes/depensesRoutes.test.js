import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Création des mocks pour les contrôleurs
const mockGetAll = jest.fn();
const mockGetFinancialDataByPeriod = jest.fn();
const mockGenerateFinancialReport = jest.fn();
const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockUpdateDescription = jest.fn();
const mockUpdatePrice = jest.fn();
const mockUpdateCategory = jest.fn();
const mockRestoreExpense = jest.fn();
const mockDeleteExpense = jest.fn();

// Mock des middleware d'authentification
const mockAuthenticateJWT = jest.fn();
const mockCheckRole = jest.fn();
const mockIsPersonnel = jest.fn();

// Mock des modules
jest.mock('../../src/controllers/depenseController.js', () => ({
  getAll: (...args) => mockGetAll(...args),
  getFinancialDataByPeriod: (...args) => mockGetFinancialDataByPeriod(...args),
  generateFinancialReport: (...args) => mockGenerateFinancialReport(...args),
  getById: (...args) => mockGetById(...args),
  create: (...args) => mockCreate(...args),
  updateDescription: (...args) => mockUpdateDescription(...args),
  updatePrice: (...args) => mockUpdatePrice(...args),
  updateCategory: (...args) => mockUpdateCategory(...args),
  restoreExpense: (...args) => mockRestoreExpense(...args),
  deleteExpense: (...args) => mockDeleteExpense(...args)
}), { virtual: true });

jest.mock('../../src/middleware/auth.js', () => ({
  authenticateJWT: (...args) => mockAuthenticateJWT(...args),
  checkRole: (roles) => jest.fn((...args) => mockCheckRole(roles, ...args)),
  isPersonnel: (...args) => mockIsPersonnel(...args)
}), { virtual: true });

// Application Express
const app = express();
app.use(express.json());

// Définition des routes directement
app.get('/api/depenses', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockGetAll(req, res)
);

app.get('/api/depenses/rapport', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockGetFinancialDataByPeriod(req, res)
);

app.get('/api/depenses/rapport/export', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockGenerateFinancialReport(req, res)
);

app.get('/api/depenses/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockGetById(req, res)
);

app.post('/api/depenses', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockCreate(req, res)
);

app.patch('/api/depenses/description/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockUpdateDescription(req, res)
);

app.patch('/api/depenses/prix/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockUpdatePrice(req, res)
);

app.patch('/api/depenses/categorie/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockUpdateCategory(req, res)
);

app.patch('/api/depenses/restaurer/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockRestoreExpense(req, res)
);

app.patch('/api/depenses/supprimer/:id', 
  (req, res, next) => mockAuthenticateJWT(req, res, next),
  (req, res, next) => mockCheckRole(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], req, res, next),
  (req, res) => mockDeleteExpense(req, res)
);

describe('Routes de gestion des dépenses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration par défaut des mocks
    mockAuthenticateJWT.mockImplementation((req, res, next) => next());
    mockCheckRole.mockImplementation((roles, req, res, next) => next());
    
    mockGetAll.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: [
          { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
        ]
      });
    });
    
    mockGetFinancialDataByPeriod.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: {
          depenses: [
            { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
          ],
          totalMontant: 150
        }
      });
    });
    
    mockGenerateFinancialReport.mockImplementation((req, res) => {
      res.setHeader('Content-disposition', 'attachment; filename=rapport-depenses.pdf');
      res.setHeader('Content-type', 'application/pdf');
      res.send('Mock PDF Content');
    });
    
    mockGetById.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
      });
    });
    
    mockCreate.mockImplementation((req, res) => {
      res.status(201).json({
        status: 'CREATED',
        data: { id_depense: 1, ...req.body }
      });
    });
    
    mockUpdateDescription.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_depense: 1, description: req.body.description }
      });
    });
    
    mockUpdatePrice.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_depense: 1, montant: req.body.montant }
      });
    });
    
    mockUpdateCategory.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: { id_depense: 1, categorie: req.body.categorie }
      });
    });
    
    mockRestoreExpense.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Dépense restaurée avec succès'
      });
    });
    
    mockDeleteExpense.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Dépense supprimée avec succès'
      });
    });
  });

  describe('GET /api/depenses', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/depenses');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockGetAll).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait retourner la liste des dépenses', async () => {
      const res = await request(app).get('/api/depenses');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: [
          { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
        ]
      });
    });
  });

  describe('GET /api/depenses/rapport', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/depenses/rapport?debut=2023-01-01&fin=2023-12-31');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockGetFinancialDataByPeriod).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait retourner des données financières pour une période donnée', async () => {
      const res = await request(app).get('/api/depenses/rapport?debut=2023-01-01&fin=2023-12-31');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: {
          depenses: [
            { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
          ],
          totalMontant: 150
        }
      });
    });
    
    it('devrait transmettre les paramètres de requête au contrôleur', async () => {
      await request(app).get('/api/depenses/rapport?debut=2023-01-01&fin=2023-12-31');
      
      const callArgs = mockGetFinancialDataByPeriod.mock.calls[0];
      const req = callArgs[0];
      expect(req.query.debut).toBe('2023-01-01');
      expect(req.query.fin).toBe('2023-12-31');
    });
  });

  describe('GET /api/depenses/rapport/export', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/depenses/rapport/export?debut=2023-01-01&fin=2023-12-31');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockGenerateFinancialReport).toHaveBeenCalled();
      expect(res.header['content-disposition']).toBe('attachment; filename=rapport-depenses.pdf');
      expect(res.header['content-type']).toContain('application/pdf');
    });
    
    it('devrait transmettre les paramètres de requête au contrôleur', async () => {
      await request(app).get('/api/depenses/rapport/export?debut=2023-01-01&fin=2023-12-31');
      
      const callArgs = mockGenerateFinancialReport.mock.calls[0];
      const req = callArgs[0];
      expect(req.query.debut).toBe('2023-01-01');
      expect(req.query.fin).toBe('2023-12-31');
    });
  });

  describe('GET /api/depenses/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).get('/api/depenses/1');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockGetById).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait retourner la dépense demandée', async () => {
      const res = await request(app).get('/api/depenses/1');
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_depense: 1, description: 'Achat fournitures', montant: 150, categorie: 'fournitures' }
      });
    });
    
    it('devrait transmettre l\'ID au contrôleur', async () => {
      await request(app).get('/api/depenses/1');
      
      const callArgs = mockGetById.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
    });
  });

  describe('POST /api/depenses', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const depenseData = {
        description: 'Nouvelle dépense',
        montant: 200,
        categorie: 'maintenance'
      };
      
      const res = await request(app)
        .post('/api/depenses')
        .send(depenseData);
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockCreate).toHaveBeenCalled();
      expect(res.status).toBe(201);
    });

    it('devrait créer une nouvelle dépense', async () => {
      const depenseData = {
        description: 'Nouvelle dépense',
        montant: 200,
        categorie: 'maintenance'
      };
      
      const res = await request(app)
        .post('/api/depenses')
        .send(depenseData);
      
      expect(res.body).toEqual({
        status: 'CREATED',
        data: { id_depense: 1, ...depenseData }
      });
    });
    
    it('devrait transmettre les données au contrôleur', async () => {
      const depenseData = {
        description: 'Nouvelle dépense',
        montant: 200,
        categorie: 'maintenance'
      };
      
      await request(app)
        .post('/api/depenses')
        .send(depenseData);
      
      const callArgs = mockCreate.mock.calls[0];
      const req = callArgs[0];
      expect(req.body).toEqual(depenseData);
    });
  });

  describe('PATCH /api/depenses/description/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app)
        .patch('/api/depenses/description/1')
        .send({ description: 'Description mise à jour' });
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockUpdateDescription).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait mettre à jour la description de la dépense', async () => {
      const res = await request(app)
        .patch('/api/depenses/description/1')
        .send({ description: 'Description mise à jour' });
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_depense: 1, description: 'Description mise à jour' }
      });
    });
    
    it('devrait transmettre l\'ID et la nouvelle description au contrôleur', async () => {
      await request(app)
        .patch('/api/depenses/description/1')
        .send({ description: 'Description mise à jour' });
      
      const callArgs = mockUpdateDescription.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
      expect(req.body.description).toBe('Description mise à jour');
    });
  });

  describe('PATCH /api/depenses/prix/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app)
        .patch('/api/depenses/prix/1')
        .send({ montant: 300 });
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockUpdatePrice).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait mettre à jour le montant de la dépense', async () => {
      const res = await request(app)
        .patch('/api/depenses/prix/1')
        .send({ montant: 300 });
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_depense: 1, montant: 300 }
      });
    });
    
    it('devrait transmettre l\'ID et le nouveau montant au contrôleur', async () => {
      await request(app)
        .patch('/api/depenses/prix/1')
        .send({ montant: 300 });
      
      const callArgs = mockUpdatePrice.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
      expect(req.body.montant).toBe(300);
    });
  });

  describe('PATCH /api/depenses/categorie/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app)
        .patch('/api/depenses/categorie/1')
        .send({ categorie: 'entretien' });
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockUpdateCategory).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait mettre à jour la catégorie de la dépense', async () => {
      const res = await request(app)
        .patch('/api/depenses/categorie/1')
        .send({ categorie: 'entretien' });
      
      expect(res.body).toEqual({
        status: 'OK',
        data: { id_depense: 1, categorie: 'entretien' }
      });
    });
    
    it('devrait transmettre l\'ID et la nouvelle catégorie au contrôleur', async () => {
      await request(app)
        .patch('/api/depenses/categorie/1')
        .send({ categorie: 'entretien' });
      
      const callArgs = mockUpdateCategory.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
      expect(req.body.categorie).toBe('entretien');
    });
  });

  describe('PATCH /api/depenses/restaurer/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).patch('/api/depenses/restaurer/1');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockRestoreExpense).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait restaurer une dépense supprimée', async () => {
      const res = await request(app).patch('/api/depenses/restaurer/1');
      
      expect(res.body).toEqual({
        status: 'OK',
        message: 'Dépense restaurée avec succès'
      });
    });
    
    it('devrait transmettre l\'ID au contrôleur', async () => {
      await request(app).patch('/api/depenses/restaurer/1');
      
      const callArgs = mockRestoreExpense.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
    });
  });

  describe('PATCH /api/depenses/supprimer/:id', () => {
    it('devrait appeler le middleware d\'authentification', async () => {
      const res = await request(app).patch('/api/depenses/supprimer/1');
      
      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockCheckRole).toHaveBeenCalledWith(["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"], 
        expect.any(Object), expect.any(Object), expect.any(Function));
      expect(mockDeleteExpense).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('devrait supprimer une dépense', async () => {
      const res = await request(app).patch('/api/depenses/supprimer/1');
      
      expect(res.body).toEqual({
        status: 'OK',
        message: 'Dépense supprimée avec succès'
      });
    });
    
    it('devrait transmettre l\'ID au contrôleur', async () => {
      await request(app).patch('/api/depenses/supprimer/1');
      
      const callArgs = mockDeleteExpense.mock.calls[0];
      const req = callArgs[0];
      expect(req.params.id).toBe('1');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer l\'erreur d\'authentification', async () => {
      // Modification temporaire pour simuler une erreur d'authentification
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Authentification requise'
        });
      });
      
      const res = await request(app).get('/api/depenses');
      
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: 'ERROR',
        message: 'Authentification requise'
      });
    });

    it('devrait gérer l\'erreur de rôle non autorisé', async () => {
      // Authentification réussie mais checkRole échoue
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => next());
      mockCheckRole.mockImplementationOnce((roles, req, res, next) => {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Accès non autorisé'
        });
      });
      
      const res = await request(app).get('/api/depenses');
      
      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        status: 'ERROR',
        message: 'Accès non autorisé'
      });
    });

    it('devrait gérer l\'erreur de ressource non trouvée', async () => {
      // Permettre l'authentification et le contrôle de rôle d'abord
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => next());
      mockCheckRole.mockImplementationOnce((roles, req, res, next) => next());
      
      mockGetById.mockImplementationOnce((req, res) => {
        return res.status(404).json({
          status: 'NOT FOUND',
          message: 'Dépense non trouvée'
        });
      });
      
      const res = await request(app).get('/api/depenses/999');
      
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        status: 'NOT FOUND',
        message: 'Dépense non trouvée'
      });
    });

    it('devrait gérer l\'erreur de validation des données', async () => {
      // Permettre l'authentification et le contrôle de rôle d'abord
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => next());
      mockCheckRole.mockImplementationOnce((roles, req, res, next) => next());
      
      mockCreate.mockImplementationOnce((req, res) => {
        return res.status(400).json({
          status: 'BAD REQUEST',
          message: 'Les champs description, montant et categorie sont requis'
        });
      });
      
      const res = await request(app)
        .post('/api/depenses')
        .send({ description: 'Test' }); // Données incomplètes
      
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: 'BAD REQUEST',
        message: 'Les champs description, montant et categorie sont requis'
      });
    });

    it('devrait gérer l\'erreur interne', async () => {
      // Permettre l'authentification et le contrôle de rôle d'abord
      mockAuthenticateJWT.mockImplementationOnce((req, res, next) => next());
      mockCheckRole.mockImplementationOnce((roles, req, res, next) => next());
      
      mockGetAll.mockImplementationOnce((req, res) => {
        return res.status(500).json({
          status: 'INTERNAL SERVER ERROR',
          message: 'Une erreur interne est survenue lors de la récupération des dépenses'
        });
      });
      
      const res = await request(app).get('/api/depenses');
      
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        status: 'INTERNAL SERVER ERROR',
        message: 'Une erreur interne est survenue lors de la récupération des dépenses'
      });
    });
  });
});