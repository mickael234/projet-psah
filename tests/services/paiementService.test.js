import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import PaiementModel from '../../src/models/paiement.model.js';
import ReservationModel from '../../src/models/reservation.model.js';
import PaiementService from '../../src/services/paiement.service.js';
import { NotFoundError, ValidationError, PermissionError } from '../../src/errors/apiError.js';
import { RoleMapper } from '../../src/utils/roleMapper.js';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';

describe("PaiementService", () => {
    // Configuration avant chaque test
    beforeEach(() => {
        // Spy sur Prisma
        jest.spyOn(prisma, '$transaction').mockImplementation(callback => callback(prisma));
        
        // Spies sur PaiementModel
        jest.spyOn(PaiementModel, 'findById');
        jest.spyOn(PaiementModel, 'findByReservation');
        jest.spyOn(PaiementModel, 'getTotalPaiements');
        jest.spyOn(PaiementModel, 'isReservationPaid');
        jest.spyOn(PaiementModel, 'getRapportFinancier');
        jest.spyOn(PaiementModel, 'getRevenuTotal');
        jest.spyOn(PaiementModel, 'findPaiementsEnRetard');
        jest.spyOn(PaiementModel, 'creerPaiementAvecEcheances');
        jest.spyOn(PaiementModel, 'findEcheancePrecedente');
        jest.spyOn(PaiementModel, 'updatePaiement');
        jest.spyOn(PaiementModel, 'mettreAJourEtatPaiement');
        
        // Spies sur ReservationModel
        jest.spyOn(ReservationModel, 'findById');
        
        // Spy sur RoleMapper
        jest.spyOn(RoleMapper, 'hasAuthorizedRole');
        
        // Spies sur le service lui-même (pour les méthodes internes)
        jest.spyOn(PaiementService, 'mettreAJourEtatPaiementReservation');
        
        // Spies pour les opérations sur les fichiers
        jest.spyOn(fs, 'createWriteStream').mockReturnValue({
            on: jest.fn(),
            once: jest.fn(),
            pipe: jest.fn()
        });
        jest.spyOn(fs, 'readFileSync').mockReturnValue('<html><table>{{rows}}</table></html>');
        
        // Spies pour path
        jest.spyOn(path, 'resolve').mockReturnValue('/test/path.pdf');
        jest.spyOn(path, 'join').mockReturnValue('/test/template.html');
        
        // Spy pour nodemailer
        jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
            sendMail: jest.fn((options, callback) => callback(null, { response: 'Ok' }))
        });
    });
    
    // Nettoyage après chaque test
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('verifierPermissions', () => {
        it('devrait lever une erreur si l\'utilisateur n\'est pas défini', () => {
            // Configuration du spy
            RoleMapper.hasAuthorizedRole.mockReturnValue(true);
            
            // Test d'absence d'utilisateur
            expect(() => {
                PaiementService.verifierPermissions(null, ["ADMIN"]);
            }).toThrow(PermissionError);
            
            expect(() => {
                PaiementService.verifierPermissions(null, ["ADMIN"]);
            }).toThrow("Authentification requise");
        });
        
        it('devrait lever une erreur si l\'utilisateur n\'a pas les permissions nécessaires', () => {
            // Configuration du spy
            RoleMapper.hasAuthorizedRole.mockReturnValue(false);
            
            // Test utilisateur sans permissions
            expect(() => {
                PaiementService.verifierPermissions({ id: 1, role: "USER" }, ["ADMIN"]);
            }).toThrow(PermissionError);
            
            expect(RoleMapper.hasAuthorizedRole).toHaveBeenCalledWith(
                { id: 1, role: "USER" }, 
                ["ADMIN"]
            );
        });
        
        it('devrait retourner true si l\'utilisateur a les permissions nécessaires', () => {
            // Configuration du spy
            RoleMapper.hasAuthorizedRole.mockReturnValue(true);
            
            // Test
            const result = PaiementService.verifierPermissions(
                { id: 1, role: "ADMIN" }, 
                ["ADMIN"]
            );
            
            // Vérifications
            expect(result).toBe(true);
            expect(RoleMapper.hasAuthorizedRole).toHaveBeenCalledWith(
                { id: 1, role: "ADMIN" }, 
                ["ADMIN"]
            );
        });
    });
    
    describe('getById', () => {
        it('devrait retourner un paiement existant', async () => {
            // Préparation du spy
            const mockPaiement = { id_paiement: 1, montant: 100 };
            PaiementModel.findById.mockResolvedValue(mockPaiement);
            
            // Exécution
            const result = await PaiementService.getById(prisma, 1);
            
            // Vérifications
            expect(result).toEqual(mockPaiement);
            expect(PaiementModel.findById).toHaveBeenCalledWith(prisma, 1);
        });
        
        it('devrait lever une erreur pour un ID invalide', async () => {
            // Test avec ID invalide
            await expect(PaiementService.getById(prisma, 'abc'))
                .rejects.toThrow(ValidationError);
            
            await expect(PaiementService.getById(prisma, null))
                .rejects.toThrow(ValidationError);
                
            expect(PaiementModel.findById).not.toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si le paiement n\'existe pas', async () => {
            // Configuration du spy pour simuler l'absence de paiement
            PaiementModel.findById.mockResolvedValue(null);
            
            // Test
            await expect(PaiementService.getById(prisma, 999))
                .rejects.toThrow(NotFoundError);
                
            expect(PaiementModel.findById).toHaveBeenCalledWith(prisma, 999);
        });
    });
    
    describe('getPaiementsByReservation', () => {
        it('devrait retourner les paiements d\'une réservation', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1, prix_total: 300 };
            const mockPaiements = [
                { id_paiement: 1, montant: 100 },
                { id_paiement: 2, montant: 200 }
            ];
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.findByReservation.mockResolvedValue(mockPaiements);
            
            // Exécution
            const result = await PaiementService.getPaiementsByReservation(1);
            
            // Vérifications
            expect(result).toEqual(mockPaiements);
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.findByReservation).toHaveBeenCalledWith(1);
        });
        
        it('devrait lever une erreur pour un ID de réservation invalide', async () => {
            await expect(PaiementService.getPaiementsByReservation('abc'))
                .rejects.toThrow(ValidationError);
                
            await expect(PaiementService.getPaiementsByReservation(null))
                .rejects.toThrow(ValidationError);
                
            expect(ReservationModel.findById).not.toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si la réservation n\'existe pas', async () => {
            // Configuration du spy
            ReservationModel.findById.mockResolvedValue(null);
            
            // Test
            await expect(PaiementService.getPaiementsByReservation(999))
                .rejects.toThrow(NotFoundError);
                
            expect(ReservationModel.findById).toHaveBeenCalledWith(999);
            expect(PaiementModel.findByReservation).not.toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si aucun paiement n\'est trouvé', async () => {
            // Configuration des spies
            const mockReservation = { id_reservation: 1 };
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.findByReservation.mockResolvedValue([]);
            
            // Test
            await expect(PaiementService.getPaiementsByReservation(1))
                .rejects.toThrow(NotFoundError);
                
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.findByReservation).toHaveBeenCalledWith(1);
        });
    });
    
    describe('getTotalPaiements', () => {
        it('devrait retourner le total des paiements d\'une réservation', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1 };
            const mockTotal = 300;
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.getTotalPaiements.mockResolvedValue(mockTotal);
            
            // Exécution
            const result = await PaiementService.getTotalPaiements(1);
            
            // Vérifications
            expect(result).toBe(mockTotal);
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.getTotalPaiements).toHaveBeenCalledWith(1);
        });
    });
    
    describe('isReservationPaid', () => {
        it('devrait vérifier si une réservation est payée', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1 };
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.isReservationPaid.mockResolvedValue(true);
            
            // Exécution
            const result = await PaiementService.isReservationPaid(1);
            
            // Vérifications
            expect(result).toBe(true);
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.isReservationPaid).toHaveBeenCalledWith(1);
        });
    });
    
    describe('getRapportFinancier', () => {
        it('devrait retourner un rapport financier pour une période donnée', async () => {
            // Préparation du spy
            const mockRapport = {
                data: [{ id_paiement: 1, montant: 100 }],
                totalTransactions: 1,
                totalMontant: 100
            };
            
            PaiementModel.getRapportFinancier.mockResolvedValue(mockRapport);
            
            // Exécution
            const result = await PaiementService.getRapportFinancier('2023-01-01', '2023-12-31');
            
            // Vérifications
            expect(result).toEqual(mockRapport);
            expect(PaiementModel.getRapportFinancier).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
        });
        
        it('devrait lever une erreur pour des dates au format invalide', async () => {
            await expect(PaiementService.getRapportFinancier('01/01/2023', '31/12/2023'))
                .rejects.toThrow(ValidationError);
                
            expect(PaiementModel.getRapportFinancier).not.toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si la date minimale est postérieure à la date maximale', async () => {
            await expect(PaiementService.getRapportFinancier('2023-12-31', '2023-01-01'))
                .rejects.toThrow(ValidationError);
                
            expect(PaiementModel.getRapportFinancier).not.toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si aucune transaction n\'est trouvée', async () => {
            // Configuration du spy
            const mockRapportVide = {
                data: [],
                totalTransactions: 0,
                totalMontant: 0
            };
            
            PaiementModel.getRapportFinancier.mockResolvedValue(mockRapportVide);
            
            // Test
            await expect(PaiementService.getRapportFinancier('2023-01-01', '2023-12-31'))
                .rejects.toThrow(NotFoundError);
                
            expect(PaiementModel.getRapportFinancier).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
        });
    });
    
    describe('getRevenuTotal', () => {
        it('devrait retourner le revenu total', async () => {
            // Préparation du spy
            const mockRevenu = 1000;
            PaiementModel.getRevenuTotal.mockResolvedValue(mockRevenu);
            
            // Exécution
            const result = await PaiementService.getRevenuTotal();
            
            // Vérifications
            expect(result).toBe(mockRevenu);
            expect(PaiementModel.getRevenuTotal).toHaveBeenCalled();
        });
    });
    
    describe('getPaiementsEnRetard', () => {
        it('devrait retourner les paiements en retard', async () => {
            // Préparation du spy
            const mockPaiements = [
                { id_paiement: 1, montant: 100, date_echeance: '2023-01-01' }
            ];
            
            PaiementModel.findPaiementsEnRetard.mockResolvedValue(mockPaiements);
            
            // Exécution
            const result = await PaiementService.getPaiementsEnRetard();
            
            // Vérifications
            expect(result).toEqual(mockPaiements);
            expect(PaiementModel.findPaiementsEnRetard).toHaveBeenCalled();
        });
        
        it('devrait lever une erreur si aucun paiement en retard n\'est trouvé', async () => {
            // Configuration du spy
            PaiementModel.findPaiementsEnRetard.mockResolvedValue([]);
            
            // Test
            await expect(PaiementService.getPaiementsEnRetard())
                .rejects.toThrow(NotFoundError);
                
            expect(PaiementModel.findPaiementsEnRetard).toHaveBeenCalled();
        });
    });
    
    describe('createPaiementsAvecEcheances', () => {
        it('devrait créer un paiement simple', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1, prix_total: 300 };
            const mockPaiements = [];
            const mockResultat = { 
                type: 'single', 
                paiement: { id_paiement: 1, montant: 100 }
            };
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.findByReservation.mockResolvedValue(mockPaiements);
            PaiementModel.creerPaiementAvecEcheances.mockResolvedValue(mockResultat);
            
            // Données de test
            const paiementData = {
                id_reservation: 1,
                montant: 100,
                methode_paiement: 'carte'
            };
            
            // Exécution
            const result = await PaiementService.createPaiementsAvecEcheances(paiementData);
            
            // Vérifications
            expect(result).toEqual(mockResultat);
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.findByReservation).toHaveBeenCalledWith(1);
            expect(PaiementModel.creerPaiementAvecEcheances).toHaveBeenCalledWith({
                ...paiementData,
                etat: 'en_attente',
                reference_transaction: undefined,
                numero_echeance: undefined,
                total_echeances: undefined,
                notes: undefined
            });
        });
        
        it('devrait créer un paiement échelonné', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1, prix_total: 300 };
            const mockPaiements = [];
            const mockResultat = { 
                type: 'multiple', 
                paiements: [
                    { id_paiement: 1, montant: 100, numero_echeance: 1 },
                    { id_paiement: 2, montant: 100, numero_echeance: 2 },
                    { id_paiement: 3, montant: 100, numero_echeance: 3 }
                ]
            };
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.findByReservation.mockResolvedValue(mockPaiements);
            PaiementModel.creerPaiementAvecEcheances.mockResolvedValue(mockResultat);
            
            // Données de test
            const paiementData = {
                id_reservation: 1,
                montant: 300, // Montant total égal au prix de la réservation
                methode_paiement: 'carte',
                total_echeances: 3
            };
            
            // Exécution
            const result = await PaiementService.createPaiementsAvecEcheances(paiementData);
            
            // Vérifications
            expect(result).toEqual(mockResultat);
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.findByReservation).toHaveBeenCalledWith(1);
            expect(PaiementModel.creerPaiementAvecEcheances).toHaveBeenCalledWith({
                ...paiementData,
                etat: 'en_attente',
                reference_transaction: undefined,
                numero_echeance: undefined,
                notes: undefined
            });
        });
        
        it('devrait valider que le montant total du paiement échelonné est égal au prix de la réservation', async () => {
            // Préparation des spies
            const mockReservation = { id_reservation: 1, prix_total: 300 };
            const mockPaiements = [];
            
            ReservationModel.findById.mockResolvedValue(mockReservation);
            PaiementModel.findByReservation.mockResolvedValue(mockPaiements);
            
            // Données de test
            const paiementData = {
                id_reservation: 1,
                montant: 200, // Montant inférieur au prix de la réservation
                methode_paiement: 'carte',
                total_echeances: 3
            };
            
            // Exécution et vérification
            await expect(PaiementService.createPaiementsAvecEcheances(paiementData))
                .rejects.toThrow(ValidationError);
                
            expect(ReservationModel.findById).toHaveBeenCalledWith(1);
            expect(PaiementModel.findByReservation).toHaveBeenCalledWith(1);
            expect(PaiementModel.creerPaiementAvecEcheances).not.toHaveBeenCalled();
        });
    });
    
    describe('updateEtatPaiement', () => {
        
        it('devrait vérifier l\'échéance précédente pour un paiement échelonné', async () => {
            // Réinitialisation des mocks pour ce test
            jest.clearAllMocks();
            prisma.$transaction.mockImplementation(callback => callback(prisma));
            
            // Préparation des spies
            const mockPaiement = {
                id_paiement: 2,
                id_reservation: 100,
                montant: 100,
                etat: 'en_attente',
                date_transaction: new Date('2023-01-01'),
                total_echeances: 3,
                numero_echeance: 2
            };
            
            const mockEcheancePrecedente = {
                id_paiement: 1,
                id_reservation: 100,
                etat: 'complete',
                numero_echeance: 1
            };
            
            const mockPaiementMisAJour = {
                ...mockPaiement,
                etat: 'complete',
                date_transaction: new Date()
            };
            
            // Utiliser mockResolvedValueOnce pour chaque appel précis
            PaiementModel.findById.mockResolvedValueOnce(mockPaiement);
            PaiementModel.findEcheancePrecedente.mockResolvedValueOnce(mockEcheancePrecedente);
            PaiementModel.updatePaiement.mockResolvedValueOnce(mockPaiementMisAJour);
            
            // Mock du count pour simuler qu'il reste des paiements
            jest.spyOn(prisma.paiement, 'count').mockResolvedValueOnce(1);
            
            // Exécution
            const result = await PaiementService.updateEtatPaiement(2, 'complete');
            
            // Vérifications
            expect(result).toEqual(mockPaiementMisAJour);
            expect(PaiementModel.findById).toHaveBeenCalledWith(prisma, 2);
            expect(PaiementModel.findEcheancePrecedente).toHaveBeenCalledWith(
                prisma,
                100,
                2
            );
            expect(PaiementModel.updatePaiement).toHaveBeenCalledWith(
                prisma,
                2,
                {
                    etat: 'complete',
                    date_transaction: expect.any(Date)
                }
            );
            expect(prisma.paiement.count).toHaveBeenCalled();
            // S'assurer que mettreAJourEtatPaiement n'a pas été appelé car il reste des paiements
            expect(PaiementModel.mettreAJourEtatPaiement).not.toHaveBeenCalled();
        });
        
        it('devrait rejeter la mise à jour si l\'échéance précédente n\'est pas complète', async () => {
            // Réinitialisation des mocks pour ce test
            jest.clearAllMocks();
            prisma.$transaction.mockImplementation(callback => callback(prisma));
            
            // Préparation des spies
            const mockPaiement = {
                id_paiement: 2,
                id_reservation: 100,
                montant: 100,
                etat: 'en_attente',
                date_transaction: new Date('2023-01-01'),
                total_echeances: 3,
                numero_echeance: 2
            };
            
            const mockEcheancePrecedente = {
                id_paiement: 1,
                id_reservation: 100,
                etat: 'en_attente', // État non complété - doit causer une erreur
                numero_echeance: 1
            };
            
            // Utiliser mockResolvedValueOnce pour éviter les conflits
            PaiementModel.findById.mockResolvedValueOnce(mockPaiement);
            PaiementModel.findEcheancePrecedente.mockResolvedValueOnce(mockEcheancePrecedente);
            
            // Exécution et vérification
            await expect(PaiementService.updateEtatPaiement(2, 'complete'))
                .rejects.toThrow(ValidationError);
                
            // Vérifier que updatePaiement n'a pas été appelé
            expect(PaiementModel.updatePaiement).not.toHaveBeenCalled();
        });
    });
});