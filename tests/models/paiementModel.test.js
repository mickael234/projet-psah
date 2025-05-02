import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import PaiementModel from '../../src/models/paiement.model.js';


describe("Paiement Model", () => {

    /**
     * Configuration avant chaque test
     * - Mock des fonctions Prisma 
     * - Chaque fonction mockée retourne une valeur par défaut
     */

    beforeEach(() => {
        jest.spyOn(prisma.paiement, 'findMany').mockImplementation(() => Promise.resolve([]));
        jest.spyOn(prisma.paiement, 'aggregate').mockImplementation(() => Promise.resolve({ _sum: { montant: 0 } }));
        jest.spyOn(prisma.paiement, "findUnique").mockImplementation(() => Promise.resolve({}));
        jest.spyOn(prisma.paiement, 'count').mockImplementation(() => Promise.resolve(0));
        jest.spyOn(prisma.reservation, 'findUnique').mockImplementation(() => Promise.resolve({}))
        jest.spyOn(prisma.reservation, 'update');
        jest.spyOn(prisma.paiement, 'findMany');
        jest.spyOn(prisma.paiement, 'create');
        jest.spyOn(prisma.paiement, 'createMany');
        jest.spyOn(prisma.paiement, 'findFirst');
        jest.spyOn(prisma.paiement, 'update');
        jest.spyOn(prisma.paiement, 'aggregate');
        
        
        jest.spyOn(prisma, '$transaction').mockImplementation(callback => callback(prisma));
        
        // Espions sur les méthodes statiques de PaiementModel
        jest.spyOn(PaiementModel, 'mettreAJourEtatPaiement');
        jest.spyOn(PaiementModel, 'findEcheancePrecedente');
        jest.spyOn(PaiementModel, 'updatePaiement');
    });

    
    /**
     * Nettoyage après chaque test
     * - Réinitialise tous les mocks pour éviter les interférences entre les tests
     */
    
    afterEach(() => {
        jest.clearAllMocks();
    });


    /**
     * Test : Vérifie la liste des paiements associés à une réservation spécifique est retournée  
     */
    it("devrait retourner une liste de paiements selon l'id de la réservation", async () => {
        const mockPaiements = [
            {
                id_paiement: 1,
                id_reservation: 5,      
                montant : 500.00,
                methode_paiement: "carte",
                etat: "en_attente"
            }
        ]

        prisma.paiement.findMany.mockResolvedValue(mockPaiements);
        const result = await PaiementModel.findByReservation(5);

        expect(prisma.paiement.findMany).toHaveBeenCalledWith({where: { id_reservation: 5 }});
        expect(result).toEqual(mockPaiements);
    }),

    /**
     * Test : Vérifie que le montant total des paiements complétés pour une réservation est calculé correctement 
     */

    it("devrait calculer le total des paiements d'une réservation", async () => {
        prisma.paiement.aggregate.mockResolvedValue({
            _sum: {
                montant: 750.00
            }
        });
        const result = await PaiementModel.getTotalPaiements(5);
        
        expect(prisma.paiement.aggregate).toHaveBeenCalledWith({
            where: {
                id_reservation: 5,
                etat: 'complete'
            },
            _sum: {
                montant: true
            }
        });
        expect(result).toBe(750.00);
    }),

    /**
     * Test : Vérifie si une réservation a été entièrement payée 
     */

    it("devrait retourner si une reservation a été entièrement payée", async ()=> {

        prisma.paiement.aggregate.mockResolvedValue({
            _sum: {
                montant: 200.00
            }
        });
        prisma.reservation.findUnique.mockResolvedValue({
            id_reservation: 5,
            id_client: 1,
            date_reservation: "2025-04-15T10:39:53.053Z",
            etat: "confirmee",
            prix_total: 500,
            etat_paiement: "complete",
            source_reservation: "site_web",
            id_reservation_externe: null,
            supprime_le: null
        })

        const isPayed = await PaiementModel.isReservationPaid(5);

        expect(prisma.paiement.aggregate).toHaveBeenCalledWith({
            where: {
                id_reservation: 5,
                etat: 'complete'
            },
            _sum: {
                montant: true
            }
        });
        expect(isPayed).toBe(false);

    }),

    /**
     * Test : Vérifie qu'un rapport financier contenant les transactions effectuées pendant une période donnée la méthode est générée
     */

    it("devrait retourner un rapport financier selon les dates indiquées", async () => {
        const dateMin = "2023-01-01";
        const dateMax = "2023-12-31";

        const mockTransactions = [
            {
                id_paiement: 1,
                id_reservation: 5,
                montant: 500.00,
                methode_paiement: "carte",
                etat: "complete",
                date_transaction: new Date("2023-06-15"),
                reservation: {
                    client: {
                        prenom: "Jean",
                        nom: "Dupont"
                    }
                }
            },
            {
                id_paiement: 2,
                id_reservation: 6,
                montant: 300.00,
                methode_paiement: "virement",
                etat: "complete",
                date_transaction: new Date("2023-08-20"),
                reservation: {
                    client: {
                        prenom: "Marie",
                        nom: "Durand"
                    }
                }
            }
        ];

        prisma.paiement.findMany.mockResolvedValue(mockTransactions);
        prisma.paiement.count.mockResolvedValue(2);
        prisma.paiement.aggregate.mockResolvedValue({
            _sum: {
                montant: 800.00
            }
        });

        const rapport = await PaiementModel.getRapportFinancier(dateMin, dateMax);
    

        expect(prisma.paiement.findMany).toHaveBeenCalledWith({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: expect.any(Date),
                    gte: expect.any(Date)
                }
            },
            include: {
                reservation: {
                    include: {
                        client: {
                            select: {
                                prenom: true,
                                nom: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { montant: "asc" }
            ]
        });
    
    
        expect(prisma.paiement.count).toHaveBeenCalledWith({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: expect.any(Date),
                    gte: expect.any(Date)
                }
            }
        });
    
        expect(rapport).toEqual({
            data: mockTransactions,
            totalMontant: 800.00,
            totalTransactions: 2
        });
    }),

    /**
     * Test : Vérifie que le revenu total est retourné
     */
    it("devrait retourner le revenu total", async () => {
        prisma.paiement.aggregate.mockResolvedValue({
            _sum: {
                montant: 1000.00
            }
        });

        const result = await PaiementModel.getRevenuTotal();

        expect(prisma.paiement.aggregate).toHaveBeenCalledWith({ 
            _sum: { montant: true }, 
            where: { etat: "complete" } 
        })
        expect(result).toBe(1000.00)
    })

    it('devrait récupérer les paiements en retard', async () => {
        // Préparation des données de test
        const paiementsEnRetard = [
        {
            id_paiement: 1,
            montant: 100,
            etat: 'en_attente',
            date_echeance: new Date('2024-01-01'),
            reservation: {
            idReservation: 1,
            client: {
                prenom: 'Jean',
                nom: 'Dupont'
            }
            }
        }
        ];

        // Configuration du mock avec l'espion
        prisma.paiement.findMany.mockResolvedValue(paiementsEnRetard);

        // Exécution de la méthode à tester
        const result = await PaiementModel.findPaiementsEnRetard();

        // Vérifications
        expect(prisma.paiement.findMany).toHaveBeenCalledWith({
        where: {
            etat: {
            in: ['en_attente', 'echoue']
            },
            date_echeance: {
            lt: expect.any(Date)
            }
        },
        include: {
            reservation: {
            select: {
                idReservation: true,
                include: {
                client: {
                    select: {
                    prenom: true,
                    nom: true
                    }
                }
                }
            }
            }
        }
        });
        expect(result).toEqual(paiementsEnRetard);
    });


    it('devrait créer un paiement unique', async () => {
        // Données de test
        const paiementData = {
        id_reservation: 1,
        montant: 200,
        methode_paiement: 'carte',
        reference_transaction: 'REF123',
        etat: 'complete',
        numero_echeance: null,
        total_echeances: null,
        notes: 'Test'
        };

        const reservation = {
        id_reservation: 1,
        prix_total: 200
        };

        const paiementCree = {
        id_paiement: 1,
        ...paiementData,
        date_transaction: new Date(),
        date_echeance: new Date()
        };

        // Configuration des mocks avec les espions
        prisma.reservation.findUnique.mockResolvedValue(reservation);
        prisma.paiement.create.mockResolvedValue(paiementCree);
        
        // Espion sur la méthode qui sera appelée par creerPaiementAvecEcheances
        PaiementModel.mettreAJourEtatPaiement.mockResolvedValue(undefined);

        // Exécution de la méthode à tester
        const result = await PaiementModel.creerPaiementAvecEcheances(paiementData);

        // Vérifications
        expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
        where: { id_reservation: 1 }
        });
        
        expect(prisma.paiement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
            id_reservation: 1,
            montant: 200,
            methode_paiement: 'carte',
            etat: 'complete',
            total_echeances: 1
        })
        });
        
        expect(PaiementModel.mettreAJourEtatPaiement).toHaveBeenCalledWith(prisma, 1);
        expect(result).toEqual({ type: 'single', paiement: paiementCree });
    });

    it('devrait créer un paiement échelonné', async () => {
        // Données de test
        const paiementData = {
        id_reservation: 1,
        montant: 300,
        methode_paiement: 'carte',
        reference_transaction: 'REF456',
        etat: 'en_attente',
        numero_echeance: 1,
        total_echeances: 3,
        notes: 'Paiement échelonné'
        };

        const reservation = {
        id_reservation: 1,
        prix_total: 300
        };

        // Configuration des mocks avec les espions
        prisma.reservation.findUnique.mockResolvedValue(reservation);
        prisma.paiement.createMany.mockResolvedValue({ count: 3 });
        
        // Espion sur la méthode qui sera appelée par creerPaiementAvecEcheances
        PaiementModel.mettreAJourEtatPaiement.mockResolvedValue(undefined);

        // Exécution de la méthode à tester
        const result = await PaiementModel.creerPaiementAvecEcheances(paiementData);

        // Vérifications
        expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
        where: { id_reservation: 1 }
        });
        
        expect(prisma.paiement.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
            expect.objectContaining({
            id_reservation: 1,
            montant: 100,
            etat: 'complete',
            numero_echeance: 1
            }),
            expect.objectContaining({
            id_reservation: 1,
            montant: 100,
            etat: 'en_attente',
            numero_echeance: 2
            }),
            expect.objectContaining({
            id_reservation: 1,
            montant: 100,
            etat: 'en_attente',
            numero_echeance: 3
            })
        ])
        });
        
        expect(PaiementModel.mettreAJourEtatPaiement).toHaveBeenCalledWith(prisma, 1);
        expect(result.type).toBe('multiple');
        expect(result.paiements.length).toBe(3);
    });
    

    it('devrait mettre à jour un paiement échelonné', async () => {
        // Données de test
        const id_paiement = 2;
        const paiement = {
        id_paiement: 2,
        id_reservation: 1,
        montant: 100,
        etat: 'en_attente',
        numero_echeance: 2,
        total_echeances: 3
        };
        
        const echeancePrecedente = {
        id_paiement: 1,
        id_reservation: 1,
        etat: 'complete',
        numero_echeance: 1
        };
        
        const dataUpdate = {
        etat: 'complete',
        montant: 100
        };

        // Configuration des mocks avec les espions
        prisma.paiement.findUnique.mockResolvedValue(paiement);
        prisma.paiement.findFirst.mockResolvedValue(echeancePrecedente);
        prisma.paiement.update.mockResolvedValue({...paiement, ...dataUpdate, date_transaction: expect.any(Date)});
        
        // Espion sur la méthode qui sera appelée par mettreAJourPaiementEcheance
        PaiementModel.mettreAJourEtatPaiement.mockResolvedValue(undefined);

        // Exécution de la méthode à tester
        const result = await PaiementModel.mettreAJourPaiementEcheance(prisma, id_paiement, dataUpdate);

        // Vérifications
        expect(prisma.paiement.findUnique).toHaveBeenCalledWith({
        where: { id_paiement: 2 }
        });
        
        expect(prisma.paiement.findFirst).toHaveBeenCalledWith({
        where: {
            id_reservation: 1,
            numero_echeance: 1
        }
        });
        
        expect(prisma.paiement.update).toHaveBeenCalledWith({
        where: { id_paiement: 2 },
        data: {
            ...dataUpdate,
            date_transaction: expect.any(Date)
        }
        });
        
        expect(PaiementModel.mettreAJourEtatPaiement).toHaveBeenCalledWith(prisma, 1);
    });
    
    it('devrait rejeter si l\'échéance précédente n\'est pas complète', async () => {
        // Données de test
        const id_paiement = 2;
        const paiement = { /* ... */ };
        const echeancePrecedente = { /* ... */ };
        const dataUpdate = { /* ... */ };
        
        // Mocks
        prisma.paiement.findUnique.mockResolvedValue(paiement);
        prisma.paiement.findFirst.mockResolvedValue(echeancePrecedente);
        
        // Test
        let errorThrown = false;
        try {
            await PaiementModel.mettreAJourPaiementEcheance(prisma, id_paiement, dataUpdate);
        } catch (error) {
            errorThrown = true;
            expect(error.message).toBe("Ce paiement n'est pas dans un échéancier.");
        }
        
        expect(errorThrown).toBe(true);
        expect(prisma.paiement.update).not.toHaveBeenCalled();
    });

    it('devrait trouver l\'échéance précédente', async () => {
        // Données de test
        const id_reservation = 1;
        const numero_echeance = 2;
        const echeancePrecedente = {
        id_paiement: 1,
        id_reservation: 1,
        numero_echeance: 1,
        etat: 'complete'
        };

        // Configuration du mock avec l'espion
        prisma.paiement.findFirst.mockResolvedValue(echeancePrecedente);

        // Exécution de la méthode à tester
        const result = await PaiementModel.findEcheancePrecedente(prisma, id_reservation, numero_echeance);

        // Vérifications
        expect(prisma.paiement.findFirst).toHaveBeenCalledWith({
        where: {
            id_reservation: 1,
            numero_echeance: 1
        }
        });
        expect(result).toEqual(echeancePrecedente);
    });

    it('devrait mettre à jour un paiement', async () => {
        // Données de test
        const id_paiement = 1;
        const data = {
        etat: 'complete',
        date_transaction: new Date()
        };
        const paiementMisAJour = {
        id_paiement: 1,
        ...data
        };

        // Configuration du mock avec l'espion
        prisma.paiement.update.mockResolvedValue(paiementMisAJour);

        // Exécution de la méthode à tester
        const result = await PaiementModel.updatePaiement(prisma, id_paiement, data);

        // Vérifications
        expect(prisma.paiement.update).toHaveBeenCalledWith({
        where: { id_paiement: 1 },
        data
        });
        expect(result).toEqual(paiementMisAJour);
    });


})