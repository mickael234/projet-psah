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
        jest.spyOn(prisma.depense, "count").mockImplementation(() => Promise.resolve(0));
        jest.spyOn(prisma.paiement, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.depense, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.depense, 'groupBy').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.paiement, 'groupBy').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.depense, "create").mockImplementation(() => Promise.resolve({}));
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
     * Test: Vérifie que le nombre total de dépenses eest renvoyée
     */

    it("devrait compter le nombre de dépenses", async () => {
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

        prisma.depense.count.mockResolvedValue(mockDepenses.length);
        const result = await DepenseModel.countAll();

        expect(prisma.depense.count).toHaveBeenCalled();
        expect(result).toBe(mockDepenses.length);
    })
    /**
     * Test: Vérifie qu'on peut créer une dépense
     */

    it("devrait créer une dépense", async () => {
        const nouvelleDepense = {
            id_depense: 29,
            id_utilisateur: 74,
            montant: 349.00,
            categorie : "transport"
        };

        const mockNouvelleDepense = nouvelleDepense;

        prisma.depense.create.mockResolvedValue(mockNouvelleDepense);
        const result = await DepenseModel.create(nouvelleDepense);

        expect(prisma.depense.create).toHaveBeenCalledWith({
            data : {
                nouvelleDepense
            }
        })
        expect(result).toEqual(mockNouvelleDepense);
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

describe("Depense Model - Générer un rapport financier (findByPeriod)", () => {
    // Dates de test
    const dateDebut = new Date('2023-01-01');
    const dateFin = new Date('2023-01-31');
    
    // Mocks de données
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
    const mockPaiements = [
        { 
            id_paiement: 1, 
            montant: 2500, 
            methode_paiement: "carte",
            utilisateur: { nom_utilisateur: "user1" },
            reservation: { 
                id_reservation: 101,
                client: { 
                    id_client: 201, 
                    nom: "Dupont", 
                    prenom: "Jean", 
                    email: "jean.dupont@example.com" 
                } 
            }
        },
        { 
            id_paiement: 2, 
            montant: 2500, 
            methode_paiement: "especes",
            utilisateur: { nom_utilisateur: "user2" },
            reservation: { 
                id_reservation: 102,
                client: { 
                    id_client: 202, 
                    nom: "Martin", 
                    prenom: "Sophie", 
                    email: "sophie.martin@example.com" 
                } 
            }
        }
    ];
    const mockDepenses = [
        { 
            id_depense: 1, 
            montant: 1200, 
            categorie: "nourriture",
            utilisateur: { nom_utilisateur: "user1" } 
        },
        { 
            id_depense: 2, 
            montant: 1800, 
            categorie: "logement",
            utilisateur: { nom_utilisateur: "user2" } 
        }
    ];
    
    /**
     * Configuration avant chaque test
     * - Mock des fonctions Prisma 
     * - Chaque fonction mockée retourne une valeur par défaut
     */
    beforeEach(() => {
        // Mock pour les aggregations
        jest.spyOn(prisma.paiement, 'aggregate').mockResolvedValue(mockRevenuTotal);
        jest.spyOn(prisma.depense, 'aggregate').mockResolvedValue(mockDepensesTotales);
        
        // Mock pour les groupBy
        jest.spyOn(prisma.depense, 'groupBy').mockResolvedValue(mockDepensesParCategorie);
        jest.spyOn(prisma.paiement, 'groupBy').mockResolvedValue(mockPaiementsParMethode);
        
        // Mock pour les findMany
        jest.spyOn(prisma.paiement, 'findMany').mockResolvedValue(mockPaiements);
        jest.spyOn(prisma.depense, 'findMany').mockResolvedValue(mockDepenses);
    });

    /**
     * Nettoyage après chaque test
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: Vérifie que la méthode appelle toutes les requêtes nécessaires
     */
    it("devrait appeler toutes les requêtes avec les bons paramètres", async () => {

        await DepenseModel.findByPeriod(dateDebut, dateFin);

        expect(prisma.paiement.aggregate).toHaveBeenCalled();
        expect(prisma.depense.aggregate).toHaveBeenCalled();
        expect(prisma.depense.groupBy).toHaveBeenCalled();
        expect(prisma.paiement.groupBy).toHaveBeenCalled();
        expect(prisma.paiement.findMany).toHaveBeenCalled();
        expect(prisma.depense.findMany).toHaveBeenCalled();
        
        const dateCondition = expect.objectContaining({
            where: expect.objectContaining({
                date_transaction: {
                    gte: expect.any(Date),
                    lte: expect.any(Date)
                }
            })
        });
        
        expect(prisma.paiement.aggregate).toHaveBeenCalledWith(dateCondition);
    });

    /**
     * Test: Vérifie que la méthode retourne le résultat formaté correctement
     */
    it("devrait retourner les données correctement formatées", async () => {

        const result = await DepenseModel.findByPeriod(dateDebut, dateFin);
        

        expect(result).toHaveProperty('resume');
        expect(result).toHaveProperty('details');
        expect(result).toHaveProperty('periode');
        
        // Vérifier le contenu du résumé
        expect(result.resume).toEqual({
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
        

        expect(result.details).toHaveProperty('paiements');
        expect(result.details).toHaveProperty('depenses');
        expect(result.details.paiements).toEqual(mockPaiements);
        expect(result.details.depenses).toEqual(mockDepenses);
        
 
        expect(result.periode).toHaveProperty('dateDebut');
        expect(result.periode).toHaveProperty('dateFin');
        expect(result.periode).toHaveProperty('nbJours');
    });

    /**
     * Test: Vérifie que la méthode gère correctement les données nulles
     */
    it("devrait gérer correctement les valeurs nulles", async () => {

        // Modifier les mocks pour simuler des résultats vides/nuls
        prisma.paiement.aggregate.mockResolvedValue({ _sum: { montant: null } });
        prisma.depense.aggregate.mockResolvedValue({ _sum: { montant: null } });
        prisma.depense.groupBy.mockResolvedValue([]);
        prisma.paiement.groupBy.mockResolvedValue([]);
        prisma.paiement.findMany.mockResolvedValue([]);
        prisma.depense.findMany.mockResolvedValue([]);
        
        // Appel de la méthode à tester
        const result = await DepenseModel.findByPeriod(dateDebut, dateFin);
        
        // Vérifier que les valeurs par défaut sont appliquées correctement
        expect(result.resume.totalRevenus).toBe(0);
        expect(result.resume.totalDepenses).toBe(0);
        expect(result.resume.solde).toBe(0);
        expect(result.resume.depensesParCategorie).toEqual({});
        expect(result.resume.paiementsParMethode).toEqual({});
        expect(result.details.paiements).toEqual([]);
        expect(result.details.depenses).toEqual([]);
    });

    /**
     * Test: Vérifie que la méthode normalise correctement les dates
     */
    it("devrait normaliser correctement les dates", async () => {
        
        await DepenseModel.findByPeriod(dateDebut, dateFin);
        
        // Vérifier que les dates sont normalisées dans les requêtes
        const paiementCall = prisma.paiement.aggregate.mock.calls[0][0];
        const depenseCall = prisma.depense.aggregate.mock.calls[0][0];
        
        // Vérifier que la date de début a les heures à 00:00:00
        const debutPaiement = paiementCall.where.date_transaction.gte;
        expect(debutPaiement.getHours()).toBe(0);
        expect(debutPaiement.getMinutes()).toBe(0);
        expect(debutPaiement.getSeconds()).toBe(0);
        
        // Vérifier que la date de fin a les heures à 23:59:59
        const finPaiement = paiementCall.where.date_transaction.lte;
        expect(finPaiement.getHours()).toBe(23);
        expect(finPaiement.getMinutes()).toBe(59);
        expect(finPaiement.getSeconds()).toBe(59);
    });

    /**
     * Test: Vérifie que la méthode calcule correctement le nombre de jours
     */
    it("devrait calculer correctement le nombre de jours dans la période", async () => {
        
        const debut = new Date('2023-01-01');
        const fin = new Date('2023-01-31');
        const result = await DepenseModel.findByPeriod(debut, fin);
        
        
        expect(result.periode.nbJours).toBe(31);
        
        
        const debut2 = new Date('2023-02-15');
        const fin2 = new Date('2023-02-20');
        
        // Réinitialiser les mocks pour éviter les interférences
        jest.clearAllMocks();
        const result2 = await DepenseModel.findByPeriod(debut2, fin2);
        
        
        expect(result2.periode.nbJours).toBe(6);
    });
});