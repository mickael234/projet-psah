import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import PaiementController from "../../src/controllers/paiementController.js";
import PaiementService from '../../src/services/paiement.service.js';
import { NotFoundError, ValidationError, PermissionError, InternalServerError } from "../../src/errors/apiError.js";
import fs from 'fs';

describe('PaiementController', () => {
    // Mocks pour les objets request et response Express
    let req, res;

    beforeEach(() => {
        // Configuration des mocks pour les services
        jest.spyOn(PaiementService, 'verifierPermissions').mockReturnValue(true);
        jest.spyOn(PaiementService, 'getById').mockResolvedValue(null);
        jest.spyOn(PaiementService, 'getPaiementsByReservation').mockResolvedValue([]);
        jest.spyOn(PaiementService, 'createPaiementsAvecEcheances').mockResolvedValue({});
        jest.spyOn(PaiementService, 'updatePaiement').mockResolvedValue({});
        jest.spyOn(PaiementService, 'updateEtatPaiement').mockResolvedValue({});
        jest.spyOn(PaiementService, 'refundPaiement').mockResolvedValue({});
        jest.spyOn(PaiementService, 'getRapportFinancier').mockResolvedValue({ data: [], totalMontant: 0 });
        jest.spyOn(PaiementService, 'exportRapportFinancierToPDF').mockResolvedValue('/path/to/file.pdf');
        jest.spyOn(PaiementService, 'getRevenuTotal').mockResolvedValue(0);
        jest.spyOn(PaiementService, 'getPaiementsEnRetard').mockResolvedValue([]);
        jest.spyOn(PaiementService, 'envoyerNotificationPaiementsEnRetard').mockResolvedValue(true);
        
        // Mock pour handleError
        jest.spyOn(PaiementController, 'handleError').mockImplementation((error, res) => {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    status: error.errorCode || "ERROR",
                    message: error.message
                });
            } else if (error instanceof ValidationError) {
                res.status(400).json({
                    status: error.errorCode || "ERROR",
                    message: error.message
                });
            } else if (error instanceof PermissionError) {
                res.status(403).json({
                    status: error.errorCode || "ERROR",
                    message: error.message
                });
            } else {
                res.status(500).json({
                    status: "ERREUR INTERNE",
                    message: "Une erreur interne est survenue",
                    error: error.message
                });
            }
        });

        // Mock pour fs
        jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
        
        // Mock pour req et res
        req = {
            params: {},
            body: {},
            query: {},
            user: {
                userId: 1,
                role: "COMPTABILITE"
            }
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            download: jest.fn((path, callback) => {
                if (callback) callback(null);
                return res;
            })
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('getPaiementById', () => {
        it('devrait retourner un paiement existant', async () => {
            // Configuration du mock
            const mockPaiement = {
                id_paiement: 1,
                montant: 100,
                etat: 'complete'
            };
            
            PaiementService.getById.mockResolvedValue(mockPaiement);
            req.params.id = '1';
            
            // Exécution
            await PaiementController.getPaiementById(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.getById).toHaveBeenCalledWith(null, '1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement récupéré avec succès',
                data: mockPaiement
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Paiement non trouvé");
            PaiementService.getById.mockRejectedValue(error);
            req.params.id = '999';
            
            // Exécution
            await PaiementController.getPaiementById(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('getPaiementsByReservation', () => {
        it('devrait retourner les paiements d\'une réservation', async () => {
            // Configuration du mock
            const mockPaiements = [
                { id_paiement: 1, montant: 100, etat: 'complete' },
                { id_paiement: 2, montant: 200, etat: 'en_attente' }
            ];
            
            PaiementService.getPaiementsByReservation.mockResolvedValue(mockPaiements);
            req.params.id = '5';
            
            // Exécution
            await PaiementController.getPaiementsByReservation(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.getPaiementsByReservation).toHaveBeenCalledWith('5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiements récupérés avec succès',
                data: mockPaiements
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Aucun paiement n'a été trouvé sur cette réservation.");
            PaiementService.getPaiementsByReservation.mockRejectedValue(error);
            req.params.id = '5';
            
            // Exécution
            await PaiementController.getPaiementsByReservation(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('createPaiement', () => {
        it('devrait créer un paiement simple avec succès', async () => {
            // Configuration du mock
            const paiementData = {
                id_reservation: '5',
                montant: '100',
                methode_paiement: 'carte'
            };
            
            const mockResultat = {
                type: 'single',
                paiement: {
                    id_paiement: 1,
                    id_reservation: 5,
                    montant: 100,
                    methode_paiement: 'carte',
                    etat: 'en_attente'
                }
            };
            
            PaiementService.createPaiementsAvecEcheances.mockResolvedValue(mockResultat);
            req.body = paiementData;
            
            // Exécution
            await PaiementController.createPaiement(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.createPaiementsAvecEcheances).toHaveBeenCalledWith({
                ...paiementData,
                etat: 'en_attente',
                reference_transaction: undefined,
                numero_echeance: undefined,
                total_echeances: undefined,
                notes: undefined
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement créé avec succès',
                data: mockResultat
            });
        });
        
        it('devrait créer des paiements échelonnés avec succès', async () => {
            // Configuration du mock
            const paiementData = {
                id_reservation: '5',
                montant: '300',
                methode_paiement: 'carte',
                total_echeances: 3
            };
            
            const mockResultat = {
                type: 'multiple',
                paiements: [
                    { id_paiement: 1, montant: 100, numero_echeance: 1, etat: 'complete' },
                    { id_paiement: 2, montant: 100, numero_echeance: 2, etat: 'en_attente' },
                    { id_paiement: 3, montant: 100, numero_echeance: 3, etat: 'en_attente' }
                ]
            };
            
            PaiementService.createPaiementsAvecEcheances.mockResolvedValue(mockResultat);
            req.body = paiementData;
            
            // Exécution
            await PaiementController.createPaiement(req, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiements échelonnés créés avec succès',
                data: mockResultat
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new ValidationError("Le montant doit être un nombre positif.");
            PaiementService.createPaiementsAvecEcheances.mockRejectedValue(error);
            
            req.body = {
                id_reservation: '5',
                montant: '-100',  // Montant négatif, ce qui déclenchera une erreur
                methode_paiement: 'carte'
            };
            
            // Exécution
            await PaiementController.createPaiement(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('updatePaiement', () => {
        it('devrait mettre à jour un paiement avec succès', async () => {
            // Configuration du mock
            const mockPaiement = {
                id_paiement: 1,
                montant: 100,
                etat: 'complete'
            };
            
            PaiementService.updatePaiement.mockResolvedValue(mockPaiement);
            req.params.id = '1';
            req.body = { etat: 'complete' };
            
            // Exécution
            await PaiementController.updatePaiement(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]
            );
            expect(PaiementService.updatePaiement).toHaveBeenCalledWith('1', { etat: 'complete' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement mis à jour avec succès',
                data: mockPaiement
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Paiement non trouvé");
            PaiementService.updatePaiement.mockRejectedValue(error);
            
            req.params.id = '999';
            req.body = { etat: 'complete' };
            
            // Exécution
            await PaiementController.updatePaiement(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('refundPaiement', () => {
        it('devrait rembourser un paiement avec succès', async () => {
            // Configuration du mock
            const mockPaiement = {
                id_paiement: 1,
                montant: 100,
                etat: 'rembourse',
                notes: 'Remboursement test'
            };
            
            PaiementService.refundPaiement.mockResolvedValue(mockPaiement);
            req.params.id = '1';
            req.body = { raison: 'Remboursement test' };
            
            // Exécution
            await PaiementController.refundPaiement(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]
            );
            expect(PaiementService.refundPaiement).toHaveBeenCalledWith('1', { raison: 'Remboursement test' }, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement remboursé avec succès',
                data: mockPaiement
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Paiement non trouvé");
            PaiementService.refundPaiement.mockRejectedValue(error);
            
            req.params.id = '999';
            req.body = { raison: 'Remboursement test' };
            
            // Exécution
            await PaiementController.refundPaiement(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('generateRapportFinancier', () => {
        it('devrait générer un rapport financier avec succès', async () => {
            // Configuration du mock
            const mockRapport = {
                data: [{ id_paiement: 1, montant: 100 }],
                totalMontant: 100
            };
            
            PaiementService.getRapportFinancier.mockResolvedValue(mockRapport);
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            
            // Exécution
            await PaiementController.generateRapportFinancier(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.getRapportFinancier).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockRapport.data,
                totalMontant: mockRapport.totalMontant
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new ValidationError("Le format de la date minimale est invalide (YYYY-MM-DD attendu)");
            PaiementService.getRapportFinancier.mockRejectedValue(error);
            
            req.query = { debut: '01/01/2023', fin: '31/12/2023' };
            
            // Exécution
            await PaiementController.generateRapportFinancier(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('exportRapportFinancierToPDF', () => {
        it('devrait exporter un rapport financier en PDF avec succès', async () => {
            // Configuration des mocks
            const filePath = '/path/to/file.pdf';
            
            PaiementService.exportRapportFinancierToPDF.mockResolvedValue(filePath);
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            
            // Mock de setTimeout
            jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
                callback();
                return 1;
            });
            
            // Exécution
            await PaiementController.exportRapportFinancierToPDF(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.exportRapportFinancierToPDF).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
            expect(res.download).toHaveBeenCalledWith(filePath, expect.any(Function));
            expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
        });
        
        it('devrait gérer les erreurs de téléchargement', async () => {
            const filePath = '/path/to/file.pdf';
            
            PaiementService.exportRapportFinancierToPDF.mockResolvedValue(filePath);
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            
            // Mock de res.download pour simuler une erreur
            res.download = jest.fn().mockImplementation((path, callback) => {
                if (callback) callback(new Error('Erreur de téléchargement'));
                return res;
            });
            
            // Mock de setTimeout
            jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
                callback();
                return 1;
            });
            
            // Exécution
            await PaiementController.exportRapportFinancierToPDF(req, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERREUR INTERNE',
                message: 'Une erreur est survenue lors du téléchargement du rapport PDF.',
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Aucune transaction n'a été trouvée pour la période allant du : 2023-01-01 au 2023-12-31");
            PaiementService.exportRapportFinancierToPDF.mockRejectedValue(error);
            
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            
            // Exécution
            await PaiementController.exportRapportFinancierToPDF(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('getRevenuTotal', () => {
        it('devrait retourner le revenu total avec succès', async () => {
            // Configuration du mock
            const revenuTotal = 5000;
            
            PaiementService.getRevenuTotal.mockResolvedValue(revenuTotal);
            
            // Exécution
            await PaiementController.getRevenuTotal(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.getRevenuTotal).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: {
                    revenuTotal
                }
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new Error("Erreur lors du calcul du revenu total");
            PaiementService.getRevenuTotal.mockRejectedValue(error);
            
            // Exécution
            await PaiementController.getRevenuTotal(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('getPaiementsEnRetard', () => {
        it('devrait retourner les paiements en retard avec succès', async () => {
            // Configuration du mock
            const mockPaiements = [
                { id_paiement: 1, montant: 100, date_echeance: '2023-01-01' }
            ];
            
            PaiementService.getPaiementsEnRetard.mockResolvedValue(mockPaiements);
            
            // Exécution
            await PaiementController.getPaiementsEnRetard(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.getPaiementsEnRetard).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: {
                    paiementsEnRetard: mockPaiements
                }
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new NotFoundError("Aucun paiement en retard trouvé");
            PaiementService.getPaiementsEnRetard.mockRejectedValue(error);
            
            // Exécution
            await PaiementController.getPaiementsEnRetard(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('updatePaiementStatus', () => {
        it('devrait mettre à jour le statut d\'un paiement avec succès', async () => {
            // Configuration du mock
            const mockPaiement = {
                id_paiement: 1,
                montant: 100,
                etat: 'complete'
            };
            
            PaiementService.updateEtatPaiement.mockResolvedValue(mockPaiement);
            req.params.id = '1';
            req.body = { etat: 'complete' };
            
            // Exécution
            await PaiementController.updatePaiementStatus(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]
            );
            expect(PaiementService.updateEtatPaiement).toHaveBeenCalledWith('1', 'complete');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: "État du paiement mis à jour avec succès: complete",
                data: mockPaiement
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new ValidationError("L'échéance précédente doit être réglée d'abord");
            PaiementService.updateEtatPaiement.mockRejectedValue(error);
            
            req.params.id = '2';
            req.body = { etat: 'complete' };
            
            // Exécution
            await PaiementController.updatePaiementStatus(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('envoyerNotificationPaiementsEnRetard', () => {
        it('devrait envoyer une notification avec succès', async () => {
            // Configuration du mock
            PaiementService.envoyerNotificationPaiementsEnRetard.mockResolvedValue(true);
            req.body = { email: 'test@example.com' };
            
            // Exécution
            await PaiementController.envoyerNotificationPaiementsEnRetard(req, res);
            
            // Vérifications
            expect(PaiementService.verifierPermissions).toHaveBeenCalledWith(
                req.user,
                ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]
            );
            expect(PaiementService.envoyerNotificationPaiementsEnRetard).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: "Notification envoyée avec succès"
            });
        });
        
        it('devrait indiquer qu\'aucun paiement en retard n\'a été trouvé', async () => {
            // Configuration du mock
            PaiementService.envoyerNotificationPaiementsEnRetard.mockResolvedValue(false);
            req.body = { email: 'test@example.com' };
            
            // Exécution
            await PaiementController.envoyerNotificationPaiementsEnRetard(req, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: "Aucun paiement en retard à notifier"
            });
        });
        
        it('devrait appeler handleError si le service génère une erreur', async () => {
            // Configuration du mock pour simuler une erreur
            const error = new ValidationError("L'adresse email du destinataire est invalide");
            PaiementService.envoyerNotificationPaiementsEnRetard.mockRejectedValue(error);
            
            req.body = { email: 'email-invalide' };
            
            // Exécution
            await PaiementController.envoyerNotificationPaiementsEnRetard(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
    
    describe('handleError', () => {
        // Restaurer l'implémentation originale pour ces tests
        beforeEach(() => {
            jest.spyOn(PaiementController, 'handleError').mockRestore();
        });
        
        it('devrait gérer les erreurs de type NotFoundError', () => {
            // Configuration
            const error = new NotFoundError("Ressource non trouvée");
            
            // Exécution
            PaiementController.handleError(error, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: "RESSOURCE NON TROUVEE",
                message: "Ressource non trouvée"
            });
        });
        
        it('devrait gérer les erreurs de type ValidationError', () => {
            // Configuration
            const error = new ValidationError("Données invalides");
            
            // Exécution
            PaiementController.handleError(error, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: "MAUVAISE DEMANDE",
                message: "Données invalides"
            });
        });
        
        it('devrait gérer les erreurs de type PermissionError', () => {
            // Configuration
            const error = new PermissionError("Permission refusée");
            
            // Exécution
            PaiementController.handleError(error, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                status: "PERMISSION REFUSEE",
                message: "Permission refusée"
            });
        });
        
        it('devrait gérer les erreurs génériques', () => {
            // Configuration
            const error = new Error("Erreur interne");
            
            // Exécution
            PaiementController.handleError(error, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: "ERREUR INTERNE",
                message: "Une erreur interne est survenue",
                error: "Erreur interne"
            });
        });
        
        it('devrait gérer les erreurs de type InternalServerError', () => {
            // Configuration
            const error = new InternalServerError("Erreur interne du serveur");
            
            // Exécution
            PaiementController.handleError(error, res);
            
            // Vérifications
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: "ERREUR INTERNE",
                message: "Erreur interne du serveur"
            });
        });
    });
    
    // Test pour vérifier le comportement en cas d'erreur d'autorisation
    describe('erreurs d\'autorisation', () => {
        it('devrait générer une erreur 403 si l\'utilisateur n\'a pas les permissions', async () => {
            // Configuration du mock pour simuler un refus d'autorisation
            const error = new PermissionError("Vous n'avez pas les permissions nécessaires pour cette action");
            PaiementService.verifierPermissions.mockImplementation(() => {
                throw error;
            });
            
            // Exécution
            await PaiementController.getPaiementById(req, res);
            
            // Vérifications
            expect(PaiementController.handleError).toHaveBeenCalledWith(error, res);
        });
    });
});