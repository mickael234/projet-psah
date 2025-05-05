import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import PaiementModel from '../../src/models/paiement.model.js';
import PaiementService from '../../src/services/paiement.service.js';
import path from 'path';
import fs from 'fs';
import { genererContenuEmail } from '../../src/services/paiement.service.js';


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

    it('devrait retourner les paiements en retard', async () => {
        const paiementsFictifs = [
            { id_paiement: 1, montant: 100, date_echeance: '2024-01-01', client: { nom: 'Doe' } }
        ];
    
        // Mock la méthode du model
        jest.spyOn(PaiementModel, 'findPaiementsEnRetard').mockResolvedValue(paiementsFictifs);
    
        const result = await PaiementService.getPaiementsEnRetard();
    
        expect(PaiementModel.findPaiementsEnRetard).toHaveBeenCalled();
        expect(result).toEqual(paiementsFictifs);
    });
    
    describe('genererContenuEmail', () => {
        let readFileSpy;
        let pathJoinSpy;
      
        beforeEach(() => {
          // Simule une date fixe pour les jours de retard
          jest.useFakeTimers().setSystemTime(new Date('2024-05-05T00:00:00Z'));
      
          // Mock de path.join
          pathJoinSpy = jest.spyOn(path, 'join').mockReturnValue('/fake/path/template.html');
      
          // Mock du contenu du fichier HTML
          readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(
            '<html><body><table>{{rows}}</table></body></html>'
          );
        });
      
        afterEach(() => {
          jest.restoreAllMocks();
          jest.useRealTimers();
        });
      
        it('devrait insérer les lignes des paiements dans le template HTML', () => {
          const paiements = [
            {
              client: { nom: 'Dupont' },
              montant: 100,
              date_echeance: '2024-05-01'
            },
            {
              client: { nom: 'Martin' },
              montant: 200,
              date_echeance: '2024-05-03'
            }
          ];
      
          const result = genererContenuEmail(paiements);
      
          // Assertions sur les mocks
          expect(pathJoinSpy).toHaveBeenCalled();
          expect(readFileSpy).toHaveBeenCalledWith('/fake/path/template.html', 'utf-8');
      
          // Vérifie que les lignes HTML sont bien générées
          expect(result).toContain('<td>1</td>');
          expect(result).toContain('Dupont');
          expect(result).toContain('4 jours'); // 2024-05-01 -> 2024-05-05
          expect(result).toContain('2 jours'); // 2024-05-03 -> 2024-05-05
        });
      });
});