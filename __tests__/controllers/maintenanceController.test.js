// __tests__/controllers/maintenanceController.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as maintenanceController from "../../src/controllers/maintenanceController.js";
import MaintenanceModel from "../../src/models/maintenance.model.js";
import prisma from "../../src/config/prisma.js";
import { RoleMapper } from "../../src/utils/roleMapper.js";

// Mock dependencies
jest.mock("../../src/models/maintenance.model.js", () => ({
  createMaintenance: jest.fn(),
  findByChambre: jest.fn(),
}));

jest.mock("../../src/config/prisma.js", () => ({
  personnel: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  notification: {
    create: jest.fn().mockResolvedValue({}), // Add mockResolvedValue to fix the catch error
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  maintenance: {
    update: jest.fn(),
  },
}));

jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn(),
  },
}));

describe("Maintenance Controller", () => {
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
        id: 1, // Add this for the notification creation
        role: "MAINTENANCE",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("trouverPersonnelParUtilisateur", () => {
    it("devrait retourner 404 si le personnel n'est pas trouvé", async () => {
      // Arrange
      req.params = { userId: "999" };
      prisma.personnel.findFirst.mockResolvedValue(null);
      prisma.personnel.findMany.mockResolvedValue([]);

      // Act
      await maintenanceController.trouverPersonnelParUtilisateur(req, res);

      // Assert
      expect(prisma.personnel.findFirst).toHaveBeenCalledWith({
        where: { id_utilisateur: 999 },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Personnel non trouvé pour cet utilisateur",
        debug: {
          userId: 999,
          tousLesPersonnels: [],
        },
      });
    });

    it("devrait retourner les informations du personnel avec succès", async () => {
      // Arrange
      req.params = { userId: "1" };
      const mockPersonnel = {
        id_personnel: 1,
        id_utilisateur: 1,
        nom: "Doe",
        prenom: "John",
        poste: "maintenance",
      };
      prisma.personnel.findFirst.mockResolvedValue(mockPersonnel);

      // Act
      await maintenanceController.trouverPersonnelParUtilisateur(req, res);

      // Assert
      expect(prisma.personnel.findFirst).toHaveBeenCalledWith({
        where: { id_utilisateur: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Personnel trouvé avec succès",
        data: mockPersonnel,
      });
    });
  });

  describe("creerMaintenance", () => {
    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = { description: "Réparation" }; // Missing date

      // Act
      await maintenanceController.creerMaintenance(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Description et date sont obligatoires.",
      });
    });

    it("devrait créer une maintenance avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        description: "Réparation climatisation",
        date: "2023-01-01",
        priorite: "HAUTE",
      };

      const mockMaintenance = {
        id_maintenance: 1,
        id_chambre: 1,
        description: "Réparation climatisation",
        date: new Date("2023-01-01"),
        statut: "EN_ATTENTE",
        priorite: "HAUTE",
      };

      MaintenanceModel.createMaintenance.mockResolvedValue(mockMaintenance);
      
      // Act
      await maintenanceController.creerMaintenance(req, res);

      // Assert
      expect(MaintenanceModel.createMaintenance).toHaveBeenCalledWith({
        id_chambre: 1,
        description: "Réparation climatisation",
        date: expect.any(Date),
        statut: "EN_ATTENTE",
        priorite: "HAUTE",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMaintenance);
    });
  });

  describe("obtenirNotificationsMaintenance", () => {
    it("devrait récupérer les notifications avec pagination", async () => {
      // Arrange
      req.query = { page: "1", limit: "10" };
      const mockNotifications = [
        {
          id_notification: 1,
          type: "MAINTENANCE",
          contenu: "Nouvelle maintenance requise",
          etat: "non_lu",
        },
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      // Act
      await maintenanceController.obtenirNotificationsMaintenance(req, res);

      // Assert
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          type: "MAINTENANCE",
          etat: "non_lu",
        },
        orderBy: {
          envoye_le: "desc",
        },
        skip: 0,
        take: "10", // Now it matches the string value
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
  });

  describe("marquerNotificationsCommeLues", () => {
    it("devrait retourner 400 si aucune notification n'est spécifiée", async () => {
      // Arrange
      req.body = {};

      // Act
      await maintenanceController.marquerNotificationsCommeLues(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Aucune notification à marquer comme lue.",
      });
    });

    it("devrait marquer les notifications comme lues avec succès", async () => {
      // Arrange
      req.body = { idNotifications: [1, 2, 3] };

      // Act
      await maintenanceController.marquerNotificationsCommeLues(req, res);

      // Assert
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id_notification: {
            in: [1, 2, 3],
          },
        },
        data: {
          etat: "lu",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Notifications marquées comme lues" });
    });
  });

  describe("listerMaintenancesParChambre", () => {
    it("devrait retourner 400 si le statut est invalide", async () => {
      // Arrange
      req.params = { id: "1" };
      req.query = { statut: "INVALIDE" };

      // Act
      await maintenanceController.listerMaintenancesParChambre(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Statut invalide." });
    });

    it("devrait récupérer les maintenances avec filtres", async () => {
      // Arrange
      req.params = { id: "1" };
      req.query = { statut: "EN_COURS", priorite: "HAUTE" };
      const mockMaintenances = [
        {
          id_maintenance: 1,
          id_chambre: 1,
          description: "Réparation climatisation",
          statut: "EN_COURS",
          priorite: "HAUTE",
        },
      ];

      MaintenanceModel.findByChambre.mockResolvedValue(mockMaintenances);

      // Act
      await maintenanceController.listerMaintenancesParChambre(req, res);

      // Assert
      expect(MaintenanceModel.findByChambre).toHaveBeenCalledWith("1", {
        statut: "EN_COURS",
        priorite: "HAUTE",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMaintenances);
    });
  });

  describe("mettreAJourStatutMaintenance", () => {
    it("devrait retourner 400 si le statut est invalide", async () => {
      // Arrange
      req.params = { idMaintenance: "1" };
      req.body = { statut: "INVALIDE" };

      // Act
      await maintenanceController.mettreAJourStatutMaintenance(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Statut invalide." });
    });

    it("devrait mettre à jour le statut avec succès", async () => {
      // Arrange
      req.params = { idMaintenance: "1" };
      req.body = { statut: "TERMINEE" };
      const mockMaintenance = {
        id_maintenance: 1,
        id_chambre: 1,
        statut: "TERMINEE",
      };

      prisma.maintenance.update.mockResolvedValue(mockMaintenance);

      // Act
      await maintenanceController.mettreAJourStatutMaintenance(req, res);

      // Assert
      expect(prisma.maintenance.update).toHaveBeenCalledWith({
        where: { id_maintenance: 1 },
        data: { statut: "TERMINEE" },
      });
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMaintenance);
    });
  });
});