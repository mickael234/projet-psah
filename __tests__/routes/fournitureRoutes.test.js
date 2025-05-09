import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import FournitureController from "../../src/controllers/fournitureController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"
import { verifierRoleMaintenance } from "../../src/middleware/role-auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/fournitureController.js", () => ({
  getAllFournitures: jest.fn(),
  createFourniture: jest.fn(),
  enregistrerUtilisation: jest.fn(),
  creerCommande: jest.fn(),
  updateCommandeStatus: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

jest.mock("../../src/middleware/role-auth.js", () => ({
  verifierRoleMaintenance: jest.fn((req, res, next) => next()),
}))

describe("Fourniture Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.get("/api/fournitures", authenticateJWT, (req, res) => FournitureController.getAllFournitures(req, res))

    app.post("/api/fournitures", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      FournitureController.createFourniture(req, res),
    )

    app.put("/api/fournitures/:id_fourniture/utilisation", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      FournitureController.enregistrerUtilisation(req, res),
    )

    app.post("/api/fournitures/commande", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      FournitureController.creerCommande(req, res),
    )

    app.put("/api/fournitures/commande/:id_commande/statut", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      FournitureController.updateCommandeStatus(req, res),
    )
  })

  describe("GET /api/fournitures", () => {
    it("devrait appeler le middleware d'authentification et FournitureController.getAllFournitures", async () => {
      // Arrange
      FournitureController.getAllFournitures.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/fournitures")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(FournitureController.getAllFournitures).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("POST /api/fournitures", () => {
    it("devrait appeler les middlewares et FournitureController.createFourniture", async () => {
      // Arrange
      FournitureController.createFourniture.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Fourniture créée" })
      })

      const fournitureData = {
        nom: "Savon",
        description: "Savon pour les mains",
        categorie: "Produits d'hygiène",
        quantite_stock: 100,
        unite: "unité",
        prix_unitaire: 2.5,
        seuil_alerte: 20,
      }

      // Act
      const response = await request(app).post("/api/fournitures").send(fournitureData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(FournitureController.createFourniture).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Fourniture créée" })
    })
  })

  describe("PUT /api/fournitures/:id_fourniture/utilisation", () => {
    it("devrait appeler les middlewares et FournitureController.enregistrerUtilisation", async () => {
      // Arrange
      FournitureController.enregistrerUtilisation.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Utilisation enregistrée" })
      })

      const utilisationData = {
        quantite: 5,
        notes: "Utilisation pour nettoyage chambre 101",
        id_chambre: 1,
      }

      // Act
      const response = await request(app).put("/api/fournitures/1/utilisation").send(utilisationData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(FournitureController.enregistrerUtilisation).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Utilisation enregistrée" })
    })
  })

  describe("POST /api/fournitures/commande", () => {
    it("devrait appeler les middlewares et FournitureController.creerCommande", async () => {
      // Arrange
      FournitureController.creerCommande.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Commande créée" })
      })

      const commandeData = {
        reference: "CMD-2023-001",
        fournisseur: "Fournisseur A",
        date_livraison_prevue: "2023-06-15",
        notes: "Commande urgente",
        details: [
          { id_fourniture: 1, quantite: 50, prix_unitaire: 2.5 },
          { id_fourniture: 2, quantite: 20, prix_unitaire: 5 },
        ],
      }

      // Act
      const response = await request(app).post("/api/fournitures/commande").send(commandeData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(FournitureController.creerCommande).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Commande créée" })
    })
  })

  describe("PUT /api/fournitures/commande/:id_commande/statut", () => {
    it("devrait appeler les middlewares et FournitureController.updateCommandeStatus", async () => {
      // Arrange
      FournitureController.updateCommandeStatus.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Statut mis à jour" })
      })

      const statutData = {
        statut: "LIVREE",
        notes: "Livraison complète reçue",
        date_livraison: "2023-06-10",
      }

      // Act
      const response = await request(app).put("/api/fournitures/commande/1/statut").send(statutData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(FournitureController.updateCommandeStatus).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Statut mis à jour" })
    })
  })
})
