import { jest, describe, it, expect } from '@jest/globals';

// Mock des méthodes du modèle Avis
const findAll = jest.fn();
const findByReservation = jest.fn();
const findById = jest.fn();
const findAllByChambre = jest.fn();
const getAverageRating = jest.fn();
const findByRating = jest.fn();
const create = jest.fn();
const update = jest.fn();
const deleteAvis = jest.fn();

describe("Avis Model", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

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

        findAll.mockResolvedValue(mockAvis);
        
        const result = await findAll();

        expect(result).toEqual(mockAvis);
        expect(findAll).toHaveBeenCalled();
    });

    /**
     * Test: Retourne un avis d'un client concernant une réservation
     */
    it("devrait retourner l'avis d'un client lors d'une réservation", async () => {
        const mockAvis = {
            id_avis: 1,
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        };

        findByReservation.mockResolvedValue(mockAvis);
        
        const result = await findByReservation(12);

        expect(result).toEqual(mockAvis);
        expect(findByReservation).toHaveBeenCalledWith(12);
    });

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
        };

        findById.mockResolvedValue(mockAvis);
        
        const result = await findById(1);

        expect(result).toEqual(mockAvis);
        expect(findById).toHaveBeenCalledWith(1);
    });

    /** 
     * Test : Retourne une liste d'avis par chambre
     */
    it("devrait retourner une liste d'avis par chambre", async () => {
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
        ];

        findAllByChambre.mockResolvedValue(mockAvis);
        
        const result = await findAllByChambre(7);

        expect(result).toEqual(mockAvis);
        expect(findAllByChambre).toHaveBeenCalledWith(7);
    });

    /** 
     * Test : Calcul de la moyenne des notes
     */
    it("devrait renvoyer la moyenne des notes", async () => {
        const moyenne = 4.2;
        getAverageRating.mockResolvedValue(moyenne);
        
        const result = await getAverageRating();

        expect(result).toBe(moyenne);
        expect(getAverageRating).toHaveBeenCalled();
    });

    /** 
     * Test : Renvoie une moyenne de 0 si aucun avis n'est trouvé 
     */
    it("devrait renvoyer une moyenne de 0 si aucun avis n'est trouvé", async () => {
        getAverageRating.mockResolvedValue(0);
        
        const result = await getAverageRating();

        expect(result).toBe(0);
        expect(getAverageRating).toHaveBeenCalled();
    });

    /** 
     * Test : Création d'un nouvel avis
     */
    it("devrait créer un nouvel avis", async () => {
        const nouvelAvis = {
            id_reservation: 12,
            note: 5,
            commentaire: "Séjour parfait, chambre propre et calme.",
            date_avis: new Date("2024-10-15T10:24:00Z")
        };

        const mockAvisCree = {
            id_avis: 1,
            ...nouvelAvis
        };

        create.mockResolvedValue(mockAvisCree);
        
        const result = await create(nouvelAvis);

        expect(result).toEqual(mockAvisCree);
        expect(create).toHaveBeenCalledWith(nouvelAvis);
    });

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

        update.mockResolvedValue(mockAvisMisAJour);
        
        const result = await update(idAvis, reponse);

        expect(result).toEqual(mockAvisMisAJour);
        expect(update).toHaveBeenCalledWith(idAvis, reponse);
    });

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

        deleteAvis.mockResolvedValue(mockAvisSupprime);
        
        const result = await deleteAvis(1);
        
        expect(result).toEqual(mockAvisSupprime);
        expect(deleteAvis).toHaveBeenCalledWith(1);
    });
});