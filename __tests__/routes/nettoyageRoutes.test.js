import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import NettoyageController from "../../src/controllers/nettoyageController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"
import { verifierRoleMaintenance } from "../../src/middleware/role-auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/nettoyageController.js", () => ({
  enregistrerNettoyage: jest.fn(),
  getHistoriqueNettoyage: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

jest.mock("../../src/middleware/role-auth.js", () => ({
  verifierRoleMaintenance: jest.fn((req, res, next) => next()),
}))

describe("Nettoyage Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.post("/api/nettoyage/hebergements/:id_chambre", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      NettoyageController.enregistrerNettoyage(req, res),
    )

    app.get("/api/nettoyage/hebergements/:id_chambre/historique", authenticateJWT, (req, res) =>
      NettoyageController.getHistoriqueNettoyage(req, res),
    )
  })

  describe("POST /api/nettoyage/hebergements/:id_chambre", () => {
    it("devrait appeler les middlewares et NettoyageController.enregistrerNettoyage", async () => {
      // Arrange
      NettoyageController.enregistrerNettoyage.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Nettoyage enregistré" })
      })

      const nettoyageData = {
        notes: "Nettoyage complet",
        fournitures_utilisees: [{ id_fourniture: 1, quantite: 2 }],
      }

      // Act
      const response = await request(app).post("/api/nettoyage/hebergements/1").send(nettoyageData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(NettoyageController.enregistrerNettoyage).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Nettoyage enregistré" })
    })
  })

  describe("GET /api/nettoyage/hebergements/:id_chambre/historique", () => {
    it("devrait appeler le middleware d'authentification et NettoyageController.getHistoriqueNettoyage", async () => {
      // Arrange
      NettoyageController.getHistoriqueNettoyage.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { nettoyages: [] } })
      })

      // Act
      const response = await request(app).get("/api/nettoyage/hebergements/1/historique")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(NettoyageController.getHistoriqueNettoyage).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { nettoyages: [] } })
    })
  })
})
