// __tests__/controllers/nettoyageController.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import NettoyageController from "../../src/controllers/nettoyageController.js";
import NettoyageModel from "../../src/models/nettoyage.model.js";
import prisma from "../../src/config/prisma.js";
import { RoleMapper } from "../../src/utils/roleMapper.js";

// Mock dependencies
jest.mock("../../src/models/nettoyage.model.js", () => ({
  create: jest.fn(),
  enregistrerFournituresUtilisees: jest.fn(),
  getHistoriqueByChambre: jest.fn(),
}));

jest.mock("../../src/config/prisma.js", () => ({
  chambre: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  journalModifications: {
    create: jest.fn(),
  },
  nettoyage: {
    count: jest.fn(),
  },
}));

jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn(),
  },
}));

describe("NettoyageController", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        role: "MAINTENANCE",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("enregistrerNettoyage", () => {
    it("devrait retourner 403 si l'utilisateur n'a pas les permissions", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(false);

      // Act
      await NettoyageController.enregistrerNettoyage(req, res);

      // Assert
      expect(RoleMapper.hasAuthorizedRole).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour enregistrer un nettoyage",
      });
    });

    it("devrait retourner 400 si l'ID de la chambre est manquant", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true);
      req.params = {};

      // Act
      await NettoyageController.enregistrerNettoyage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "L'ID de la chambre est requis",
      });
    });

    it("devrait retourner 404 si la chambre n'est pas trouvée", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true);
      req.params = { id_chambre: "999" };
      prisma.chambre.findUnique.mockResolvedValue(null);

      // Act
      await NettoyageController.enregistrerNettoyage(req, res);

      // Assert
      expect(prisma.chambre.findUnique).toHaveBeenCalledWith({
        where: { id_chambre: 999 },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Chambre non trouvée",
      });
    });

    it("devrait enregistrer un nettoyage avec succès", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true);
      req.params = { id_chambre: "1" };
      req.body = {
        notes: "Nettoyage complet",
        fournitures_utilisees: [{ id_fourniture: 1, quantite: 2 }],
      };

      const mockChambre = {
        id_chambre: 1,
        numero_chambre: "101",
        etat: "maintenance",
      };

      const mockNettoyage = {
        id_nettoyage: 1,
        id_chambre: 1,
        id_utilisateur: 1,
        date_nettoyage: new Date(),
        notes: "Nettoyage complet",
      };

      prisma.chambre.findUnique.mockResolvedValue(mockChambre);
      NettoyageModel.create.mockResolvedValue(mockNettoyage);
      prisma.chambre.update.mockResolvedValue({
        ...mockChambre,
        etat: "disponible",
      });

      // Act
      await NettoyageController.enregistrerNettoyage(req, res);

      // Assert
      expect(NettoyageModel.create).toHaveBeenCalledWith({
        id_chambre: 1,
        id_utilisateur: 1,
        date_nettoyage: expect.any(Date),
        notes: "Nettoyage complet",
      });

      expect(NettoyageModel.enregistrerFournituresUtilisees).toHaveBeenCalledWith(1, [
        { id_fourniture: 1, quantite: 2 },
      ]);

      expect(prisma.chambre.update).toHaveBeenCalledWith({
        where: { id_chambre: 1 },
        data: {
          etat: "disponible",
          modifie_par: 1,
          date_modification: expect.any(Date),
        },
      });

      expect(prisma.journalModifications.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Nettoyage enregistré avec succès",
        data: {
          nettoyage: mockNettoyage,
          chambre_statut: "disponible",
        },
      });
    });
  });

  describe("getHistoriqueNettoyage", () => {
    it("devrait récupérer l'historique des nettoyages avec pagination", async () => {
      // Arrange
      req.params = { id_chambre: "1" };
      req.query = { page: "1", limit: "10" };

      const mockNettoyages = [
        {
          id_nettoyage: 1,
          id_chambre: 1,
          id_utilisateur: 1,
          date_nettoyage: new Date(),
          notes: "Nettoyage standard",
        },
        {
          id_nettoyage: 2,
          id_chambre: 1,
          id_utilisateur: 2,
          date_nettoyage: new Date(),
          notes: "Nettoyage approfondi",
        },
      ];

      NettoyageModel.getHistoriqueByChambre.mockResolvedValue(mockNettoyages);
      prisma.nettoyage.count.mockResolvedValue(2);

      // Act
      await NettoyageController.getHistoriqueNettoyage(req, res);

      // Assert
      expect(NettoyageModel.getHistoriqueByChambre).toHaveBeenCalledWith(1, 1, 10);
      expect(prisma.nettoyage.count).toHaveBeenCalledWith({
        where: { id_chambre: 1 },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Historique des nettoyages récupéré avec succès",
        data: {
          nettoyages: mockNettoyages,
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            pages: 1,
          },
        },
      });
    });

    it("devrait gérer les erreurs lors de la récupération de l'historique", async () => {
      // Arrange
      req.params = { id_chambre: "1" };
      const error = new Error("Erreur de base de données");
      NettoyageModel.getHistoriqueByChambre.mockRejectedValue(error);

      // Act
      await NettoyageController.getHistoriqueNettoyage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération de l'historique des nettoyages",
        error: "Erreur de base de données",
      });
    });
  });
});