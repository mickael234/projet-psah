import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import PaiementController from "../../src/controllers/paiementController";
import PaiementModel from '../../src/models/paiement.model.js';
import prisma from '../../src/config/prisma.js';


describe('PaiementController', () => {
    /**
     * Mocks pour les objets request et response Express
     */
    let req;
    let res;

    /**
     * Configuration avant chaque test
     * - Mock des fonctions Prisma 
     * - Mock de request et response 
     */

    beforeEach(() => {
        jest.spyOn(prisma.paiement, 'findMany').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.paiement, 'findUnique').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.paiement, 'create').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.paiement, 'update').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.reservation, 'findUnique').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.reservation, 'update').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.paiement, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.journalModifications, 'create').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(PaiementModel, 'getRapportFinancier').mockImplementation(() => Promise.resolve({ data: [], total: 0 }));
        
        
        res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        
        req = {
            params: {},
            body: {},
            query: {}
        };
        
    });

    /**
     * Nettoyage des mocks après chaque test
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests pour la méthode getPaiementsByReservation
     */
    describe('getPaiementsByReservation', () => {

        /** 
        * Test: Retourne une liste de paiements pour une réservation donnée
        */

        it('devrait retourner une liste de paiements pour une réservation', async () => {

            const mockPaiements = [
                {
                    id_paiement: 1,
                    id_reservation: 5,
                    montant: 500.00,
                    methode_paiement: 'carte',
                    date_transaction: new Date(),
                    etat: 'complete'
                }
            ];
            

            prisma.paiement.findMany.mockResolvedValue(mockPaiements);
            req.params = { id: '5' };
            

            await PaiementController.getPaiementsByReservation(req, res);
            
 
            expect(prisma.paiement.findMany).toHaveBeenCalledWith({
                where: { id_reservation: 5 },
                orderBy: { date_transaction: 'desc' }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiements récupérés avec succès',
                data: mockPaiements
            });
        }),

        /** 
         * Test: Gère les erreurs lors de la récupération des paiements
         */

        it('devrait gérer les erreurs lors de la récupération des paiements', async () => {
     
            prisma.paiement.findMany.mockRejectedValue(new Error('Erreur de base de données'));
            req.params = { id: '5' };
            
            await PaiementController.getPaiementsByReservation(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des paiements',
                error: 'Erreur de base de données'
            });
        });
    });

    /**
     * Tests pour la méthode getPaiementById
     */
    describe('getPaiementById', () => {

        /** 
         * Test: Retourne un paiement par son ID
         */
        it('devrait retourner un paiement par son ID', async () => {

            const mockPaiement = {
                id_paiement: 1,
                id_reservation: 5,
                montant: 500.00,
                methode_paiement: 'carte',
                date_transaction: new Date(),
                etat: 'complete'
            };
            
            prisma.paiement.findUnique.mockResolvedValue(mockPaiement);
            req.params = { id: '1' };
            
            await PaiementController.getPaiementById(req, res);
            

            expect(prisma.paiement.findUnique).toHaveBeenCalledWith({
                where: { id_paiement: 1 }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement récupéré avec succès',
                data: mockPaiement
            });
        }),

        /** 
         * Test: Retourne une erreur 404 si le paiement n’existe pas
         */

        it('devrait retourner une erreur 404 si le paiement n\'existe pas', async () => {

            prisma.paiement.findUnique.mockResolvedValue(null);
            req.params = { id: '999' };
            

            await PaiementController.getPaiementById(req, res);
            
  
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERROR',
                message: 'Paiement non trouvé'
            });
        })
    });

    /**
     * Tests pour la méthode createPaiement
     */
    describe('createPaiement', () => {

        /** 
         * Test: Création réussie d’un paiement
         */
        it('devrait créer un nouveau paiement avec succès', async () => {
      
            const mockReservation = {
                id_reservation: 5,
                prix_total: 1000.00
            };
            
            const mockPaiement = {
                id_paiement: 1,
                id_reservation: 5,
                montant: 500.00,
                methode_paiement: 'carte',
                date_transaction: expect.any(Date),
                etat: 'en_attente'
            };
            
         
            prisma.reservation.findUnique.mockResolvedValue(mockReservation);
            prisma.paiement.create.mockResolvedValue(mockPaiement);
            prisma.paiement.aggregate.mockResolvedValue({ _sum: { montant: 500.00 } });
            
            req.body = {
                id_reservation: '5',
                montant: '500.00',
                methode_paiement: 'carte'
            };

            
            await PaiementController.createPaiement(req, res);
            

            expect(prisma.paiement.create).toHaveBeenCalled();
            expect(prisma.reservation.update).toHaveBeenCalledWith({
                where: { id_reservation: 5 },
                data: { etat_paiement: 'en_attente' }
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement créé avec succès',
                data: mockPaiement
            });
        }),

        /**
         * Test: Retourne une erreur 400 si les données sont manquantes
         */
        it('devrait retourner une erreur 400 si des données obligatoires sont manquantes', async () => {

            req.body = {
                id_reservation: '5',
                // montant manquant
                methode_paiement: 'carte'
            };
            

            await PaiementController.createPaiement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERROR',
                message: 'ID de réservation, montant et méthode de paiement sont requis'
            });
        }),

        /**
         * Test: Retourne une erreur 404 si la réservation n'existe pas
         */
        it('devrait retourner une erreur 404 si la réservation n\'existe pas', async () => {

            prisma.reservation.findUnique.mockResolvedValue(null);
            
            req.body = {
                id_reservation: '999',
                montant: '500.00',
                methode_paiement: 'carte'
            };
            

            await PaiementController.createPaiement(req, res);
            

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERROR',
                message: 'Réservation non trouvée'
            });
        })
    });

    /**
     * Tests pour la méthode updatePaiement
     */
    describe('updatePaiement', () => {

        /** 
         * Test: Mise à jour d’un paiement existant
         */

        it('devrait mettre à jour un paiement avec succès', async () => {

            const existingPaiement = {
                id_paiement: 1,
                id_reservation: 5,
                montant: 500.00,
                methode_paiement: 'carte',
                etat: 'en_attente'
            };
            
            const updatedPaiement = {
                ...existingPaiement,
                etat: 'complete'
            };
            

            prisma.paiement.findUnique.mockResolvedValue(existingPaiement);
            prisma.paiement.update.mockResolvedValue(updatedPaiement);
            prisma.reservation.findUnique.mockResolvedValue({ id_reservation: 5, prix_total: 1000.00 });
            prisma.paiement.aggregate.mockResolvedValue({ _sum: { montant: 500.00 } });
            
            req.params = { id: '1' };
            req.body = { etat: 'complete' };
            
            await PaiementController.updatePaiement(req, res);
            

            expect(prisma.paiement.update).toHaveBeenCalledWith({
                where: { id_paiement: 1 },
                data: { etat: 'complete' }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement mis à jour avec succès',
                data: updatedPaiement
            });
        }),

         /** 
         * Test: Retourne une erreur 404 si le paiement n’existe pas
         */
        it('devrait retourner une erreur 404 si le paiement n\'existe pas', async () => {

            prisma.paiement.findUnique.mockResolvedValue(null);
            
            req.params = { id: '999' };
            req.body = { etat: 'complete' };
            
            await PaiementController.updatePaiement(req, res);
            

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERROR',
                message: 'Paiement non trouvé'
            });
        })
    });

    /**
     * Tests pour la méthode refundPaiement
     */
    describe('refundPaiement', () => {

        /** 
         * Test: Remboursement réussi d’un paiement
         */
        it('devrait rembourser un paiement avec succès', async () => {

            const existingPaiement = {
                id_paiement: 1,
                id_reservation: 5,
                montant: 500.00,
                methode_paiement: 'carte',
                etat: 'complete'
            };
            
            const refundedPaiement = {
                ...existingPaiement,
                etat: 'rembourse',
                notes: 'Remboursement pour test'
            };
            

            prisma.paiement.findUnique.mockResolvedValue(existingPaiement);
            prisma.paiement.update.mockResolvedValue(refundedPaiement);
            prisma.reservation.findUnique.mockResolvedValue({ id_reservation: 5, prix_total: 1000.00 });
            
            req.params = { id: '1' };
            req.body = { raison: 'Remboursement pour test' };
            
            await PaiementController.refundPaiement(req, res);
            

            expect(prisma.paiement.update).toHaveBeenCalledWith({
                where: { id_paiement: 1 },
                data: {
                    etat: 'rembourse',
                    notes: 'Remboursement pour test'
                }
            });
            expect(prisma.journalModifications.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                message: 'Paiement remboursé avec succès',
                data: refundedPaiement
            });
        })
    });

    /**
     * Tests pour la méthode generateRapportFinancier
     */
    describe('generateRapportFinancier', () => {
        /** 
         * Test: Génération de rapport avec dates valides
         */
        it('devrait générer un rapport financier avec succès', async () => {

            const mockTransactions = [
                {
                    id_paiement: 1,
                    id_reservation: 5,
                    montant: 500.00,
                    methode_paiement: 'carte',
                    etat: 'complete'
                }
            ];
            
            PaiementModel.getRapportFinancier.mockResolvedValue({
                data: mockTransactions,
                total: 1
            });
            
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            

            await PaiementController.generateRapportFinancier(req, res);
            

            expect(PaiementModel.getRapportFinancier).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                statut: 'OK',
                data: {
                    transactions: mockTransactions,
                    total: 1
                }
            });
        }),

        /** 
         * Test: Retourne une erreur 404 si les dates sont absentes
         */

        it('devrait retourner une erreur 400 si les dates ne sont pas fournies', async () => {

            req.query = {}; 
            

            await PaiementController.generateRapportFinancier(req, res);
            

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                statut: 'MAUVAISE DEMANDE',
                message: 'Les dates pour déterminer la période sont requises.'
            });
        }),

         /** 
         * Test: Retourne une erreur 404 si aucune transaction n'est trouvée
         */
        it('devrait retourner une erreur 404 si aucune transaction n\'est trouvée', async () => {

            PaiementModel.getRapportFinancier.mockResolvedValue({
                data: [],
                total: 0
            });
            
            req.query = { debut: '2023-01-01', fin: '2023-12-31' };
            
 
            await PaiementController.generateRapportFinancier(req, res);
            

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                statut: 'RESSOURCE NON TROUVEE',
                message: 'Aucune transaction n\'a été trouvée pour la période allant du : 2023-01-01 au 2023-12-31'
            });
        })
    });
});