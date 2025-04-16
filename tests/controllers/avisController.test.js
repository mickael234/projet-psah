import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mocks du modèle Avis et Réservation
const mockAvisModel = {
  findAll: jest.fn(),
  findByReservation: jest.fn(),
  findAllByChambre: jest.fn(),
  getAverageRating: jest.fn(),
  findByRating: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const mockReservationModel = {
  getWithRelations: jest.fn()
};

// Mock du controller
const avisController = {
  getAllAvis: async (req, res) => {
    try {
      const avis = await mockAvisModel.findAll();

      if(!avis || avis.length === 0){
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucun avis n'a été trouvé"
        });
      }

      return res.status(200).json({
        status: "OK",
        data: avis
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  getByReservation: async (req, res) => {
    try {
      const id = Number(req.params.idReservation);

      if(isNaN(id) || !id || id <= 0) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "L'id de la réservation est invalide"
        });
      }
      
      const reservationExistante = await mockReservationModel.getWithRelations(id);
      if(!reservationExistante) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "L'id de la réservation est invalide."
        });
      }

      const avisReservation = await mockAvisModel.findByReservation(id);
      if(!avisReservation) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucun avis n'a été trouvé pour cette réservation"
        });
      }

      return res.status(200).json({
        status: "OK",
        data: avisReservation
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  getAvisByChambre: async (req, res) => {
    try {
      const id = Number(req.params.idChambre);

      if(isNaN(id) || !id) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "L'id de la chambre est invalide"
        });
      }
  
      const avisParChambre = await mockAvisModel.findAllByChambre(id);
      if(avisParChambre.length === 0 || !avisParChambre) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucun avis n'a été trouvé pour cette chambre"
        });
      }
  
      return res.status(200).json({
        status: "OK",
        data: avisParChambre
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  getNoteMoyenneAvis: async (req, res) => {
    try {
      const moyenne = await mockAvisModel.getAverageRating();

      return res.status(200).json({
        status: "OK",
        data: moyenne
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  getByNote: async (req, res) => {
    try {
      const note = Number(req.params.note);

      if(note > 5 || note < 1 || isNaN(note) || !note) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
        });
      }

      const avisParNote = await mockAvisModel.findByRating(note);
      if(avisParNote.length === 0 || !avisParNote) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucun avis n'a été trouvé pour cette note"
        });
      }

      return res.status(200).json({
        status: "OK",
        data: avisParNote
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  createAvis: async (req, res) => {
    try {
      const nouvelAvis = req.body;

      if (!nouvelAvis || isNaN(nouvelAvis.note) || nouvelAvis.note < 0 || nouvelAvis.note > 5 || !nouvelAvis.commentaire || nouvelAvis.commentaire.length < 5) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "L'avis n'est pas valide (note ou commentaire insuffisant)."
        });
      }
      
      if(!nouvelAvis.id_reservation || isNaN(nouvelAvis.id_reservation)) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "L'id de la réservation n'est pas valide."
        });
      }
      
      const reservationExistante = await mockReservationModel.getWithRelations(nouvelAvis.id_reservation);
      if(!reservationExistante) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "La réservation spécifiée n'existe pas."
        });
      }

      // Simulation simplifiée pour les tests
      const datesDepart = reservationExistante.chambres ? 
        reservationExistante.chambres.map(chambre => new Date(chambre.date_depart)) : 
        [new Date("2023-05-07T00:00:00.000Z")];
      
      const dateDepartMax = new Date(Math.max(...datesDepart.map(d => d.getTime())));
      const maintenant = new Date();

      if (maintenant < dateDepartMax) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "Vous ne pouvez laisser un avis qu'après la date de départ de votre séjour."
        });
      }

      const avisExistant = await mockAvisModel.findByReservation(nouvelAvis.id_reservation);
      if(avisExistant) {
        return res.status(409).json({
          status: 'CONFLIT',
          message: "Vous ne pouvez pas laisser plusieurs avis sur cette réservation."
        });
      }

      const avisCree = await mockAvisModel.create(nouvelAvis);
      return res.status(201).json({
        status: "OK",
        data: avisCree
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Une erreur interne est survenue lors de la création d'avis."
      });
    }
  },

  answerToAvis: async (req, res) => {
    try {
      const idAvis = Number(req.params.idAvis);
      const avisExistant = await mockAvisModel.findById(idAvis);
      const reponsePersonnel = req.body.reponse;
      const rolePersonnel = req.user.role;

      if(!avisExistant) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Impossible de répondre à cet avis, aucun avis n'a été trouvé."
        });
      }

      if(!reponsePersonnel || reponsePersonnel.length < 5) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "La réponse est invalide (trop courte ou absente)."
        });
      }

      const nouveauCommentaire = `${avisExistant.commentaire?.split('\n\n---\nRéponse du personnel')[0] ?? avisExistant.commentaire ?? ''}\n\n---\nRéponse du personnel : ${reponsePersonnel}\n(Répondu par ${rolePersonnel})`;

      const avisAvecReponse = await mockAvisModel.update(idAvis, nouveauCommentaire);
      return res.status(200).json({
        status: "OK",
        data: avisAvecReponse
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    }
  },

  deleteAvis: async (req, res) => {
    try {
      const id = Number(req.params.idAvis);

      if(isNaN(id) || !id) {
        return res.status(404).json({
          status: 'MAUVAISE DEMANDE',
          message: "L'id de l'avis est invalide"
        });
      }

      const avisExistant = await mockAvisModel.findById(id);
      if(!avisExistant) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Impossible de supprimer cet avis, aucun avis n'a été trouvé."
        });
      }
  
      const avisSupprime = await mockAvisModel.delete(id);
      return res.status(200).json({
        status: "SUPPRIME",
        data: avisSupprime
      });
    } catch (error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue lors de la suppression de cet avis.'
      });
    }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Avis Controller", () => {
  describe("getAllAvis", () => {
    it("devrait retourner tous les avis existants avec un status 200 OK", async () => {
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

      mockAvisModel.findAll.mockResolvedValue(mockAvis);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAllAvis(req, res);

      expect(mockAvisModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'OK',
        data: mockAvis
      });
    });

    it("devrait retourner une erreur 404 si aucun avis a été trouvé", async () => {

      mockAvisModel.findAll.mockResolvedValue([]);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAllAvis(req, res);

      expect(mockAvisModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé"
      });
    });

    it("devrait retourner une erreur 500 en cas d'erreur serveur", async () => {

      mockAvisModel.findAll.mockRejectedValue(new Error("Erreur serveur"));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAllAvis(req, res);

      expect(mockAvisModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    });
  });

  describe("getByReservation", () => {
    it("devrait retourner une erreur 400 si l'id de réservation est invalide", async () => {
      const req = {params: { idReservation: "abc" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "L'id de la réservation est invalide"
      });
    });

    it("devrait retourner l'avis d'une réservation avec un status 200", async () => {
      const mockAvis = {
        id_avis: 3,
        id_reservation: 42,
        note: 4,
        commentaire: "Très bon accueil.",
        date_avis: new Date("2024-11-01T15:00:00Z")
      };

      mockReservationModel.getWithRelations.mockResolvedValue({
        id_reservation: 42,
        id_client: 1,
        date_reservation: new Date("2023-04-09T10:46:15.295Z"),
        etat: "confirmee",
        prix_total: 100,
        chambres: []
      });
      
      mockAvisModel.findByReservation.mockResolvedValue(mockAvis);

      const req = {params: { idReservation: "42" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByReservation(req, res);

      expect(mockReservationModel.getWithRelations).toHaveBeenCalledWith(42);
      expect(mockAvisModel.findByReservation).toHaveBeenCalledWith(42);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: mockAvis
      });
    });

    it("devrait retourner une erreur 404 si aucun avis pour cette réservation", async () => {
      mockReservationModel.getWithRelations.mockResolvedValue({
        id_reservation: 1000,
        chambres: []
      });
      
      mockAvisModel.findByReservation.mockResolvedValue(null);

      const req = {params: { idReservation: "1000" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByReservation(req, res);

      expect(mockReservationModel.getWithRelations).toHaveBeenCalledWith(1000);
      expect(mockAvisModel.findByReservation).toHaveBeenCalledWith(1000);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé pour cette réservation"
      });
    });

    it("devrait retourner une erreur 500 en cas d'erreur serveur", async () => {
      mockReservationModel.getWithRelations.mockRejectedValue(new Error("Erreur DB"));

      const req = {params: { idReservation: "42" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByReservation(req, res);

      expect(mockReservationModel.getWithRelations).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    });
  });

  describe("getAvisByChambre", () => {
    it("devrait retourner une erreur 400 si l'id de la chambre est invalide", async () => {
      const req = {params: { idChambre: "abc" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAvisByChambre(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "L'id de la chambre est invalide"
      });
    });

    it("devrait retourner les avis liés à une chambre", async () => {
      const mockAvis = [{ id_avis: 1, note: 5 }];
      mockAvisModel.findAllByChambre.mockResolvedValue(mockAvis);

      const req = {params: { idChambre: "12" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAvisByChambre(req, res);

      expect(mockAvisModel.findAllByChambre).toHaveBeenCalledWith(12);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: mockAvis
      });
    });

    it("devrait retourner une erreur 404 si aucun avis trouvé", async () => {
      mockAvisModel.findAllByChambre.mockResolvedValue([]);

      const req = {params: { idChambre: "99" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getAvisByChambre(req, res);

      expect(mockAvisModel.findAllByChambre).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé pour cette chambre"
      });
    });
  });

  describe("getNoteMoyenneAvis", () => {
    it("devrait retourner la note moyenne", async () => {
      const moyenne = 4.2;
      mockAvisModel.getAverageRating.mockResolvedValue(moyenne);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getNoteMoyenneAvis(req, res);

      expect(mockAvisModel.getAverageRating).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: moyenne
      });
    });

    it("devrait retourner une erreur 500 en cas d'erreur", async () => {
      mockAvisModel.getAverageRating.mockRejectedValue(new Error("Erreur"));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getNoteMoyenneAvis(req, res);

      expect(mockAvisModel.getAverageRating).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERREUR SERVEUR',
        message: 'Une erreur interne est survenue.'
      });
    });
  });

  describe("getByNote", () => {
    it("devrait retourner une erreur 400 si la note est invalide", async () => {
      const req = {params: { note: "6" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByNote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
      });
    });

    it("devrait retourner les avis filtrés par note", async () => {
      const avis = [
        { 
          id_avis: 1,
          id_reservation: 12,
          note: 4,
          commentaire: "Séjour parfait, chambre propre et calme.",
          date_avis: new Date("2024-10-15T10:24:00Z")
        }
      ];

      mockAvisModel.findByRating.mockResolvedValue(avis);

      const req = {params: { note: "4" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByNote(req, res);

      expect(mockAvisModel.findByRating).toHaveBeenCalledWith(4);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: avis
      });
    });

    it("devrait retourner une erreur 404 si aucun avis avec cette note", async () => {
      mockAvisModel.findByRating.mockResolvedValue([]);

      const req = {params: { note: "2" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.getByNote(req, res);

      expect(mockAvisModel.findByRating).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé pour cette note"
      });
    });
  });

  describe("createAvis", () => {
    it("devrait retourner une erreur 400 si l'avis est invalide (note ou commentaire insuffisant)", async () => {
      const req = {
        body: {
          id_avis: 1,
          id_reservation: 12,
          note: 6, // Note invalide
          commentaire: "Séjour parfait, chambre propre et calme.",
          date_avis: new Date("2024-10-15T10:24:00Z")
        } 
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.createAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "L'avis n'est pas valide (note ou commentaire insuffisant)."
      });
    });

    it("devrait retourner une erreur 409 si un avis existe déjà pour la réservation", async () => {
      // Remplacer la date actuelle pour passer la validation des dates
      const realDateNow = Date.now;
      global.Date.now = jest.fn(() => new Date("2024-10-15").getTime());

      const mockReservation = {
        id_reservation: 12,
        id_client: 1,
        date_reservation: new Date("2023-04-09T10:46:15.295Z"),
        etat: "confirmee",
        prix_total: 100,
        chambres: [
          {
            id_reservation: 12,
            id_chambre: 1,
            date_arrivee: new Date("2023-05-01T00:00:00.000Z"),
            date_depart: new Date("2023-05-07T00:00:00.000Z"),
            chambre: {
              id_chambre: 1,
              numero_chambre: "101",
              type_chambre: "Simple",
              prix_par_nuit: 75,
              etat: "disponible",
              description: "Chambre simple avec un lit simple et vue sur le jardin."
            }
          }
        ]
      };

      mockReservationModel.getWithRelations.mockResolvedValue(mockReservation);
      
      mockAvisModel.findByReservation.mockResolvedValue({
        id_avis: 1,
        id_reservation: 12,
        note: 4,
        commentaire: "Commentaire existant",
      });

      const req = {
        body: {
          id_reservation: 12,
          note: 4,
          commentaire: "Séjour parfait, chambre propre et calme.",
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.createAvis(req, res);
      
      // Restaurer Date.now
      global.Date.now = realDateNow;

      expect(mockReservationModel.getWithRelations).toHaveBeenCalledWith(12);
      expect(mockAvisModel.findByReservation).toHaveBeenCalledWith(12);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        status: 'CONFLIT',
        message: "Vous ne pouvez pas laisser plusieurs avis sur cette réservation."
      });
    });

    it("devrait créer un nouvel avis et retourner un status 201", async () => {
      // Remplace la date actuelle pour passer la validation des dates
      const realDateNow = Date.now;
      global.Date.now = jest.fn(() => new Date("2024-10-15").getTime());

      const mockReservation = {
        id_reservation: 42,
        id_client: 1,
        date_reservation: new Date("2023-04-09T10:46:15.295Z"),
        etat: "confirmee",
        prix_total: 100,
        chambres: [
          {
            id_reservation: 42,
            id_chambre: 1,
            date_arrivee: new Date("2023-05-01T00:00:00.000Z"),
            date_depart: new Date("2023-05-07T00:00:00.000Z"), // Date dans le passé
            chambre: {
              id_chambre: 1,
              numero_chambre: "101",
              type_chambre: "Simple",
              prix_par_nuit: 75,
              etat: "disponible",description: "Chambre simple avec un lit simple et vue sur le jardin."
            }
          }
        ]
      };

      mockReservationModel.getWithRelations.mockResolvedValue(mockReservation);
      mockAvisModel.findByReservation.mockResolvedValue(null);

      const nouvelAvis = {
        id_reservation: 42,
        note: 4,
        commentaire: "Séjour parfait, chambre propre et calme."
      };
      
      const avisCree = { 
        ...nouvelAvis, 
        id_avis: 99, 
        date_avis: new Date("2024-10-15T10:24:00Z") 
      };
      
      mockAvisModel.create.mockResolvedValue(avisCree);

      const req = {body: nouvelAvis};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.createAvis(req, res);
      
      // Restaurer Date.now
      global.Date.now = realDateNow;

      expect(mockAvisModel.create).toHaveBeenCalledWith(nouvelAvis);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: avisCree
      });
    });
  });

  describe("answerToAvis", () => {
    it("devrait retourner 404 si l'avis n'existe pas", async () => {
      mockAvisModel.findById.mockResolvedValue(null);

      const req = {
        params: { idAvis: "1" },
        body: { reponse: "Merci à vous" },
        user: { role: "admin" }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.answerToAvis(req, res);

      expect(mockAvisModel.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'RESSOURCE NON TROUVEE',
        message: "Impossible de répondre à cet avis, aucun avis n'a été trouvé."
      });
    });

    it("devrait retourner 400 si la réponse est trop courte", async () => {
      mockAvisModel.findById.mockResolvedValue({ 
        id_avis: 1, 
        commentaire: "Correct" 
      });

      const req = {
        params: { idAvis: "1" }, 
        body: { reponse: "Ok" }, // Réponse trop courte
        user: { role: "admin" }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.answerToAvis(req, res);

      expect(mockAvisModel.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "La réponse est invalide (trop courte ou absente)."
      });
    });

    it("devrait retourner 200 avec le commentaire mis à jour", async () => {
      const avis = {
        id_avis: 1,
        id_reservation: 42,
        note: 4,
        commentaire: "Bon séjour",
        date_avis: new Date("2024-10-15T10:24:00Z")
      };
      
      const reponse = "Merci pour votre retour";
      const rolePersonnel = "admin";

      const commentaireFinal = `Bon séjour\n\n---\nRéponse du personnel : ${reponse}\n(Répondu par ${rolePersonnel})`;
      
      const avisAvecReponse = { 
        ...avis, 
        commentaire: commentaireFinal 
      };

      mockAvisModel.findById.mockResolvedValue(avis);
      mockAvisModel.update.mockResolvedValue(avisAvecReponse);

      const req = {
        params: { idAvis: "1" }, 
        body: { reponse },
        user: { role: rolePersonnel }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.answerToAvis(req, res);

      expect(mockAvisModel.findById).toHaveBeenCalledWith(1);
      expect(mockAvisModel.update).toHaveBeenCalledWith(1, commentaireFinal);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        data: avisAvecReponse
      });
    });
  });

  describe("deleteAvis", () => {
    it("devrait retourner 404 si l'id de l'avis est invalide", async () => {
      const req = {params: { idAvis: "abc" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.deleteAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'MAUVAISE DEMANDE',
        message: "L'id de l'avis est invalide"
      });
    });

    it("devrait supprimer l'avis et retourner un status 200", async () => {

      mockAvisModel.findById.mockResolvedValue({
        id_avis: 1,
        id_reservation: 42,
        note: 4,
        commentaire: "Commentaire test",
      });
      
      const avisSupprime = { 
        id_avis: 1,
        id_reservation: 42,
        note: 4,
        commentaire: "Séjour parfait, chambre propre et calme.",
        date_avis: new Date("2024-10-15T10:24:00Z") 
      };

      mockAvisModel.delete.mockResolvedValue(avisSupprime);

      const req = {params: { idAvis: "1" }};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await avisController.deleteAvis(req, res);

      expect(mockAvisModel.findById).toHaveBeenCalledWith(1);
      expect(mockAvisModel.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "SUPPRIME",
        data: avisSupprime
      });
    });
  });
});