import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import * as maintenanceController from "../../src/controllers/maintenanceController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/maintenanceController.js", () => ({
  creerMaintenance: jest.fn(),
  listerMaintenancesParChambre: jest.fn(),
  obtenirNotificationsMaintenance: jest.fn(),
  marquerNotificationsCommeLues: jest.fn(),
  mettreAJourStatutMaintenance: jest.fn(),
  trouverPersonnelParUtilisateur: jest.fn(),
  verifierRoleMaintenance: jest.fn((req, res, next) => next()),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

describe("Maintenance Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.use("/api/maintenance", authenticateJWT)
    app.use("/api/maintenance", maintenanceController.verifierRoleMaintenance)

    app.get("/api/maintenance/find-personnel/:userId", (req, res) =>
      maintenanceController.trouverPersonnelParUtilisateur(req, res),
    )

    app.post("/api/maintenance/hebergements/:id/maintenance", (req, res) =>
      maintenanceController.creerMaintenance(req, res),
    )

    app.get("/api/maintenance/hebergements/:id/maintenance", (req, res) =>
      maintenanceController.listerMaintenancesParChambre(req, res),
    )

    app.get("/api/maintenance/notifications", (req, res) =>
      maintenanceController.obtenirNotificationsMaintenance(req, res),
    )

    app.put("/api/maintenance/notifications/marquer-comme-lues", (req, res) =>
      maintenanceController.marquerNotificationsCommeLues(req, res),
    )

    app.put("/api/maintenance/:idMaintenance/statut", (req, res) =>
      maintenanceController.mettreAJourStatutMaintenance(req, res),
    )
  })

  describe("GET /api/maintenance/find-personnel/:userId", () => {
    it("devrait appeler les middlewares et maintenanceController.trouverPersonnelParUtilisateur", async () => {
      // Arrange
      maintenanceController.trouverPersonnelParUtilisateur.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { id_personnel: 1 } })
      })

      // Act
      const response = await request(app).get("/api/maintenance/find-personnel/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.trouverPersonnelParUtilisateur).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { id_personnel: 1 } })
    })
  })

  describe("POST /api/maintenance/hebergements/:id/maintenance", () => {
    it("devrait appeler les middlewares et maintenanceController.creerMaintenance", async () => {
      // Arrange
      maintenanceController.creerMaintenance.mockImplementation((req, res) => {
        res.status(201).json({ id_maintenance: 1 })
      })

      const maintenanceData = {
        description: "Réparation climatisation",
        date: "2023-06-01T10:00:00Z",
        priorite: "NORMALE",
      }

      // Act
      const response = await request(app).post("/api/maintenance/hebergements/1/maintenance").send(maintenanceData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.creerMaintenance).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ id_maintenance: 1 })
    })
  })

  describe("GET /api/maintenance/hebergements/:id/maintenance", () => {
    it("devrait appeler les middlewares et maintenanceController.listerMaintenancesParChambre", async () => {
      // Arrange
      maintenanceController.listerMaintenancesParChambre.mockImplementation((req, res) => {
        res.status(200).json([{ id_maintenance: 1 }])
      })

      // Act
      const response = await request(app).get("/api/maintenance/hebergements/1/maintenance")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.listerMaintenancesParChambre).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual([{ id_maintenance: 1 }])
    })
  })

  describe("GET /api/maintenance/notifications", () => {
    it("devrait appeler les middlewares et maintenanceController.obtenirNotificationsMaintenance", async () => {
      // Arrange
      maintenanceController.obtenirNotificationsMaintenance.mockImplementation((req, res) => {
        res.status(200).json([{ id_notification: 1 }])
      })

      // Act
      const response = await request(app).get("/api/maintenance/notifications")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.obtenirNotificationsMaintenance).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual([{ id_notification: 1 }])
    })
  })

  describe("PUT /api/maintenance/notifications/marquer-comme-lues", () => {
    it("devrait appeler les middlewares et maintenanceController.marquerNotificationsCommeLues", async () => {
      // Arrange
      maintenanceController.marquerNotificationsCommeLues.mockImplementation((req, res) => {
        res.status(200).json({ message: "Notifications marquées comme lues" })
      })

      // Act
      const response = await request(app)
        .put("/api/maintenance/notifications/marquer-comme-lues")
        .send({ idNotifications: [1, 2] })

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.marquerNotificationsCommeLues).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: "Notifications marquées comme lues" })
    })
  })

  describe("PUT /api/maintenance/:idMaintenance/statut", () => {
    it("devrait appeler les middlewares et maintenanceController.mettreAJourStatutMaintenance", async () => {
      // Arrange
      maintenanceController.mettreAJourStatutMaintenance.mockImplementation((req, res) => {
        res.status(200).json({ id_maintenance: 1, statut: "TERMINEE" })
      })

      // Act
      const response = await request(app).put("/api/maintenance/1/statut").send({ statut: "TERMINEE" })

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(maintenanceController.verifierRoleMaintenance).toHaveBeenCalled()
      expect(maintenanceController.mettreAJourStatutMaintenance).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ id_maintenance: 1, statut: "TERMINEE" })
    })
  })
})
