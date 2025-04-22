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
            total: 2
        });
    })

})