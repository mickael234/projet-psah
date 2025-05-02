import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import PaiementModel from '../../src/models/paiement.model.js';
import PaiementService from '../../src/services/paiement.service.js';

describe("Paiement Service", () => {
    beforeEach(() => {
        // Mocks de base pour prisma
        jest.spyOn(prisma, '$transaction').mockImplementation(callback => callback(prisma));
        jest.spyOn(prisma.paiement, 'findUnique').mockResolvedValue(null);
        jest.spyOn(prisma.paiement, 'update').mockResolvedValue({});
        jest.spyOn(prisma.paiement, 'count').mockResolvedValue(0);
        
        // Espions sur PaiementModel
        jest.spyOn(PaiementModel, 'findById').mockResolvedValue(null);
        jest.spyOn(PaiementModel, 'findEcheancePrecedente').mockResolvedValue(null);
        jest.spyOn(PaiementModel, 'updatePaiement').mockResolvedValue({});
        jest.spyOn(PaiementModel, 'mettreAJourEtatPaiement').mockResolvedValue({});
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    it('devrait mettre à jour l\'état d\'un paiement simple', async () => {
        // Configuration des mocks pour ce cas de test
        const mockPaiement = {
            id_paiement: 1,
            id_reservation: 100,
            montant: 200,
            etat: 'en_attente',
            date_transaction: new Date('2023-01-01'),
            total_echeances: null,
            numero_echeance: null
        };
        
        // Configuration des espions
        PaiementModel.findById.mockResolvedValue(mockPaiement);
        PaiementModel.updatePaiement.mockResolvedValue({
            ...mockPaiement,
            etat: 'complete',
            date_transaction: expect.any(Date)
        });
        prisma.paiement.count.mockResolvedValue(0); // Aucun paiement restant
        
        // Exécution
        const result = await PaiementService.updateEtatPaiement(1, 'complete');
        
        // Vérifications
        expect(PaiementModel.findById).toHaveBeenCalledWith(prisma, 1);
        expect(PaiementModel.updatePaiement).toHaveBeenCalledWith(
            prisma,
            1,
            {
                etat: 'complete',
                date_transaction: expect.any(Date)
            }
        );
        expect(prisma.paiement.count).toHaveBeenCalledWith({
            where: {
                id_reservation: 100,
                etat: { not: "complete" },
                id_paiement: { not: 1 }
            }
        });
        
        // Pour le dernier paiement, mettreAJourEtatPaiement devrait être appelé
        expect(PaiementModel.mettreAJourEtatPaiement).toHaveBeenCalledWith(prisma, 100);
        
        // Vérifier le résultat
        expect(result).toEqual({
            ...mockPaiement,
            etat: 'complete',
            date_transaction: expect.any(Date)
        });
    });
    
    it('devrait mettre à jour l\'état d\'un paiement échelonné', async () => {
        // Configuration des mocks pour un paiement échelonné
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
        
        // Configuration des espions
        PaiementModel.findById.mockResolvedValue(mockPaiement);
        PaiementModel.findEcheancePrecedente.mockResolvedValue(mockEcheancePrecedente);
        PaiementModel.updatePaiement.mockResolvedValue({
            ...mockPaiement,
            etat: 'complete',
            date_transaction: expect.any(Date)
        });
        prisma.paiement.count.mockResolvedValue(1); // Il reste encore un paiement
        
        // Exécution
        const result = await PaiementService.updateEtatPaiement(2, 'complete');
        
        // Vérifications
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
        
        // Comme il reste des paiements, mettreAJourEtatPaiement ne devrait pas être appelé
        expect(PaiementModel.mettreAJourEtatPaiement).not.toHaveBeenCalled();
        
        // Vérifier le résultat
        expect(result).toEqual({
            ...mockPaiement,
            etat: 'complete',
            date_transaction: expect.any(Date)
        });
    });
    
    it('devrait rejeter si l\'échéance précédente n\'est pas complète', async () => {
        // Configuration des mocks pour un paiement échelonné avec échéance précédente non complète
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
            etat: 'en_attente', // Échéance précédente non complète
            numero_echeance: 1
        };
        
        // Configuration des espions
        PaiementModel.findById.mockResolvedValue(mockPaiement);
        PaiementModel.findEcheancePrecedente.mockResolvedValue(mockEcheancePrecedente);
        
        // Vérifier que l'erreur est bien levée
        await expect(
            PaiementService.updateEtatPaiement(2, 'complete')
        ).rejects.toThrow("L'échéance précédente doit être réglée d'abord.");
        
        // Vérifier que updatePaiement n'a pas été appelé
        expect(PaiementModel.updatePaiement).not.toHaveBeenCalled();
    });
});