// __tests__/controllers/communicationController.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as communicationController from "../../src/controllers/communicationController.js";

// Mocker la classe CommunicationModel et ses méthodes de prototype
jest.mock("../../src/models/communication.model.js", () => {
  // Créer un constructeur mock
  const MockCommunicationModel = jest.fn();
  
  // Ajouter des méthodes mock au prototype
  MockCommunicationModel.prototype.create = jest.fn();
  MockCommunicationModel.prototype.findAll = jest.fn();
  MockCommunicationModel.prototype.findById = jest.fn();
  MockCommunicationModel.prototype.repondre = jest.fn();
  MockCommunicationModel.prototype.getNonLus = jest.fn();
  MockCommunicationModel.prototype.updateStatut = jest.fn();
  MockCommunicationModel.prototype.getByDepartement = jest.fn();
  
  return {
    __esModule: true,
    default: MockCommunicationModel
  };
});

// Importer le modèle mocké pour accéder au constructeur
import CommunicationModel from "../../src/models/communication.model.js";

// Mocker le RoleMapper pour les vérifications d'autorisation
jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn().mockReturnValue(true)
  },
}));

describe("Communication Controller", () => {
  let req, res;
  
  // Cette variable contiendra l'instance du modèle avec les méthodes mockées
  let mockModelInstance;

  beforeEach(() => {
    // Réinitialiser tous les mocks
    jest.clearAllMocks();
    
    // Créer une nouvelle instance du modèle mocké
    mockModelInstance = new CommunicationModel();

    // Mocker la requête et la réponse
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        role: "ADMIN_GENERAL",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Tests pour la création de messages
  describe("creerCommunication", () => {
    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange - Préparer les données de test
      req.body = { sujet: "Test" }; // Contenu et destinataire manquants

      // Act - Exécuter la fonction à tester
      await communicationController.creerCommunication(req, res);

      // Assert - Vérifier les résultats
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Sujet, contenu et destinataire (utilisateur ou département) sont requis",
      });
      expect(mockModelInstance.create).not.toHaveBeenCalled();
    });

    it("devrait créer un message avec succès", async () => {
      // Arrange
      req.body = {
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_destinataire: 2,
        priorite: "HAUTE",
      };

      const mockMessage = {
        id_communication: 1,
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_expediteur: 1,
        id_destinataire: 2,
        departement_expediteur: "ADMINISTRATION",
        priorite: "HAUTE",
        date_creation: new Date(),
      };

      mockModelInstance.create.mockResolvedValue(mockMessage);

      // Act
      await communicationController.creerCommunication(req, res);

      // Assert
      expect(mockModelInstance.create).toHaveBeenCalledWith({
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_expediteur: 1,
        id_destinataire: 2,
        departement_expediteur: "ADMINISTRATION",
        departement_destinataire: undefined,
        priorite: "HAUTE",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Message envoyé avec succès",
        data: mockMessage,
      });
    });

    it("devrait créer un message avec un département destinataire", async () => {
      // Arrange
      req.body = {
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        departement_destinataire: "MAINTENANCE",
        priorite: "HAUTE",
      };

      const mockMessage = {
        id_communication: 1,
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_expediteur: 1,
        departement_expediteur: "ADMINISTRATION",
        departement_destinataire: "MAINTENANCE",
        priorite: "HAUTE",
        date_creation: new Date(),
      };

      mockModelInstance.create.mockResolvedValue(mockMessage);

      // Act
      await communicationController.creerCommunication(req, res);

      // Assert
      expect(mockModelInstance.create).toHaveBeenCalledWith({
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_expediteur: 1,
        id_destinataire: undefined,
        departement_expediteur: "ADMINISTRATION",
        departement_destinataire: "MAINTENANCE",
        priorite: "HAUTE",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Message envoyé avec succès",
        data: mockMessage,
      });
    });

    it("devrait gérer les erreurs lors de la création d'un message", async () => {
      // Arrange
      req.body = {
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_destinataire: 2,
        priorite: "HAUTE",
      };

      // Simuler une erreur lors de la création
      mockModelInstance.create.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.creerCommunication(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de l'envoi du message",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la récupération de tous les messages
  describe("listerCommunications", () => {
    it("devrait récupérer tous les messages avec pagination", async () => {
      // Arrange
      req.query = { page: "1", limit: "10" };
      
      const mockMessages = [
        {
          id_communication: 1,
          sujet: "Problème de plomberie chambre 101",
          contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
          id_expediteur: 2,
          id_destinataire: 1,
          statut: "NON_LU",
          date_creation: new Date(),
        },
        {
          id_communication: 2,
          sujet: "Demande de fournitures",
          contenu: "Besoin de serviettes supplémentaires pour le 3ème étage.",
          id_expediteur: 3,
          id_destinataire: 1,
          statut: "LU",
          date_creation: new Date(),
        },
      ];

      mockModelInstance.findAll.mockResolvedValue(mockMessages);

      // Act
      await communicationController.listerCommunications(req, res);

      // Assert
      expect(mockModelInstance.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          OR: expect.arrayContaining([
            { id_expediteur: 1 },
            { id_destinataire: 1 }
          ])
        }),
        1,
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Messages récupérés avec succès",
        data: mockMessages,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des messages", async () => {
      // Arrange
      mockModelInstance.findAll.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.listerCommunications(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des messages",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la récupération des messages non lus
  describe("getMessagesNonLus", () => {
    it("devrait récupérer les messages non lus", async () => {
      // Arrange
      const mockMessages = [
        {
          id_communication: 1,
          sujet: "Problème de plomberie chambre 101",
          contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
          id_expediteur: 2,
          id_destinataire: 1,
          statut: "NON_LU",
          date_creation: new Date(),
        },
      ];

      mockModelInstance.getNonLus.mockResolvedValue(mockMessages);

      // Act
      await communicationController.getMessagesNonLus(req, res);

      // Assert
      expect(mockModelInstance.getNonLus).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Messages non lus récupérés avec succès",
        data: {
          count: 1,
          messages: mockMessages,
        },
      });
    });

    it("devrait gérer les erreurs lors de la récupération des messages non lus", async () => {
      // Arrange
      mockModelInstance.getNonLus.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.getMessagesNonLus(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des messages non lus",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la récupération d'un message spécifique
  describe("getCommunicationById", () => {
    it("devrait récupérer un message spécifique", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockMessage = {
        id_communication: 1,
        sujet: "Problème de plomberie chambre 101",
        contenu: "La douche de la chambre 101 fuit. Merci d'intervenir rapidement.",
        id_expediteur: 2,
        id_destinataire: 1,
        statut: "NON_LU",
        date_creation: new Date(),
        reponses: [],
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);

      // Act
      await communicationController.getCommunicationById(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Message récupéré avec succès",
        data: mockMessage,
      });
    });

    it("devrait retourner 404 si le message n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      mockModelInstance.findById.mockResolvedValue(null);

      // Act
      await communicationController.getCommunicationById(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Message non trouvé",
      });
    });

    it("devrait gérer les erreurs lors de la récupération d'un message", async () => {
      // Arrange
      req.params = { id: "1" };
      mockModelInstance.findById.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.getCommunicationById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération du message",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour répondre à un message
  describe("repondreCommunication", () => {
    it("devrait répondre à un message avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        contenu: "Je m'en occupe immédiatement. Je serai sur place dans 15 minutes."
      };
      
      const mockMessage = {
        id_communication: 1,
        sujet: "Problème de plomberie chambre 101",
        id_expediteur: 2,
        id_destinataire: 1,
      };

      const mockReponse = {
        id_reponse: 1,
        id_communication: 1,
        id_expediteur: 1,
        contenu: "Je m'en occupe immédiatement. Je serai sur place dans 15 minutes.",
        date_creation: new Date(),
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);
      mockModelInstance.repondre.mockResolvedValue(mockReponse);

      // Act
      await communicationController.repondreCommunication(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(mockModelInstance.repondre).toHaveBeenCalledWith(1, {
        contenu: "Je m'en occupe immédiatement. Je serai sur place dans 15 minutes.",
        id_expediteur: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Réponse envoyée avec succès",
        data: mockReponse,
      });
    });

    it("devrait retourner 400 si le contenu est manquant", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {}; // Contenu manquant

      // Act
      await communicationController.repondreCommunication(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Le contenu de la réponse est requis",
      });
      expect(mockModelInstance.repondre).not.toHaveBeenCalled();
    });

    it("devrait retourner 404 si le message n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      req.body = {
        contenu: "Je m'en occupe immédiatement. Je serai sur place dans 15 minutes."
      };
      
      mockModelInstance.findById.mockResolvedValue(null);

      // Act
      await communicationController.repondreCommunication(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Message parent non trouvé",
      });
      expect(mockModelInstance.repondre).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs lors de l'envoi d'une réponse", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        contenu: "Je m'en occupe immédiatement. Je serai sur place dans 15 minutes."
      };
      
      const mockMessage = {
        id_communication: 1,
        sujet: "Problème de plomberie chambre 101",
        id_expediteur: 2,
        id_destinataire: 1,
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);
      mockModelInstance.repondre.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.repondreCommunication(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de l'envoi de la réponse",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour marquer un message comme lu
  describe("marquerCommeLu", () => {
    it("devrait marquer un message comme lu avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockMessage = {
        id_communication: 1,
        id_destinataire: 1,
        statut: "NON_LU",
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);
      mockModelInstance.updateStatut.mockResolvedValue({
        ...mockMessage,
        statut: "LU",
      });

      // Act
      await communicationController.marquerCommeLu(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(mockModelInstance.updateStatut).toHaveBeenCalledWith(1, "LU");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Message marqué comme lu avec succès",
      });
    });

    it("devrait retourner 404 si le message n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      mockModelInstance.findById.mockResolvedValue(null);

      // Act
      await communicationController.marquerCommeLu(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Message non trouvé",
      });
      expect(mockModelInstance.updateStatut).not.toHaveBeenCalled();
    });

    it("devrait retourner 403 si l'utilisateur n'est pas le destinataire", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockMessage = {
        id_communication: 1,
        id_destinataire: 2, // Un autre utilisateur
        statut: "NON_LU",
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);

      // Act
      await communicationController.marquerCommeLu(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à marquer ce message comme lu",
      });
      expect(mockModelInstance.updateStatut).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs lors de la mise à jour du statut", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockMessage = {
        id_communication: 1,
        id_destinataire: 1,
        statut: "NON_LU",
      };

      mockModelInstance.findById.mockResolvedValue(mockMessage);
      mockModelInstance.updateStatut.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.marquerCommeLu(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors du marquage du message comme lu",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour récupérer les messages par département
  describe("getMessagesByDepartement", () => {
    it("devrait récupérer les messages d'un département", async () => {
      // Arrange
      req.params = { departement: "MAINTENANCE" };
      
      const mockMessages = [
        {
          id_communication: 1,
          sujet: "Problème de plomberie chambre 101",
          departement_destinataire: "MAINTENANCE",
          date_creation: new Date(),
        },
      ];

      mockModelInstance.getByDepartement.mockResolvedValue(mockMessages);

      // Act
      await communicationController.getMessagesByDepartement(req, res);

      // Assert
      expect(mockModelInstance.getByDepartement).toHaveBeenCalledWith("MAINTENANCE");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Messages du département MAINTENANCE récupérés avec succès",
        data: mockMessages,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des messages par département", async () => {
      // Arrange
      req.params = { departement: "MAINTENANCE" };
      mockModelInstance.getByDepartement.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await communicationController.getMessagesByDepartement(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des messages du département",
        error: "Erreur de base de données",
      });
    });
  });
});