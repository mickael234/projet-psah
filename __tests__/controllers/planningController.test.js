// __tests__/controllers/planningController.test.js
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as planningController from "../../src/controllers/planningController.js";

// Mocker la classe PlanningModel et ses méthodes
jest.mock("../../src/models/planning.model.js", () => {
  // Créer un constructeur mock
  const MockPlanningModel = jest.fn();
  
  // Ajouter des méthodes mock au prototype
  MockPlanningModel.prototype.create = jest.fn();
  MockPlanningModel.prototype.findAll = jest.fn();
  MockPlanningModel.prototype.findById = jest.fn();
  MockPlanningModel.prototype.update = jest.fn();
  MockPlanningModel.prototype.updateStatut = jest.fn();
  MockPlanningModel.prototype.ajouterCommentaire = jest.fn();
  MockPlanningModel.prototype.getByResponsable = jest.fn();
  MockPlanningModel.prototype.getByChambre = jest.fn();
  
  return {
    __esModule: true,
    default: MockPlanningModel
  };
});

// Importer le modèle mocké pour accéder au constructeur
import PlanningModel from "../../src/models/planning.model.js";

// Mocker le RoleMapper pour les vérifications d'autorisation
jest.mock("../../src/utils/roleMapper.js", () => ({
  RoleMapper: {
    hasAuthorizedRole: jest.fn().mockReturnValue(true)
  },
}));

// Mocker Prisma
jest.mock("../../src/config/prisma.js", () => ({
  __esModule: true,
  default: {
    chambre: {
      findUnique: jest.fn()
    },
    personnel: {
      findUnique: jest.fn()
    },
    utilisateur: {
      findUnique: jest.fn()
    }
  }
}));

import prisma from "../../src/config/prisma.js";

describe("Planning Controller", () => {
  let req, res;
  
  // Cette variable contiendra l'instance du modèle avec les méthodes mockées
  let mockModelInstance;

  beforeEach(() => {
    // Réinitialiser tous les mocks
    jest.clearAllMocks();
    
    // Créer une nouvelle instance du modèle mocké
    mockModelInstance = new PlanningModel();

    // Mocker la requête et la réponse
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        userId: 1,
        role: "ADMIN_GENERAL",
        personnelId: 1
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Tests pour la création d'une tâche planifiée
  describe("creerTachePlanifiee", () => {
    it("devrait créer une tâche planifiée avec succès", async () => {
      // Arrange
      req.body = {
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: "2023-05-01T08:00:00.000Z",
        date_fin: "2023-05-01T10:00:00.000Z",
        id_chambre: 101,
        id_responsable: 2,
        type_tache: "NETTOYAGE",
        priorite: "NORMALE"
      };

      const mockChambre = {
        id_chambre: 101,
        numero: "101",
        etage: 1
      };

      const mockUtilisateur = {
        id_utilisateur: 2,
        nom_utilisateur: "jean.dupont"
      };

      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: new Date("2023-05-01T08:00:00.000Z"),
        date_fin: new Date("2023-05-01T10:00:00.000Z"),
        id_chambre: 101,
        id_responsable: 2,
        type_tache: "NETTOYAGE",
        priorite: "NORMALE",
        statut: "PLANIFIEE",
        id_createur: 1,
        chambre: mockChambre,
        responsable: {
          nom_utilisateur: "jean.dupont",
          email: "jean.dupont@hotel.com",
          role: "PERSONNEL_MENAGE"
        }
      };

      prisma.chambre.findUnique.mockResolvedValue(mockChambre);
      prisma.utilisateur.findUnique.mockResolvedValue(mockUtilisateur);
      mockModelInstance.create.mockResolvedValue(mockTache);

      // Act
      await planningController.creerTachePlanifiee(req, res);

      // Assert
      expect(prisma.chambre.findUnique).toHaveBeenCalledWith({
        where: { id_chambre: 101 }
      });
      expect(mockModelInstance.create).toHaveBeenCalledWith({
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: "2023-05-01T08:00:00.000Z",
        date_fin: "2023-05-01T10:00:00.000Z",
        id_chambre: 101,
        id_responsable: 2,
        type_tache: "NETTOYAGE",
        priorite: "NORMALE",
        id_createur: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâche planifiée créée avec succès",
        data: mockTache,
      });
    });

    it("devrait créer une tâche avec un personnel spécifié", async () => {
      // Arrange
      req.body = {
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: "2023-05-01T08:00:00.000Z",
        id_chambre: 101,
        id_personnel: 5, // Utiliser id_personnel au lieu de id_responsable
        type_tache: "NETTOYAGE"
      };

      const mockChambre = {
        id_chambre: 101,
        numero: "101",
        etage: 1
      };

      const mockPersonnel = {
        id_personnel: 5,
        id_utilisateur: 3, // L'ID utilisateur correspondant
        nom: "Dupont",
        prenom: "Jean"
      };

      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: new Date("2023-05-01T08:00:00.000Z"),
        id_chambre: 101,
        id_responsable: 3, // L'ID utilisateur du personnel
        type_tache: "NETTOYAGE",
        statut: "PLANIFIEE",
        id_createur: 1
      };

      prisma.chambre.findUnique.mockResolvedValue(mockChambre);
      prisma.personnel.findUnique.mockResolvedValue(mockPersonnel);
      mockModelInstance.create.mockResolvedValue(mockTache);

      // Act
      await planningController.creerTachePlanifiee(req, res);

      // Assert
      expect(prisma.chambre.findUnique).toHaveBeenCalledWith({
        where: { id_chambre: 101 }
      });
      expect(prisma.personnel.findUnique).toHaveBeenCalledWith({
        where: { id_personnel: 5 }
      });
      expect(mockModelInstance.create).toHaveBeenCalledWith({
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: "2023-05-01T08:00:00.000Z",
        id_chambre: 101,
        id_responsable: 3, // L'ID utilisateur du personnel
        type_tache: "NETTOYAGE",
        id_createur: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâche planifiée créée avec succès",
        data: mockTache,
      });
    });

    it("devrait retourner 400 si les données requises sont manquantes", async () => {
      // Arrange
      req.body = {
        titre: "Nettoyage chambre 101",
        // date_debut manquante
        id_chambre: 101,
        type_tache: "NETTOYAGE"
        // id_responsable ou id_personnel manquant
      };

      // Act
      await planningController.creerTachePlanifiee(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Titre, date de début, chambre, responsable (ou personnel) et type de tâche sont requis",
      });
      expect(mockModelInstance.create).not.toHaveBeenCalled();
    });

    it("devrait retourner 404 si la chambre n'existe pas", async () => {
      // Arrange
      req.body = {
        titre: "Nettoyage chambre 999",
        description: "Nettoyage complet de la chambre 999",
        date_debut: "2023-05-01T08:00:00.000Z",
        id_chambre: 999, // Chambre inexistante
        id_responsable: 2,
        type_tache: "NETTOYAGE"
      };

      prisma.chambre.findUnique.mockResolvedValue(null);

      // Act
      await planningController.creerTachePlanifiee(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "La chambre spécifiée n'existe pas",
      });
      expect(mockModelInstance.create).not.toHaveBeenCalled();
    });
  });

  // Tests pour la récupération de toutes les tâches planifiées
  describe("listerTachesPlanifiees", () => {
    it("devrait récupérer toutes les tâches planifiées avec pagination", async () => {
      // Arrange
      req.query = { 
        page: "1", 
        limit: "10",
        statut: "PLANIFIEE",
        type_tache: "NETTOYAGE" 
      };
      
      const mockTaches = [
        {
          id_tache: 1,
          titre: "Nettoyage chambre 101",
          date_debut: new Date("2023-05-01T08:00:00.000Z"),
          id_chambre: 101,
          id_responsable: 2,
          type_tache: "NETTOYAGE",
          statut: "PLANIFIEE"
        },
        {
          id_tache: 2,
          titre: "Nettoyage chambre 102",
          date_debut: new Date("2023-05-01T10:00:00.000Z"),
          id_chambre: 102,
          id_responsable: 2,
          type_tache: "NETTOYAGE",
          statut: "PLANIFIEE"
        },
      ];

      mockModelInstance.findAll.mockResolvedValue(mockTaches);

      // Act
      await planningController.listerTachesPlanifiees(req, res);

      // Assert
      expect(mockModelInstance.findAll).toHaveBeenCalledWith(
        {
          statut: "PLANIFIEE",
          type_tache: "NETTOYAGE"
        },
        1,
        10
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâches planifiées récupérées avec succès",
        data: mockTaches,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des tâches", async () => {
      // Arrange
      mockModelInstance.findAll.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await planningController.listerTachesPlanifiees(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des tâches planifiées",
        error: "Erreur de base de données",
      });
    });
  });

  // Tests pour la récupération d'une tâche spécifique
  describe("getTachePlanifieeById", () => {
    it("devrait récupérer une tâche spécifique", async () => {
      // Arrange
      req.params = { id: "1" };
      
      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        description: "Nettoyage complet de la chambre 101",
        date_debut: new Date("2023-05-01T08:00:00.000Z"),
        id_chambre: 101,
        id_responsable: 1, // Même que l'utilisateur connecté
        type_tache: "NETTOYAGE",
        statut: "PLANIFIEE",
        chambre: {
          id_chambre: 101,
          numero: "101"
        },
        responsable: {
          id_utilisateur: 1,
          nom_utilisateur: "admin"
        },
        commentaires: []
      };

      mockModelInstance.findById.mockResolvedValue(mockTache);

      // Act
      await planningController.getTachePlanifieeById(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâche planifiée récupérée avec succès",
        data: mockTache,
      });
    });

    it("devrait retourner 404 si la tâche n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      mockModelInstance.findById.mockResolvedValue(null);

      // Act
      await planningController.getTachePlanifieeById(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      });
    });
  });

  // Tests pour la mise à jour d'une tâche
  describe("updateTachePlanifiee", () => {
    it("devrait mettre à jour une tâche avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        titre: "Nettoyage chambre 101 - Urgent",
        priorite: "HAUTE",
        statut: "EN_COURS"
      };
      
      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        id_chambre: 101,
        id_responsable: 2,
        id_createur: 1, // Créé par l'utilisateur connecté
        type_tache: "NETTOYAGE",
        statut: "PLANIFIEE"
      };

      const mockTacheMiseAJour = {
        ...mockTache,
        titre: "Nettoyage chambre 101 - Urgent",
        priorite: "HAUTE",
        statut: "EN_COURS"
      };

      mockModelInstance.findById.mockResolvedValue(mockTache);
      mockModelInstance.update.mockResolvedValue(mockTacheMiseAJour);

      // Act
      await planningController.updateTachePlanifiee(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(mockModelInstance.update).toHaveBeenCalledWith(1, {
        titre: "Nettoyage chambre 101 - Urgent",
        priorite: "HAUTE",
        statut: "EN_COURS"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâche planifiée mise à jour avec succès",
        data: mockTacheMiseAJour,
      });
    });

    it("devrait retourner 404 si la tâche n'existe pas", async () => {
      // Arrange
      req.params = { id: "999" };
      req.body = {
        titre: "Nettoyage chambre 101 - Urgent"
      };
      
      mockModelInstance.findById.mockResolvedValue(null);

      // Act
      await planningController.updateTachePlanifiee(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Tâche planifiée non trouvée",
      });
      expect(mockModelInstance.update).not.toHaveBeenCalled();
    });
  });

  // Tests pour la mise à jour du statut d'une tâche
  describe("updateStatutTache", () => {
    it("devrait mettre à jour le statut d'une tâche avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        statut: "TERMINEE",
        commentaire: "Tâche terminée avec succès"
      };
      
      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        id_chambre: 101,
        id_responsable: 1, // Responsable = utilisateur connecté
        type_tache: "NETTOYAGE",
        statut: "EN_COURS"
      };

      const mockTacheMiseAJour = {
        ...mockTache,
        statut: "TERMINEE"
      };

      mockModelInstance.findById.mockResolvedValue(mockTache);
      mockModelInstance.updateStatut.mockResolvedValue(mockTacheMiseAJour);

      // Act
      await planningController.updateStatutTache(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(mockModelInstance.updateStatut).toHaveBeenCalledWith(1, "TERMINEE", {
        commentaire: "Tâche terminée avec succès",
        id_utilisateur: 1
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Statut de la tâche mis à jour avec succès",
        data: mockTacheMiseAJour,
      });
    });

    it("devrait retourner 400 si le statut est invalide", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        statut: "STATUT_INVALIDE"
      };

      // Act
      await planningController.updateStatutTache(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Statut invalide. Les valeurs acceptées sont: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE",
      });
      expect(mockModelInstance.updateStatut).not.toHaveBeenCalled();
    });
  });

  // Tests pour l'ajout d'un commentaire
  describe("ajouterCommentaire", () => {
    it("devrait ajouter un commentaire à une tâche avec succès", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {
        contenu: "Commentaire de test"
      };
      
      const mockTache = {
        id_tache: 1,
        titre: "Nettoyage chambre 101",
        id_chambre: 101,
        id_responsable: 1, // Responsable = utilisateur connecté
        id_createur: 1,
        type_tache: "NETTOYAGE",
        statut: "EN_COURS"
      };

      const mockCommentaire = {
        id_commentaire: 1,
        id_tache: 1,
        id_utilisateur: 1,
        contenu: "Commentaire de test",
        date_creation: new Date(),
        utilisateur: {
          nom_utilisateur: "admin",
          role: "ADMIN_GENERAL"
        }
      };

      mockModelInstance.findById.mockResolvedValue(mockTache);
      mockModelInstance.ajouterCommentaire.mockResolvedValue(mockCommentaire);

      // Act
      await planningController.ajouterCommentaire(req, res);

      // Assert
      expect(mockModelInstance.findById).toHaveBeenCalledWith(1);
      expect(mockModelInstance.ajouterCommentaire).toHaveBeenCalledWith(1, 1, "Commentaire de test");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Commentaire ajouté avec succès",
        data: mockCommentaire,
      });
    });

    it("devrait retourner 400 si le contenu est manquant", async () => {
      // Arrange
      req.params = { id: "1" };
      req.body = {}; // Contenu manquant

      // Act
      await planningController.ajouterCommentaire(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Le contenu du commentaire est requis",
      });
      expect(mockModelInstance.ajouterCommentaire).not.toHaveBeenCalled();
    });
  });

  // Tests pour la récupération des tâches par responsable
  describe("getTachesByResponsable", () => {
    it("devrait récupérer les tâches d'un responsable", async () => {
      // Arrange
      req.params = { id_responsable: "1" }; // Même que l'utilisateur connecté
      req.query = { statut: "PLANIFIEE" };
      
      const mockTaches = [
        {
          id_tache: 1,
          titre: "Nettoyage chambre 101",
          id_chambre: 101,
          id_responsable: 1,
          type_tache: "NETTOYAGE",
          statut: "PLANIFIEE"
        },
        {
          id_tache: 2,
          titre: "Nettoyage chambre 102",
          id_chambre: 102,
          id_responsable: 1,
          type_tache: "NETTOYAGE",
          statut: "PLANIFIEE"
        }
      ];

      mockModelInstance.getByResponsable.mockResolvedValue(mockTaches);

      // Act
      await planningController.getTachesByResponsable(req, res);

      // Assert
      expect(mockModelInstance.getByResponsable).toHaveBeenCalledWith(1, {
        statut: "PLANIFIEE",
        date_debut: undefined,
        date_fin: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâches récupérées avec succès",
        data: mockTaches,
      });
    });

    it("devrait retourner 403 si l'utilisateur n'est pas autorisé", async () => {
      // Arrange
      req.params = { id_responsable: "2" }; // Différent de l'utilisateur connecté
      req.user.role = "PERSONNEL_MENAGE"; // Rôle non autorisé

      // Modifier le mock pour ce test spécifique
      jest.spyOn(require("../../src/utils/roleMapper.js").RoleMapper, "hasAuthorizedRole")
        .mockReturnValueOnce(false);

      // Act
      await planningController.getTachesByResponsable(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Vous n'êtes pas autorisé à voir ces tâches",
      });
      expect(mockModelInstance.getByResponsable).not.toHaveBeenCalled();
    });
  });

  // Tests pour la récupération des tâches par chambre
  describe("getTachesByChambre", () => {
    it("devrait récupérer les tâches d'une chambre", async () => {
      // Arrange
      req.params = { id_chambre: "101" };
      req.query = { type_tache: "NETTOYAGE" };
      
      const mockTaches = [
        {
          id_tache: 1,
          titre: "Nettoyage chambre 101",
          id_chambre: 101,
          id_responsable: 1,
          type_tache: "NETTOYAGE",
          statut: "PLANIFIEE"
        },
        {
          id_tache: 3,
          titre: "Nettoyage chambre 101",
          id_chambre: 101,
          id_responsable: 2,
          type_tache: "NETTOYAGE",
          statut: "TERMINEE"
        }
      ];

      mockModelInstance.getByChambre.mockResolvedValue(mockTaches);

      // Act
      await planningController.getTachesByChambre(req, res);

      // Assert
      expect(mockModelInstance.getByChambre).toHaveBeenCalledWith(101, {
        statut: undefined,
        type_tache: "NETTOYAGE"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "OK",
        message: "Tâches récupérées avec succès",
        data: mockTaches,
      });
    });

    it("devrait gérer les erreurs lors de la récupération des tâches", async () => {
      // Arrange
      req.params = { id_chambre: "101" };
      mockModelInstance.getByChambre.mockRejectedValue(new Error("Erreur de base de données"));

      // Act
      await planningController.getTachesByChambre(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "ERROR",
        message: "Erreur lors de la récupération des tâches",
        error: "Erreur de base de données",
      });
    });
  });
});