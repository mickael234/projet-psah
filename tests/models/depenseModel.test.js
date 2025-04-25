import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import DepenseModel from '../../src/models/depense.model.js';

describe("Depense Model", () => {

    /**
     * Configuration avant chaque test
     * - Mock des fonctions Prisma 
     * - Chaque fonction mockée retourne une valeur par défaut
     */


    beforeEach(() => {
        jest.spyOn(prisma.depense, "findUnique").mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.depense, "findMany").mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.paiement, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.depense, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.depense, 'groupBy').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.paiement, 'groupBy').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.depense, 'update').mockImplementation(() => Promise.resolve({}));
    });

    /**
     * Nettoyage après chaque test
     * - Réinitialise tous les mocks pour éviter les interférences entre les tests
     */
    
    afterEach(() => {
        jest.clearAllMocks();
    });


    /**
     * Test: Vérifie qu'on peut récupérer une dépense par son ID
     */
    
    it("devrait retourner une dépense par son ID", async () => {
        const mockDepense = {
            id_depense: 1,
            id_utilisateur: 4,
            montant: 699.00,
            categorie : "maintenance"
        }

        prisma.depense.findUnique.mockResolvedValue(mockDepense);
        const result = await DepenseModel.findById(1);

        expect(prisma.depense.findUnique).toHaveBeenCalled();
        expect(prisma.depense.findUnique).toHaveBeenCalledWith({where: {
            id_depense: 1
        }})
        expect(result).toEqual(mockDepense);
    });

     /**
     * Test: Vérifie que les dépenses puissent être filtrées
     */

    it("devrait retourner une liste de dépenses selon des filtres", async () => {
        const mockDepenses = [
            {
                id_depense: 12,
                id_utilisateur: 4,
                montant: 699.00,
                categorie : "maintenance"
            },
            {
                id_depense: 55,
                id_utilisateur: 614,
                montant: 199.00,
                categorie : "maintenance"
            }
        ];

        const filters = {
            categorie: "maintenance"
        }

        prisma.depense.findMany.mockResolvedValue(mockDepenses);
        const result = await DepenseModel.findAll(filters, 1);

        expect(prisma.depense.findMany).toHaveBeenCalled();
        expect(result).toEqual(mockDepenses);
    });

    /**
     * Test: Vérifie que les données financières sont correctement agrégées par période
     */

    it("devrait récupérer les données financières selon une période spécifique", async () => {

        // Définition des mocks pour les données de test
        const mockRevenuTotal = { _sum: { montant: 5000 } };
        const mockDepensesTotales = { _sum: { montant: 3000 } };
        
        const mockDepensesParCategorie = [
            { categorie: "nourriture", _sum: { montant: 1200 } },
            { categorie: "transport", _sum: { montant: 800 } },
            { categorie: "logement", _sum: { montant: 1000 } }
        ];
        
        const mockPaiementsParMethode = [
            { methode_paiement: "carte", _sum: { montant: 3500 } },
            { methode_paiement: "especes", _sum: { montant: 1500 } }
        ];

        // Configurer les mocks
        prisma.paiement.aggregate.mockImplementation((params) => {
            if (params._sum?.montant) {
                return Promise.resolve(mockRevenuTotal);
            }
            return Promise.resolve({ _sum: { montant: 0 } });
        });

        prisma.depense.aggregate.mockResolvedValue(mockDepensesTotales);
        prisma.depense.groupBy.mockResolvedValue(mockDepensesParCategorie);
        prisma.paiement.groupBy.mockResolvedValue(mockPaiementsParMethode);


        const result = await DepenseModel.findByPeriod(5, 2023);

        expect(prisma.paiement.aggregate).toHaveBeenCalled();
        expect(prisma.depense.aggregate).toHaveBeenCalled();
        expect(prisma.depense.groupBy).toHaveBeenCalled();
        expect(prisma.paiement.groupBy).toHaveBeenCalled();

        
        expect(result).toEqual({
            totalRevenus: 5000,
            totalDepenses: 3000,
            solde: 2000,
            depensesParCategorie: {
                "nourriture": 1200,
                "transport": 800,
                "logement": 1000
            },
            paiementsParMethode: {
                "carte": 3500,
                "especes": 1500
            }
        });


        expect(prisma.paiement.aggregate).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                date_transaction: {
                    gte: expect.any(Date),
                    lte: expect.any(Date)
                }
            })
        }));
    });

    /**
     * Test: Vérifie qu'on peut modifier la description d'une dépense
     */

    it("devrait mettre à jour la description d'une dépense", async () => {
        const idDepense = 42;
        const nouvelleDescription = "Achat de fournitures de bureau";
        const mockDepenseModifiee = {
            id_depense: idDepense,
            description: nouvelleDescription,
            date_modification: new Date('2023-05-15T10:30:00Z')
        };

        prisma.depense.update.mockResolvedValue(mockDepenseModifiee);

        const result = await DepenseModel.updateDescription(idDepense, nouvelleDescription);

        expect(prisma.depense.update).toHaveBeenCalledWith({
            where: {
                id_depense: idDepense
            },
            data: {
                description: nouvelleDescription,
                date_modification: expect.any(Date)
            }
        });

        expect(result).toEqual(mockDepenseModifiee);
    });

    /**
     * Test: Vérifie qu'on peut modifier le montant d'une dépense
     */

    it("devrait mettre à jour le montant d'une dépense", async () => {
        const idDepense = 55;
        const nouveauMontant = 845.99;
        const mockDepenseModifiee = {
            id_depense: idDepense,
            montant: nouveauMontant,
            date_modification: new Date('2023-05-15T11:45:00Z')
        };

        prisma.depense.update.mockResolvedValue(mockDepenseModifiee);

        const result = await DepenseModel.updatePrice(idDepense, nouveauMontant);

        expect(prisma.depense.update).toHaveBeenCalledWith({
            where: {
                id_depense: idDepense
            },
            data: {
                montant: nouveauMontant,
                date_modification: expect.any(Date)
            }
        });

        expect(result).toEqual(mockDepenseModifiee);
    });

     /**
     * Test: Vérifie qu'on peut modifier la catégorie d'une dépense
     */

    it("devrait mettre à jour la catégorie d'une dépense", async () => {
        const idDepense = 73;
        const nouvelleCategorie = "loisirs";
        const mockDepenseModifiee = {
            id_depense: idDepense,
            categorie: nouvelleCategorie,
            date_modification: new Date('2023-05-16T09:15:00Z')
        };

        prisma.depense.update.mockResolvedValue(mockDepenseModifiee);

        const result = await DepenseModel.updateCategory(idDepense, nouvelleCategorie);

        expect(prisma.depense.update).toHaveBeenCalledWith({
            where: {
                id_depense: idDepense
            },
            data: {
                categorie: nouvelleCategorie,
                date_modification: expect.any(Date)
            }
        });

        expect(result).toEqual(mockDepenseModifiee);
    });

    /**
     * Test: Vérifie qu'on peut restaurer une dépense précédemment supprimée
     */

    it("devrait restaurer une dépense supprimée", async () => {
        const idDepense = 89;
        const mockDepenseRestauree = {
            id_depense: idDepense,
            date_suppression: null
        };

        prisma.depense.update.mockResolvedValue(mockDepenseRestauree);

        const result = await DepenseModel.restore(idDepense);

        expect(prisma.depense.update).toHaveBeenCalledWith({
            where: {
                id_depense: idDepense
            },
            data: {
                date_suppression: null
            }
        });

        expect(result).toEqual(mockDepenseRestauree);
    });

    /**
     * Test: Vérifie que la dépense a été supprimée (soft delete)
     */

    it("devrait effectuer une suppression logique d'une dépense", async () => {
        const idDepense = 101;
        const mockDateSuppression = new Date('2023-05-17T14:30:00Z');
        
        // Mock pour Date() pour renvoyer une date constante
        jest.spyOn(global, 'Date').mockImplementation(() => mockDateSuppression);
        
        const mockDepenseSupprimee = {
            id_depense: idDepense,
            date_suppression: mockDateSuppression
        };

        prisma.depense.update.mockResolvedValue(mockDepenseSupprimee);

        const result = await DepenseModel.softDelete(idDepense);

    
        expect(prisma.depense.update).toHaveBeenCalledWith({
            where: {
                id_depense: idDepense
            },
            data: {
                date_suppression: mockDateSuppression
            }
        });

        expect(result).toEqual(mockDepenseSupprimee);
        
        // Restaure le comportement normal de Date
        jest.restoreAllMocks();
    });
});