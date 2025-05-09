import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import express from "express"
import request from "supertest"
import * as permissionController from "../../src/controllers/permissionController.js"
import { authenticateJWT } from "../../src/middleware/auth.js"

// Mock des dépendances
jest.mock("../../src/controllers/permissionController.js", () => ({
  getAllPermissions: jest.fn(),
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
  getAllRoles: jest.fn(),
  getRoleById: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  assignRoleToUser: jest.fn(),
  checkUserPermission: jest.fn(),
  getUserPermissions: jest.fn(),
}))

jest.mock("../../src/middleware/auth.js", () => ({
  authenticateJWT: jest.fn((req, res, next) => next()),
}))

describe("Permission Routes", () => {
  let app

  beforeEach(() => {
    // Réinitialisation des mocks
    jest.clearAllMocks()

    // Création de l'application Express
    app = express()
    app.use(express.json())

    // Définition des routes pour les tests
    app.get("/api/permissions", authenticateJWT, (req, res) => permissionController.getAllPermissions(req, res))

    app.post("/api/permissions", authenticateJWT, (req, res) => permissionController.createPermission(req, res))

    app.put("/api/permissions/:id", authenticateJWT, (req, res) => permissionController.updatePermission(req, res))

    app.delete("/api/permissions/:id", authenticateJWT, (req, res) => permissionController.deletePermission(req, res))

    app.get("/api/permissions/roles", authenticateJWT, (req, res) => permissionController.getAllRoles(req, res))

    app.post("/api/permissions/roles", authenticateJWT, (req, res) => permissionController.createRole(req, res))

    app.get("/api/permissions/roles/:id", authenticateJWT, (req, res) => permissionController.getRoleById(req, res))

    app.put("/api/permissions/roles/:id", authenticateJWT, (req, res) => permissionController.updateRole(req, res))

    app.delete("/api/permissions/roles/:id", authenticateJWT, (req, res) => permissionController.deleteRole(req, res))

    app.post("/api/permissions/assign-role", authenticateJWT, (req, res) =>
      permissionController.assignRoleToUser(req, res),
    )

    app.get("/api/permissions/check/:userId/:permissionCode", authenticateJWT, (req, res) =>
      permissionController.checkUserPermission(req, res),
    )

    app.get("/api/permissions/user/:userId", authenticateJWT, (req, res) =>
      permissionController.getUserPermissions(req, res),
    )
  })

  describe("GET /api/permissions", () => {
    it("devrait appeler le middleware d'authentification et permissionController.getAllPermissions", async () => {
      // Arrange
      permissionController.getAllPermissions.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/permissions")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.getAllPermissions).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("POST /api/permissions", () => {
    it("devrait appeler le middleware d'authentification et permissionController.createPermission", async () => {
      // Arrange
      permissionController.createPermission.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Permission créée" })
      })

      const permissionData = {
        nom: "Nouvelle Permission",
        description: "Description",
        code: "NOUVELLE_PERM",
      }

      // Act
      const response = await request(app).post("/api/permissions").send(permissionData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.createPermission).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Permission créée" })
    })
  })

  describe("PUT /api/permissions/:id", () => {
    it("devrait appeler le middleware d'authentification et permissionController.updatePermission", async () => {
      // Arrange
      permissionController.updatePermission.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Permission mise à jour" })
      })

      const updateData = {
        nom: "Permission Mise à Jour",
        description: "Description mise à jour",
        code: "PERM_MAJ",
      }

      // Act
      const response = await request(app).put("/api/permissions/1").send(updateData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.updatePermission).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Permission mise à jour" })
    })
  })

  describe("DELETE /api/permissions/:id", () => {
    it("devrait appeler le middleware d'authentification et permissionController.deletePermission", async () => {
      // Arrange
      permissionController.deletePermission.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Permission supprimée" })
      })

      // Act
      const response = await request(app).delete("/api/permissions/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.deletePermission).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Permission supprimée" })
    })
  })

  describe("GET /api/permissions/roles", () => {
    it("devrait appeler le middleware d'authentification et permissionController.getAllRoles", async () => {
      // Arrange
      permissionController.getAllRoles.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/permissions/roles")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.getAllRoles).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })

  describe("POST /api/permissions/roles", () => {
    it("devrait appeler le middleware d'authentification et permissionController.createRole", async () => {
      // Arrange
      permissionController.createRole.mockImplementation((req, res) => {
        res.status(201).json({ status: "OK", message: "Rôle créé" })
      })

      const roleData = {
        nom: "Nouveau Rôle",
        description: "Description",
        code: "NOUVEAU_ROLE",
      }

      // Act
      const response = await request(app).post("/api/permissions/roles").send(roleData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.createRole).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(response.body).toEqual({ status: "OK", message: "Rôle créé" })
    })
  })

  describe("GET /api/permissions/roles/:id", () => {
    it("devrait appeler le middleware d'authentification et permissionController.getRoleById", async () => {
      // Arrange
      permissionController.getRoleById.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { id: 1 } })
      })

      // Act
      const response = await request(app).get("/api/permissions/roles/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.getRoleById).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { id: 1 } })
    })
  })

  describe("PUT /api/permissions/roles/:id", () => {
    it("devrait appeler le middleware d'authentification et permissionController.updateRole", async () => {
      // Arrange
      permissionController.updateRole.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Rôle mis à jour" })
      })

      const updateData = {
        nom: "Rôle Mis à Jour",
        description: "Description mise à jour",
        code: "ROLE_MAJ",
      }

      // Act
      const response = await request(app).put("/api/permissions/roles/1").send(updateData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.updateRole).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Rôle mis à jour" })
    })
  })

  describe("DELETE /api/permissions/roles/:id", () => {
    it("devrait appeler le middleware d'authentification et permissionController.deleteRole", async () => {
      // Arrange
      permissionController.deleteRole.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Rôle supprimé" })
      })

      // Act
      const response = await request(app).delete("/api/permissions/roles/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.deleteRole).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Rôle supprimé" })
    })
  })

  describe("POST /api/permissions/assign-role", () => {
    it("devrait appeler le middleware d'authentification et permissionController.assignRoleToUser", async () => {
      // Arrange
      permissionController.assignRoleToUser.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", message: "Rôle attribué" })
      })

      const assignData = {
        userId: 1,
        roleId: 2,
      }

      // Act
      const response = await request(app).post("/api/permissions/assign-role").send(assignData)

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.assignRoleToUser).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", message: "Rôle attribué" })
    })
  })

  describe("GET /api/permissions/check/:userId/:permissionCode", () => {
    it("devrait appeler le middleware d'authentification et permissionController.checkUserPermission", async () => {
      // Arrange
      permissionController.checkUserPermission.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: { hasPermission: true } })
      })

      // Act
      const response = await request(app).get("/api/permissions/check/1/MANAGE_USERS")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.checkUserPermission).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: { hasPermission: true } })
    })
  })

  describe("GET /api/permissions/user/:userId", () => {
    it("devrait appeler le middleware d'authentification et permissionController.getUserPermissions", async () => {
      // Arrange
      permissionController.getUserPermissions.mockImplementation((req, res) => {
        res.status(200).json({ status: "OK", data: [] })
      })

      // Act
      const response = await request(app).get("/api/permissions/user/1")

      // Assert
      expect(authenticateJWT).toHaveBeenCalled()
      expect(permissionController.getUserPermissions).toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: "OK", data: [] })
    })
  })
})
