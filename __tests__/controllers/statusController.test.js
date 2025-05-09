import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import StatusController from "../../src/controllers/statusController.js"
import prisma from "../../src/config/prisma.js"
import { RoleMapper } from "../../src/utils/roleMapper.js"

// Mock des dépendances
jest.mock("../../src/config/prisma.js", () => ({
  chambre: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  journalModifications: {
    create: jest.fn(),
  },
  maintenance: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
}))

jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn(),
  },
}))

describe("StatusController", () => {
  let req, res

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Mock de la requête et de la réponse
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        role: "ADMIN_GENERAL",
      },
      originalUrl: "/api/hebergements/status",
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  describe("getHebergementsStatus", () => {
    it("devrait retourner un statut 401 si l'utilisateur n'est pas authentifié", async () => {
      // Arrange
      req.user = null

      // Act
      await StatusController.getHebergementsStatus(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Authentification requise",
      })
    })

    it("devrait retourner les hébergements formatés avec pagination", async () => {
      // Arrange
      const mockHebergements = [
        {
          id_chambre: 1,
          numero_chambre: "101",
          type_chambre: "standard",
          etat: "disponible",
          description: "Chambre standard",
          maintenances: [],
        },
        {
          id_chambre: 2,
          numero_chambre: "102",
          type_chambre: "suite",
          etat: "occupee",
          description: "Suite de luxe",
          maintenances: [
            {
              id_maintenance: 1,
              description: "Réparation climatisation",
              statut: "EN_COURS",
              date: new Date(),
            },
          ],
        },
      ]

      prisma.chambre.findMany.mockResolvedValue(mockHebergements)
      prisma.chambre.count.mockResolvedValue(2)

      // Act
      await StatusController.getHebergementsStatus(req, res)

      // Assert
      expect(prisma.chambre.findMany).toHaveBeenCalled()
      expect(prisma.chambre.count).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Statuts des hébergements récupérés avec succès",
        data: {
          hebergements: [
            {
              id: 1,
              numero: "101",
              type: "standard",
              etat: "disponible",
              description: "Chambre standard",
              maintenance_en_cours: null,
            },
            {
              id: 2,
              numero: "102",
              type: "suite",
              etat: "occupee",
              description: "Suite de luxe",
              maintenance_en_cours: {
                id: 1,
                description: "Réparation climatisation",
                statut: "EN_COURS",
                date: expect.any(Date),
              },
            },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 20,
            pages: 1,
          },
        },
      })
    })

    it("devrait gérer les erreurs de base de données", async () => {
      // Arrange
      const dbError = new Error("Erreur de connexion à la base de données")
      prisma.chambre.findMany.mockRejectedValue(dbError)

      // Act
      await StatusController.getHebergementsStatus(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des données de la base de données",
        error: "Erreur de connexion à la base de données",
      })
    })
  })

  describe("updateHebergementStatus", () => {
    it("devrait retourner 403 si l'utilisateur n'a pas les permissions", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(false)

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(RoleMapper.hasAuthorizedRole).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Vous n'avez pas les permissions nécessaires pour modifier le statut d'un hébergement",
      })
    })

    it("devrait retourner 400 si le statut est manquant", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true)
      req.params.id = "1"
      req.body = {}

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Le statut est requis",
      })
    })

    it("devrait retourner 400 si le statut est invalide", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true)
      req.params.id = "1"
      req.body = { etat: "statut_invalide" }

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Statut invalide. Les valeurs acceptées sont: disponible, occupee, maintenance",
      })
    })

    it("devrait retourner 404 si l'hébergement n'est pas trouvé", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true)
      req.params.id = "999"
      req.body = { etat: "disponible" }
      prisma.chambre.findUnique.mockResolvedValue(null)

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(prisma.chambre.findUnique).toHaveBeenCalledWith({
        where: { id_chambre: 999 },
      })
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Hébergement non trouvé",
      })
    })

    it("devrait mettre à jour le statut de l'hébergement avec succès", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true)
      req.params.id = "1"
      req.body = { etat: "disponible", notes: "Chambre nettoyée" }

      const mockHebergement = {
        id_chambre: 1,
        numero_chambre: "101",
        etat: "maintenance",
      }

      const mockUpdatedHebergement = {
        ...mockHebergement,
        etat: "disponible",
        modifie_par: 1,
        date_modification: expect.any(Date),
      }

      prisma.chambre.findUnique.mockResolvedValue(mockHebergement)
      prisma.chambre.update.mockResolvedValue(mockUpdatedHebergement)

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(prisma.chambre.update).toHaveBeenCalledWith({
        where: { id_chambre: 1 },
        data: {
          etat: "disponible",
          modifie_par: 1,
          date_modification: expect.any(Date),
        },
      })

      expect(prisma.journalModifications.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Statut de l'hébergement mis à jour avec succès",
        data: mockUpdatedHebergement,
      })
    })

    it("devrait créer une entrée de maintenance lorsque le statut passe à maintenance", async () => {
      // Arrange
      RoleMapper.hasAuthorizedRole.mockReturnValue(true)
      req.params.id = "1"
      req.body = { etat: "maintenance", notes: "Problème de plomberie" }

      const mockHebergement = {
        id_chambre: 1,
        numero_chambre: "101",
        etat: "disponible",
      }

      const mockUpdatedHebergement = {
        ...mockHebergement,
        etat: "maintenance",
        modifie_par: 1,
        date_modification: expect.any(Date),
      }

      prisma.chambre.findUnique.mockResolvedValue(mockHebergement)
      prisma.chambre.update.mockResolvedValue(mockUpdatedHebergement)

      // Act
      await StatusController.updateHebergementStatus(req, res)

      // Assert
      expect(prisma.maintenance.create).toHaveBeenCalledWith({
        data: {
          id_chambre: 1,
          description: "Problème de plomberie",
          date: expect.any(Date),
          statut: "EN_ATTENTE",
          priorite: "NORMALE",
        },
      })

      expect(prisma.notification.create).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
