// src/tests/maintenance.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { creerMaintenance } from "../controllers/maintenanceController.js";

// Mock the MaintenanceModel
jest.mock("../models/maintenance.model.js", () => ({
  createMaintenance: jest.fn(),
}));

// Import the mocked model
import * as MaintenanceModel from "../models/maintenance.model.js";

describe("Maintenance", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      params: { id: "1" },
      body: {
        description: "Réparation climatisation",
        date: "2023-01-01",
        priorite: "HAUTE",
      },
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

  it("crée une maintenance correctement", async () => {
    // Arrange
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
    await creerMaintenance(req, res);

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