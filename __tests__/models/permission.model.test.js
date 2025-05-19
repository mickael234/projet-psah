// __tests__/models/permission.model.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock Prisma with a proper $transaction implementation
jest.mock("../../src/config/prisma.js", () => {
  const mockPrisma = {
    permission: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    role: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    rolePermission: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    utilisateur: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    // Define $transaction as a function that calls the callback with the mock prisma instance
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };
  
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Import the model directly (no need for dynamic imports)
import PermissionModel from "../../src/models/permission.model.js";
import prisma from "../../src/config/prisma.js";

describe("PermissionModel", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("getAllPermissions", () => {
    it("devrait retourner toutes les permissions", async () => {
      // Arrange
      const mockPermissions = [
        { id_permission: 1, nom: "Permission 1", code: "PERM_1" },
        { id_permission: 2, nom: "Permission 2", code: "PERM_2" },
      ];
      prisma.permission.findMany.mockResolvedValue(mockPermissions);

      // Act
      const result = await PermissionModel.getAllPermissions();

      // Assert
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        orderBy: {
          nom: "asc",
        },
      });
      expect(result).toEqual(mockPermissions);
    });
  });

  describe("createPermission", () => {
    it("devrait créer une nouvelle permission", async () => {
      // Arrange
      const permissionData = {
        nom: "Nouvelle Permission",
        description: "Description",
        code: "NOUVELLE_PERM",
      };
      const mockCreatedPermission = { id_permission: 1, ...permissionData };
      prisma.permission.create.mockResolvedValue(mockCreatedPermission);

      // Act
      const result = await PermissionModel.createPermission(permissionData);

      // Assert
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: permissionData,
      });
      expect(result).toEqual(mockCreatedPermission);
    });
  });

  describe("getUserPermissions", () => {
    it("devrait retourner les permissions d'un utilisateur avec un rôle", async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id_utilisateur: userId,
        role_relation: {
          permissions: [
            {
              permission: { id_permission: 1, code: "PERM_1", nom: "Permission 1" },
            },
            {
              permission: { id_permission: 2, code: "PERM_2", nom: "Permission 2" },
            },
          ],
        },
      };
      prisma.utilisateur.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await PermissionModel.getUserPermissions(userId);

      // Assert
      expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith({
        where: { id_utilisateur: userId },
        include: {
          role_relation: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual([
        { id_permission: 1, code: "PERM_1", nom: "Permission 1" },
        { id_permission: 2, code: "PERM_2", nom: "Permission 2" },
      ]);
    });

    it("devrait retourner un tableau vide si l'utilisateur n'a pas de rôle", async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id_utilisateur: userId,
        role_relation: null,
      };
      prisma.utilisateur.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await PermissionModel.getUserPermissions(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});