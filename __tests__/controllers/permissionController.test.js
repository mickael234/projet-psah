// __tests__/controllers/permissionController.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as permissionController from "../../src/controllers/permissionController.js";

// Mocker la classe PermissionModel et ses méthodes
jest.mock("../../src/models/permission.model.js", () => {
  // Créer un mock pour les méthodes statiques
  return {
    __esModule: true,
    default: {
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
      userHasPermission: jest.fn(),
      getUserPermissions: jest.fn()
    }
  };
});

// Importer le modèle mocké
import PermissionModel from "../../src/models/permission.model.js";

// Mocker le RoleMapper pour les vérifications d'autorisation
jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn().mockReturnValue(true),
    toBaseRole: jest.fn().mockReturnValue("ADMIN_GENERAL")
  },
}));

// Mocker Prisma
jest.mock("../../src/config/prisma.js", () => ({
  __esModule: true,
  default: {
    permission: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    role: {
      findUnique: jest.fn()
    },
    utilisateur: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}));

import prisma from "../../src/config/prisma.js";

describe("Permission Controller", () => {
  let req, res;

  beforeEach(() => {
    // Réinitialiser tous les mocks
    jest.clearAllMocks();

    // Mocker la requête et la réponse
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        role: "ADMIN_GENERAL",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Tests pour la récupération de toutes les permissions
  describe("getAllPermissions", () => {
    it("devrait récupérer toutes les permissions", async () => {
      // Arrange
      const mockPermissions = [
        { id_permission: 1, nom: "GERER_UTILISATEURS", description: "Gérer les utilisateurs" },
        { id_permission: 2, nom: "GERER_RESERVATIONS", description: "Gérer les réservations" },
      ];

      PermissionModel.getAllPermissions.mockResolvedValue(mockPermissions);

      // Act
      await permissionController.getAllPermissions(req, res);

      // Assert
      expect(PermissionModel.getAllPermissions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Permissions récupérées avec succès",
        data: mockPermissions,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des permissions", async () => {
      // Arrange
      PermissionModel.getAllPermissions.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await permissionController.getAllPermissions(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des permissions",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la création d'une permission
  describe("createPermission", () => {
    it("devrait créer une permission avec succès", async () => {
      // Arrange
      req.body = {
        nom: "GERER_FACTURES",
        description: "Gérer les factures",
        code: "MANAGE_INVOICES"
      };

      const mockPermission = {
        id_permission: 3,
        nom: "GERER_FACTURES",
        description: "Gérer les factures",
        code: "MANAGE_INVOICES"
      };

      prisma.permission.findUnique.mockResolvedValue(null); // Pas de permission existante
      PermissionModel.createPermission.mockResolvedValue(mockPermission);

      // Act
      await permissionController.createPermission(req, res);

      // Assert
      expect(PermissionModel.createPermission).toHaveBeenCalledWith({
        nom: "GERER_FACTURES",
        description: "Gérer les factures",
        code: "MANAGE_INVOICES"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Permission créée avec succès",
        data: mockPermission,
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.body = { nom: "GERER_FACTURES" }; // Code manquant

      // Act
      await permissionController.createPermission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Nom et code sont requis",
      });
      expect(PermissionModel.createPermission).not.toHaveBeenCalled();
    });

    it("devrait retourner 400 si la permission existe déjà", async () => {
      // Arrange
      req.body = {
        nom: "GERER_FACTURES",
        description: "Gérer les factures",
        code: "MANAGE_INVOICES"
      };

      prisma.permission.findUnique.mockResolvedValue({
        id_permission: 3,
        code: "MANAGE_INVOICES"
      });

      // Act
      await permissionController.createPermission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Une permission avec ce code existe déjà"
      });
      expect(PermissionModel.createPermission).not.toHaveBeenCalled();
    });
  });

  // Tests pour la mise à jour d'une permission
  describe("updatePermission", () => {
    it("devrait mettre à jour une permission avec succès", async () => {
      // Arrange
      req.params = { id: "3" };
      req.body = {
        nom: "GERER_FACTURES_MODIFIE",
        description: "Gérer les factures (modifié)",
        code: "MANAGE_INVOICES_UPDATED"
      };

      const mockPermission = {
        id_permission: 3,
        nom: "GERER_FACTURES_MODIFIE",
        description: "Gérer les factures (modifié)",
        code: "MANAGE_INVOICES_UPDATED"
      };

      PermissionModel.updatePermission.mockResolvedValue(mockPermission);

      // Act
      await permissionController.updatePermission(req, res);

      // Assert
      expect(PermissionModel.updatePermission).toHaveBeenCalledWith(3, {
        nom: "GERER_FACTURES_MODIFIE",
        description: "Gérer les factures (modifié)",
        code: "MANAGE_INVOICES_UPDATED"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Permission mise à jour avec succès",
        data: mockPermission,
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.params = { id: "3" };
      req.body = { nom: "GERER_FACTURES_MODIFIE" }; // Code manquant

      // Act
      await permissionController.updatePermission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Nom et code sont requis",
      });
      expect(PermissionModel.updatePermission).not.toHaveBeenCalled();
    });
  });

  // Tests pour la suppression d'une permission
  describe("deletePermission", () => {
    it("devrait supprimer une permission avec succès", async () => {
      // Arrange
      req.params = { id: "3" };

      PermissionModel.deletePermission.mockResolvedValue({
        id_permission: 3,
        nom: "GERER_FACTURES",
        code: "MANAGE_INVOICES"
      });

      // Act
      await permissionController.deletePermission(req, res);

      // Assert
      expect(PermissionModel.deletePermission).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Permission supprimée avec succès",
      });
    });

    it("devrait gérer les erreurs si la permission est utilisée", async () => {
      // Arrange
      req.params = { id: "3" };
      
      PermissionModel.deletePermission.mockRejectedValue(
        new Error("Cette permission est utilisée par des rôles")
      );

      // Act
      await permissionController.deletePermission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Cette permission est utilisée par des rôles",
      });
    });
  });

  // Tests pour la récupération de tous les rôles
  describe("getAllRoles", () => {
    it("devrait récupérer tous les rôles", async () => {
      // Arrange
      const mockRoles = [
        { 
          id_role: 1, 
          nom: "Administrateur", 
          code: "ADMIN_GENERAL",
          permissions: [
            { permission: { id_permission: 1, code: "MANAGE_USERS" } }
          ]
        },
        { 
          id_role: 2, 
          nom: "Réceptionniste", 
          code: "RECEPTIONNISTE",
          permissions: [
            { permission: { id_permission: 2, code: "MANAGE_BOOKINGS" } }
          ]
        },
      ];

      PermissionModel.getAllRoles.mockResolvedValue(mockRoles);

      // Act
      await permissionController.getAllRoles(req, res);

      // Assert
      expect(PermissionModel.getAllRoles).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Rôles récupérés avec succès",
        data: mockRoles,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des rôles", async () => {
      // Arrange
      PermissionModel.getAllRoles.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await permissionController.getAllRoles(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des rôles",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la récupération d'un rôle par ID
  describe("getRoleById", () => {
    it("devrait récupérer un rôle spécifique", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockRole = { 
        id_role: 1, 
        nom: "Administrateur", 
        code: "ADMIN_GENERAL",
        permissions: [
          { permission: { id_permission: 1, code: "MANAGE_USERS" } }
        ]
      };

      PermissionModel.getRoleById.mockResolvedValue(mockRole);

      // Act
      await permissionController.getRoleById(req, res);

      // Assert
      expect(PermissionModel.getRoleById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Rôle récupéré avec succès",
        data: mockRole,
      });
    });

    it("devrait retourner 404 si le rôle n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      PermissionModel.getRoleById.mockResolvedValue(null);

      // Act
      await permissionController.getRoleById(req, res);

      // Assert
      expect(PermissionModel.getRoleById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Rôle non trouvé",
      });
    });
  });

  // Tests pour la création d'un rôle
  describe("createRole", () => {
    it("devrait créer un rôle avec succès", async () => {
      // Arrange
      req.body = {
        nom: "Responsable Maintenance",
        description: "Responsable du service maintenance",
        code: "RESPONSABLE_MAINTENANCE"
      };

      const mockRole = {
        id_role: 3,
        nom: "Responsable Maintenance",
        description: "Responsable du service maintenance",
        code: "RESPONSABLE_MAINTENANCE"
      };

      prisma.role.findUnique.mockResolvedValue(null); // Pas de rôle existant
      PermissionModel.createRole.mockResolvedValue(mockRole);

      // Act
      await permissionController.createRole(req, res);

      // Assert
      expect(PermissionModel.createRole).toHaveBeenCalledWith({
        nom: "Responsable Maintenance",
        description: "Responsable du service maintenance",
        code: "RESPONSABLE_MAINTENANCE"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Rôle créé avec succès",
        data: mockRole,
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.body = { nom: "Responsable Maintenance" }; // Code manquant

      // Act
      await permissionController.createRole(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Nom et code sont requis",
      });
      expect(PermissionModel.createRole).not.toHaveBeenCalled();
    });
  });

  // Tests pour l'attribution d'un rôle à un utilisateur
  describe("assignRoleToUser", () => {
    it("devrait attribuer un rôle à un utilisateur avec succès", async () => {
      // Arrange
      req.body = {
        userId: 2,
        roleId: 3
      };

      const mockRole = {
        id_role: 3,
        code: "RESPONSABLE_MAINTENANCE"
      };

      const mockUser = {
        id_utilisateur: 2,
        nom_utilisateur: "jean.dupont",
        id_role: 3,
        role: "RESPONSABLE_MAINTENANCE",
        role_relation: mockRole
      };

      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.utilisateur.update.mockResolvedValue(mockUser);

      // Act
      await permissionController.assignRoleToUser(req, res);

      // Assert
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id_role: 3 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Rôle attribué avec succès",
        data: mockUser,
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.body = { userId: 2 }; // roleId manquant

      // Act
      await permissionController.assignRoleToUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "ID utilisateur et ID rôle sont requis",
      });
    });
  });

  // Tests pour la vérification des permissions d'un utilisateur
  describe("checkUserPermission", () => {
    it("devrait vérifier si un utilisateur a une permission", async () => {
      // Arrange
      req.params = {
        userId: "2",
        permissionCode: "MANAGE_MAINTENANCE"
      };

      PermissionModel.userHasPermission.mockResolvedValue(true);

      // Act
      await permissionController.checkUserPermission(req, res);

      // Assert
      expect(PermissionModel.userHasPermission).toHaveBeenCalledWith(2, "MANAGE_MAINTENANCE");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "L'utilisateur a la permission",
        data: {
          hasPermission: true,
        },
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.params = { userId: "2" }; // permissionCode manquant

      // Act
      await permissionController.checkUserPermission(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "ID utilisateur et code permission sont requis",
      });
      expect(PermissionModel.userHasPermission).not.toHaveBeenCalled();
    });
  });

  // Tests pour la récupération des permissions d'un utilisateur
  describe("getUserPermissions", () => {
    it("devrait récupérer les permissions d'un utilisateur", async () => {
      // Arrange
      req.params = { userId: "1" }; // Même utilisateur que celui connecté

      const mockPermissions = [
        { id_permission: 1, code: "MANAGE_USERS", nom: "Gérer les utilisateurs" },
        { id_permission: 2, code: "MANAGE_ROLES", nom: "Gérer les rôles" }
      ];

      PermissionModel.getUserPermissions.mockResolvedValue(mockPermissions);

      // Act
      await permissionController.getUserPermissions(req, res);

      // Assert
      expect(PermissionModel.getUserPermissions).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Permissions récupérées avec succès",
        data: mockPermissions,
      });
    });

    it("devrait retourner 403 si l'utilisateur n'est pas autorisé", async () => {
      // Arrange
      req.params = { userId: "2" }; // Autre utilisateur
      req.user.role = "RECEPTIONNISTE"; // Rôle non autorisé

      // Modifier le mock pour ce test spécifique
      jest.spyOn(require("../../src/utils/roleMapper.js").RoleMapper, "hasAuthorizedRole")
        .mockReturnValueOnce(false);

      // Act
      await permissionController.getUserPermissions(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir les permissions de cet utilisateur",
      });
      expect(PermissionModel.getUserPermissions).not.toHaveBeenCalled();
    });
  });
});