// depenseController.test.js
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import DepenseController from '../../src/controllers/depenseController.js';
import DepenseModel from '../../src/models/depense.model.js';
import DepenseService from '../../src/services/depenseService.js';
import ValidationService from '../../src/services/validationService.js';

describe('DepenseController', () => {
    let req;
    let res;

    beforeEach(() => {
        // Spy sur les méthodes du modèle
        jest.spyOn(DepenseModel, 'findById').mockResolvedValue(null);
        jest.spyOn(DepenseModel, 'findAll').mockResolvedValue([]);
        jest.spyOn(DepenseModel, 'countAll').mockResolvedValue(0);
        jest.spyOn(DepenseModel, 'findByPeriod').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'create').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'updateDescription').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'updatePrice').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'updateCategory').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'restore').mockResolvedValue({});
        jest.spyOn(DepenseModel, 'softDelete').mockResolvedValue({});

        // Spy sur les méthodes des services
        jest.spyOn(DepenseService, 'generateFinancialReport').mockResolvedValue({});
        jest.spyOn(ValidationService, 'validateDatePeriod').mockReturnValue({
            error: false,
            dateDebutObj: new Date('2023-01-01'),
            dateFinObj: new Date('2023-12-31')
        });
        jest.spyOn(ValidationService, 'formatPeriode').mockReturnValue('Janvier - Décembre 2023');
        
        // Spy sur console.error pour éviter de polluer la sortie de test
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Setup des objets req et res
        res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        
        req = {
            params: {},
            query: {},
            body: {}
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('devrait retourner une erreur 400 si l\'ID est invalide', async () => {
            req.params.id = 'invalid';
            
            await DepenseController.getById(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "L'ID d de la dépense est invalide."
            });
            expect(DepenseModel.findById).not.toHaveBeenCalled();
        });
        
        it('devrait retourner une erreur 404 si la dépense n\'existe pas', async () => {
            req.params.id = '123';
            DepenseModel.findById.mockResolvedValue(null);
            
            await DepenseController.getById(req, res);
            
            expect(DepenseModel.findById).toHaveBeenCalledWith(123);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucune dépense avec cet ID n'a été trouvée."
            });
        });
        
        it('devrait retourner la dépense si elle existe', async () => {
            req.params.id = '123';
            const mockDepense = { id_depense: 123, montant: 100 };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            await DepenseController.getById(req, res);
            
            expect(DepenseModel.findById).toHaveBeenCalledWith(123);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockDepense
            });
        });
        
        it('devrait gérer les erreurs inattendues', async () => {
            req.params.id = '123';
            const mockError = new Error('Test error');
            DepenseModel.findById.mockRejectedValue(mockError);
            
            await DepenseController.getById(req, res);
            
            expect(console.error).toHaveBeenCalledWith(mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERREUR SERVEUR',
                message: 'Erreur lors de la récuperation de la dépense.'
            });
        });
    });

    describe('getAll', () => {
        it('devrait retourner une erreur 400 si le numéro de page est invalide', async () => {
            req.query.page = '-1';
            
            await DepenseController.getAll(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "Le numéro de page est invalide. Il doit être un nombre positif."
            });
        });
        
        it('devrait retourner une erreur 400 si la limite est invalide', async () => {
            req.query.page = '1';
            req.query.limit = '0';
            
            await DepenseController.getAll(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "La limite est invalide. Elle doit être un nombre entre 1 et 100."
            });
        });
        
        it('devrait retourner une erreur 404 si aucune dépense n\'est trouvée', async () => {
            req.query.page = '1';
            req.query.limit = '10';
            DepenseModel.findAll.mockResolvedValue([]);
            
            await DepenseController.getAll(req, res);
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucune dépense avec les filtres n'a été trouvée."
            });
        });
        
        it('devrait appliquer correctement les filtres', async () => {
            req.query = {
                page: '2',
                limit: '15',
                categorie: 'Alimentation',
                utilisateurId: '42',
                dateMin: '2023-01-01',
                dateMax: '2023-12-31',
                sortBy: 'montant',
                sortOrder: 'desc'
            };
            
            const mockDepenses = [{ id_depense: 1, montant: 100 }];
            DepenseModel.findAll.mockResolvedValue(mockDepenses);
            DepenseModel.countAll.mockResolvedValue(30);
            
            await DepenseController.getAll(req, res);
            
            expect(DepenseModel.findAll).toHaveBeenCalledWith(
                {
                    categorie: 'Alimentation',
                    utilisateurId: '42',
                    dateMin: '2023-01-01',
                    dateMax: '2023-12-31',
                    sortBy: 'montant',
                    sortOrder: 'desc'
                },
                2,
                15
            );
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                pagination: {
                    page: 2,
                    limit: 15,
                    totalItems: 30,
                    appliedFilters: {
                        categorie: 'Alimentation',
                        utilisateurId: '42',
                        dateMin: '2023-01-01',
                        dateMax: '2023-12-31',
                        sortBy: 'montant',
                        sortOrder: 'desc'
                    }
                },
                data: mockDepenses
            });
        });
    });

    describe('getFinancialDataByPeriod', () => {
        it('devrait retourner une erreur 400 si la validation des dates échoue', async () => {
            const validationError = { error: true, message: 'Dates invalides' };
            ValidationService.validateDatePeriod.mockReturnValue(validationError);
            
            await DepenseController.getFinancialDataByPeriod(req, res);
            
            expect(ValidationService.validateDatePeriod).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: 'Dates invalides'
            });
        });
        
        it('devrait retourner une erreur 404 si aucune transaction n\'est trouvée', async () => {
            const validationSuccess = {
                error: false,
                dateDebutObj: new Date('2023-01-01'),
                dateFinObj: new Date('2023-12-31')
            };
            ValidationService.validateDatePeriod.mockReturnValue(validationSuccess);
            
            const emptyResult = {
                resume: { totalRevenus: 0, totalDepenses: 0 },
                details: { paiements: [], depenses: [] }
            };
            DepenseModel.findByPeriod.mockResolvedValue(emptyResult);
            
            await DepenseController.getFinancialDataByPeriod(req, res);
            
            expect(DepenseModel.findByPeriod).toHaveBeenCalledWith(
                validationSuccess.dateDebutObj,
                validationSuccess.dateFinObj
            );
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucune transaction n'a été trouvée pendant cette période."
            });
        });
        
        it('devrait retourner les données financières trouvées', async () => {
            const validationSuccess = {
                error: false,
                dateDebutObj: new Date('2023-01-01'),
                dateFinObj: new Date('2023-12-31')
            };
            ValidationService.validateDatePeriod.mockReturnValue(validationSuccess);
            
            const mockResult = {
                resume: { totalRevenus: 1000, totalDepenses: 500 },
                details: { paiements: [{ id: 1 }], depenses: [{ id: 2 }] },
                periode: { dateDebut: '2023-01-01', dateFin: '2023-12-31' }
            };
            DepenseModel.findByPeriod.mockResolvedValue(mockResult);
            
            ValidationService.formatPeriode.mockReturnValue('Janvier - Décembre 2023');
            
            await DepenseController.getFinancialDataByPeriod(req, res);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                periode: 'Janvier - Décembre 2023',
                data: mockResult
            });
        });
    });

    describe('generateFinancialReport', () => {
        it('devrait retourner une erreur 400 si la validation des dates échoue', async () => {
            const validationError = { error: true, message: 'Dates invalides' };
            ValidationService.validateDatePeriod.mockReturnValue(validationError);
            
            await DepenseController.generateFinancialReport(req, res);
            
            expect(ValidationService.validateDatePeriod).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: 'Dates invalides'
            });
        });
        
        it('devrait appeler le service DepenseService si les dates sont valides', async () => {
            const validationSuccess = {
                error: false,
                dateDebutObj: new Date('2023-01-01'),
                dateFinObj: new Date('2023-12-31')
            };
            ValidationService.validateDatePeriod.mockReturnValue(validationSuccess);
            
            const mockResponse = { status: 'OK', data: 'PDF_DATA' };
            DepenseService.generateFinancialReport.mockReturnValue(mockResponse);
            
            const result = await DepenseController.generateFinancialReport(req, res);
            
            expect(DepenseService.generateFinancialReport).toHaveBeenCalledWith(req, res);
            expect(result).toBe(mockResponse);
        });
    });

    describe('create', () => {
        it('devrait retourner une erreur 400 si les données sont invalides', async () => {
            req.body = null;
            
            await DepenseController.create(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: 'Les données de la requête ne sont pas valides.'
            });
        });
        
        it('devrait créer une dépense avec des données valides', async () => {
            const mockDepense = { 
                id_utilisateur: 1, 
                montant: 150, 
                categorie: 'Alimentation',
                description: 'Courses'
            };
            req.body = mockDepense;
            
            const mockCreatedDepense = { id_depense: 1, ...mockDepense };
            DepenseModel.create.mockResolvedValue(mockCreatedDepense);
            
            await DepenseController.create(req, res);
            
            expect(DepenseModel.create).toHaveBeenCalledWith(mockDepense);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockCreatedDepense
            });
        });
    });

    describe('updateDescription', () => {
        it('devrait retourner une erreur 400 si l\'ID est invalide', async () => {
            req.params = { id: 'invalid' };
            req.body = { description: 'Nouvelle description' };
            
            await DepenseController.updateDescription(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: 'ID de dépense invalide'
            });
        });
        
        it('devrait retourner une erreur 404 si la dépense n\'existe pas', async () => {
            req.params = { id: '999' };
            req.body = { description: 'Nouvelle description' };
            
            DepenseModel.findById.mockResolvedValue(null);
            
            await DepenseController.updateDescription(req, res);
            
            expect(DepenseModel.findById).toHaveBeenCalledWith(999);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucune dépense avec cet ID n'a été trouvée"
            });
        });
        
        it('devrait mettre à jour la description avec des données valides', async () => {
            req.params = { id: '1' };
            req.body = { description: 'Nouvelle description' };
            
            const mockDepense = { id_depense: 1, description: 'Ancienne description' };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            const mockUpdatedDepense = { ...mockDepense, description: 'Nouvelle description' };
            DepenseModel.updateDescription.mockResolvedValue(mockUpdatedDepense);
            
            await DepenseController.updateDescription(req, res);
            
            expect(DepenseModel.updateDescription).toHaveBeenCalledWith(1, 'Nouvelle description');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockUpdatedDepense
            });
        });
    });

    describe('updatePrice', () => {
        it('devrait mettre à jour le prix avec un montant valide', async () => {
            req.params = { id: '1' };
            req.body = { montant: 150 };
            
            const mockDepense = { id_depense: 1, montant: 100 };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            const mockUpdatedDepense = { ...mockDepense, montant: 150 };
            DepenseModel.updatePrice.mockResolvedValue(mockUpdatedDepense);
            
            await DepenseController.updatePrice(req, res);
            
            expect(DepenseModel.updatePrice).toHaveBeenCalledWith(1, 150);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockUpdatedDepense
            });
        });
    });

    describe('updateCategory', () => {
        it('devrait mettre à jour la catégorie avec une valeur valide', async () => {
            req.params = { id: '1' };
            req.body = { categorie: 'Loisirs' };
            
            const mockDepense = { id_depense: 1, categorie: 'Alimentation' };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            const mockUpdatedDepense = { ...mockDepense, categorie: 'Loisirs' };
            DepenseModel.updateCategory.mockResolvedValue(mockUpdatedDepense);
            
            await DepenseController.updateCategory(req, res);
            
            expect(DepenseModel.updateCategory).toHaveBeenCalledWith(1, 'Loisirs');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockUpdatedDepense
            });
        });
    });

    describe('deleteExpense', () => {
        it('devrait supprimer une dépense avec un ID valide', async () => {
            req.params = { id: '1' };
            
            const mockDepense = { id_depense: 1, date_suppression: null };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            const mockDeletedDepense = { ...mockDepense, date_suppression: new Date() };
            DepenseModel.softDelete.mockResolvedValue(mockDeletedDepense);
            
            await DepenseController.deleteExpense(req, res);
            
            expect(DepenseModel.softDelete).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: "Dépense supprimée avec succès.",
                data: mockDeletedDepense
            });
        });
    });

    describe('restoreExpense', () => {
        it('devrait restaurer une dépense avec un ID valide', async () => {
            req.params = { id: '1' };
            
            const mockDepense = { id_depense: 1, date_suppression: new Date() };
            DepenseModel.findById.mockResolvedValue(mockDepense);
            
            const mockRestoredDepense = { ...mockDepense, date_suppression: null };
            DepenseModel.restore.mockResolvedValue(mockRestoredDepense);
            
            await DepenseController.restoreExpense(req, res);
            
            expect(DepenseModel.restore).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockRestoredDepense
            });
        });
    });
});