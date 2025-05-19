import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import StatusController from "../../src/controllers/statusController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/statusController.js", () => ({
  getHebergementsStatus: jest.fn(),
  testStatus: jest.fn(),
  updateHebergementStatus: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

describe("Status Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.get("/api/hebergements/status", authenticateJWT, (req, res) => StatusController.getHebergementsStatus(req, res))

    app.get("/api/hebergements/status-test", authenticateJWT, (req, res) => StatusController.testStatus(req, res))

    app.put("/api/hebergements/status/:id", authenticateJWT, (req, res) =>
      StatusController.updateHebergementStatus(req, res),
    )
  })

  describe("GET /api/hebergements/status", () => {
    it("devrait appeler le middleware d'authentification et StatusController.getHebergementsStatus", async () => {
      // Arrange
      StatusController.getHebergementsStatus.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Test réussi" })
      })

      // Act
      const response = await request(app).get("/api/hebergements/status")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(StatusController.getHebergementsStatus).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Test réussi" })
    })
  })

  describe("GET /api/hebergements/status-test", () => {
    it("devrait appeler le middleware d'authentification et StatusController.testStatus", async () => {
      // Arrange
      StatusController.testStatus.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Test réussi" })
      })

      // Act
      const response = await request(app).get("/api/hebergements/status-test")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(StatusController.testStatus).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Test réussi" })
    })
  })

  describe("PUT /api/hebergements/status/:id", () => {
    it("devrait appeler le middleware d'authentification et StatusController.updateHebergementStatus", async () => {
      // Arrange
      StatusController.updateHebergementStatus.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Mise à jour réussie" })
      })

      // Act
      const response = await request(app).put("/api/hebergements/status/1").send({ etat: "disponible" })

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(StatusController.updateHebergementStatus).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Mise à jour réussie" })
    })
  })
})
