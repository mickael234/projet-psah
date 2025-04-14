/**
 * Création d'un mock PrismaClient
 */

jest.mock('../../src/config/prisma.js', () => {
    const mockPrisma = {
      avis: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    };
    return {
      __esModule: true,
      default: mockPrisma,
      mockPrisma
    };
  });


import AvisModel from "../../src/models/avis.model.js";
import { mockPrisma } from "../../src/config/prisma.js";



describe("Avis Model", () => {

    /**
     * Test: Retourne une liste des avis de tous les clients
     */

    it("devrait retourner tous les avis de tous les clients", async () => {

        const mockAvis = [
            {
                id_avis: 1,
                id_reservation: 12,
                note: 5,
                commentaire: "Séjour parfait, chambre propre et calme.",
                date_avis: new Date("2024-10-15T10:24:00Z")
            },
            {
                id_avis: 2,
                id_reservation: 18,
                note: 3,
                commentaire: "Correct, mais un peu bruyant le soir.",
                date_avis: new Date("2025-01-08T17:45:00Z")
            }
        ];

        mockPrisma.avis.findMany.mockResolvedValue(mockAvis);
        const result = await AvisModel.findAll();

        expect(result).toEqual(mockAvis);
        expect(mockPrisma.avis.findMany).toHaveBeenCalledWith();

    }),

    /**
     * Test: Retourne un avis d'un client concernant une réservation
     */

    it("devrait retourner l'avis d'un client lors d'une réservation", async ()=> {
        const mockAvis = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        }

        mockPrisma.avis.findUnique.mockResolvedValue(mockAvis);
        const result = await AvisModel.findByReservation(12);

        expect(result).toEqual(mockAvis);
        expect(mockPrisma.avis.findUnique).toHaveBeenCalledWith({
            where: { id_reservation: 12 }
        })
    }),

    /**
     * Test: Retourne un avis par son ID
     */

    it("devrait retourner un avis par son ID", async () => {
        const mockAvis = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        }

        mockPrisma.avis.findUnique.mockResolvedValue(mockAvis);
        const result = await AvisModel.findById(1);

        expect(result).toEqual(mockAvis);
        expect(mockPrisma.avis.findUnique).toHaveBeenCalledWith({
            where : {
                id_avis: 1
            }
        })
    }),

    /** 
     * Test : Retourne une liste d'avis par chambre
     */

    it("devrait retourner une liste d'avis par chambre", async ()=> {
        const mockAvis = [
            {
                id_avis: 12,
                id_reservation: 34,
                note: 5,
                commentaire: "Chambre impeccable !",
                date_avis: "2025-04-10T08:30:00.000Z",
                reservation: {
                  chambres: [
                    { id_chambre: 7 }
                  ],
                  client: {
                    prenom: "Sophie",
                    nom: "Durand",
                    utilisateur: {
                      id_utilisateur: 42,
                      nom_utilisateur: "sophieD",
                      role: "client"
                    }
                  }
                }
              }
        ]

        mockPrisma.avis.findMany.mockResolvedValue(mockAvis);
        const result = await AvisModel.findAllByChambre(7);

        expect(result).toEqual(mockAvis);
        expect(mockPrisma.avis.findMany).toHaveBeenCalledWith({
            where: {
                reservation: {
                    chambres: {
                        some: {
                            id_chambre: 7
                        }
                    }
                }
            },
            include: {
                reservation: {
                    include: {
                        chambres: {
                            select: {
                                id_chambre: true
                            }
                        },
                        client: {
                            select: {
                                prenom: true,
                                nom: true,
                                utilisateur: {
                                    select: {
                                        id_utilisateur: true,
                                        nom_utilisateur: true,
                                        role: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }),

    /** 
     * Test : Calcul de la moyenne des notes
     */
    it("devrait renvoyer la moyenne des notes", async () => {
        const mockAverage = { _avg: { note: 4.2 } };
        mockPrisma.avis.aggregate.mockResolvedValue(mockAverage);

        const result = await AvisModel.getAverageRating();

        expect(result).toBe(4.2);
        expect(mockPrisma.avis.aggregate).toHaveBeenCalledWith({
            _avg: {
                note: true
            }
        });
    }),

     /** 
      * Test : Renvoie une moyenne de 0 si aucun avis n'est trouvé 
     */

    it("devrait renvoyer une moyenne de 0 si aucun avis n'est trouvé", async () => {

        const mockAverage = { _avg: { note: null } };
        mockPrisma.avis.aggregate.mockResolvedValue(mockAverage);

        const result = await AvisModel.getAverageRating();

        expect(result).toBe(0);
        expect(mockPrisma.avis.aggregate).toHaveBeenCalledWith({
            _avg: {
                note: true
            }
        });
    }),

    /** 
     * Test : Création d'un nouvel avis
    */
    it("devrait créer un nouvel avis", async () => {
        const nouvelAvis = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        };

        const mockAvisCree = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        };

        mockPrisma.avis.create.mockResolvedValue(mockAvisCree);
        const result = await AvisModel.create(nouvelAvis);

        expect(result).toEqual(mockAvisCree);
        expect(mockPrisma.avis.create).toHaveBeenCalledWith({
            data: nouvelAvis
        });
    }),

    /** 
     * Test : Mise à jour d'un avis avec une réponse du personnel
    */

    it("devrait mettre à jour un avis avec une réponse", async () => {
        const idAvis = 1;
        const reponse = "Merci pour votre retour!";
        const mockAvisMisAJour = {
            id_avis: idAvis,
            commentaire: reponse
        };

        mockPrisma.avis.update.mockResolvedValue(mockAvisMisAJour);

        const result = await AvisModel.update(idAvis, reponse);

        expect(result).toEqual(mockAvisMisAJour);
        expect(mockPrisma.avis.update).toHaveBeenCalledWith({
            where: { id_avis: idAvis },
            data: { commentaire: reponse }
        });
    }),

    /** 
     * Test : Suppression d'un avis 
    */

    it("devrait supprimer un avis", async () => {
        const mockAvisSupprime = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        };

        mockPrisma.avis.delete.mockResolvedValue(mockAvisSupprime);

        const result = await AvisModel.delete(1);
        expect(result).toEqual(mockAvisSupprime);
        expect(mockPrisma.avis.delete).toHaveBeenCalledWith({
            where: { id_avis: 1 }
        });
    });
})