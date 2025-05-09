import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import * as communicationController from "../../src/controllers/communicationController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/communicationController.js", () => ({
  creerCommunication: jest.fn(),
  listerCommunications: jest.fn(),
  getCommunicationById: jest.fn(),
  repondreCommunication: jest.fn(),
  getMessagesNonLus: jest.fn(),
  marquerCommeLu: jest.fn(),
  getMessagesByDepartement: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

describe("Communication Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.post("/api/communications", authenticateJWT, (req, res) => communicationController.creerCommunication(req, res))

    app.get("/api/communications", authenticateJWT, (req, res) =>
      communicationController.listerCommunications(req, res),
    )

    app.get("/api/communications/non-lus", authenticateJWT, (req, res) =>
      communicationController.getMessagesNonLus(req, res),
    )

    app.get("/api/communications/departement/:departement", authenticateJWT, (req, res) =>
      communicationController.getMessagesByDepartement(req, res),
    )

    app.get("/api/communications/:id", authenticateJWT, (req, res) =>
      communicationController.getCommunicationById(req, res),
    )

    app.post("/api/communications/:id/repondre", authenticateJWT, (req, res) =>
      communicationController.repondreCommunication(req, res),
    )

    app.put("/api/communications/:id/lu", authenticateJWT, (req, res) =>
      communicationController.marquerCommeLu(req, res),
    )
  })

  describe("POST /api/communications", () => {
    it("devrait appeler le middleware d'authentification et communicationController.creerCommunication", async () => {
      // Arrange
      communicationController.creerCommunication.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Message créé" })
      })

      const messageData = {
        sujet: "Test",
        contenu: "Contenu du message",
        id_destinataire: 2,
        priorite: "NORMALE",
      }

      // Act
      const response = await request(app).post("/api/communications").send(messageData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.creerCommunication).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Message créé" })
    })
  })

  describe("GET /api/communications", () => {
    it("devrait appeler le middleware d'authentification et communicationController.listerCommunications", async () => {
      // Arrange
      communicationController.listerCommunications.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/communications")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.listerCommunications).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("GET /api/communications/non-lus", () => {
    it("devrait appeler le middleware d'authentification et communicationController.getMessagesNonLus", async () => {
      // Arrange
      communicationController.getMessagesNonLus.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { count: 0, messages: [] } })
      })

      // Act
      const response = await request(app).get("/api/communications/non-lus")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.getMessagesNonLus).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { count: 0, messages: [] } })
    })
  })

  describe("GET /api/communications/departement/:departement", () => {
    it("devrait appeler le middleware d'authentification et communicationController.getMessagesByDepartement", async () => {
      // Arrange
      communicationController.getMessagesByDepartement.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/communications/departement/MAINTENANCE")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.getMessagesByDepartement).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("GET /api/communications/:id", () => {
    it("devrait appeler le middleware d'authentification et communicationController.getCommunicationById", async () => {
      // Arrange
      communicationController.getCommunicationById.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { id: 1 } })
      })

      // Act
      const response = await request(app).get("/api/communications/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.getCommunicationById).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { id: 1 } })
    })
  })

  describe("POST /api/communications/:id/repondre", () => {
    it("devrait appeler le middleware d'authentification et communicationController.repondreCommunication", async () => {
      // Arrange
      communicationController.repondreCommunication.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Réponse envoyée" })
      })

      const reponseData = {
        contenu: "Contenu de la réponse",
      }

      // Act
      const response = await request(app).post("/api/communications/1/repondre").send(reponseData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.repondreCommunication).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Réponse envoyée" })
    })
  })

  describe("PUT /api/communications/:id/lu", () => {
    it("devrait appeler le middleware d'authentification et communicationController.marquerCommeLu", async () => {
      // Arrange
      communicationController.marquerCommeLu.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Message marqué comme lu" })
      })

      // Act
      const response = await request(app).put("/api/communications/1/lu")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(communicationController.marquerCommeLu).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Message marqué comme lu" })
    })
  })
})
