import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import * as planningController from "../../src/controllers/planningController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"
import { verifierRoleMaintenance } from "../../src/middleware/role-auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/planningController.js", () => ({
  creerTachePlanifiee: jest.fn(),
  listerTachesPlanifiees: jest.fn(),
  getTachePlanifieeById: jest.fn(),
  updateTachePlanifiee: jest.fn(),
  updateStatutTache: jest.fn(),
  ajouterCommentaire: jest.fn(),
  getTachesByResponsable: jest.fn(),
  getTachesByChambre: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

jest.mock("../../src/middleware/role-auth.js", () => ({
  verifierRoleMaintenance: jest.fn((req, res, next) => next()),
}))

describe("Planning Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.post("/api/planning", authenticateJWT, verifierRoleMaintenance, (req, res) =>
      planningController.creerTachePlanifiee(req, res),
    )

    app.get("/api/planning", authenticateJWT, (req, res) => planningController.listerTachesPlanifiees(req, res))

    app.get("/api/planning/responsable/:id_responsable", authenticateJWT, (req, res) =>
      planningController.getTachesByResponsable(req, res),
    )

    app.get("/api/planning/chambre/:id_chambre", authenticateJWT, (req, res) =>
      planningController.getTachesByChambre(req, res),
    )

    app.get("/api/planning/:id", authenticateJWT, (req, res) => planningController.getTachePlanifieeById(req, res))

    app.put("/api/planning/:id", authenticateJWT, (req, res) => planningController.updateTachePlanifiee(req, res))

    app.put("/api/planning/:id/statut", authenticateJWT, (req, res) => planningController.updateStatutTache(req, res))

    app.post("/api/planning/:id/commentaire", authenticateJWT, (req, res) =>
      planningController.ajouterCommentaire(req, res),
    )
  })

  describe("POST /api/planning", () => {
    it("devrait appeler les middlewares et planningController.creerTachePlanifiee", async () => {
      // Arrange
      planningController.creerTachePlanifiee.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Tâche créée" })
      })

      const tacheData = {
        titre: "Nettoyage chambre",
        description: "Nettoyage complet",
        date_debut: "2023-06-01T10:00:00Z",
        id_chambre: 1,
        id_responsable: 2,
        type_tache: "NETTOYAGE",
      }

      // Act
      const response = await request(app).post("/api/planning").send(tacheData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(verifierRoleMaintenance).toHaveBeenCalled()
      expect(planningController.creerTachePlanifiee).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Tâche créée" })
    })
  })

  describe("GET /api/planning", () => {
    it("devrait appeler le middleware d'authentification et planningController.listerTachesPlanifiees", async () => {
      // Arrange
      planningController.listerTachesPlanifiees.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/planning")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.listerTachesPlanifiees).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("GET /api/planning/responsable/:id_responsable", () => {
    it("devrait appeler le middleware d'authentification et planningController.getTachesByResponsable", async () => {
      // Arrange
      planningController.getTachesByResponsable.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/planning/responsable/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.getTachesByResponsable).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("GET /api/planning/chambre/:id_chambre", () => {
    it("devrait appeler le middleware d'authentification et planningController.getTachesByChambre", async () => {
      // Arrange
      planningController.getTachesByChambre.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/planning/chambre/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.getTachesByChambre).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("GET /api/planning/:id", () => {
    it("devrait appeler le middleware d'authentification et planningController.getTachePlanifieeById", async () => {
      // Arrange
      planningController.getTachePlanifieeById.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { id: 1 } })
      })

      // Act
      const response = await request(app).get("/api/planning/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.getTachePlanifieeById).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { id: 1 } })
    })
  })

  describe("PUT /api/planning/:id", () => {
    it("devrait appeler le middleware d'authentification et planningController.updateTachePlanifiee", async () => {
      // Arrange
      planningController.updateTachePlanifiee.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Tâche mise à jour" })
      })

      const updateData = {
        titre: "Nettoyage chambre - Mise à jour",
        priorite: "HAUTE",
      }

      // Act
      const response = await request(app).put("/api/planning/1").send(updateData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.updateTachePlanifiee).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Tâche mise à jour" })
    })
  })

  describe("PUT /api/planning/:id/statut", () => {
    it("devrait appeler le middleware d'authentification et planningController.updateStatutTache", async () => {
      // Arrange
      planningController.updateStatutTache.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Statut mis à jour" })
      })

      // Act
      const response = await request(app).put("/api/planning/1/statut").send({ statut: "TERMINEE" })

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.updateStatutTache).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Statut mis à jour" })
    })
  })

  describe("POST /api/planning/:id/commentaire", () => {
    it("devrait appeler le middleware d'authentification et planningController.ajouterCommentaire", async () => {
      // Arrange
      planningController.ajouterCommentaire.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Commentaire ajouté" })
      })

      // Act
      const response = await request(app).post("/api/planning/1/commentaire").send({ contenu: "Nouveau commentaire" })

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(planningController.ajouterCommentaire).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Commentaire ajouté" })
    })
  })
})
