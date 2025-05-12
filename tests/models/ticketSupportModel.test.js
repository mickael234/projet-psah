import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import TicketSupportModel from '../../src/models/ticketSupport.model.js';

describe("Ticket Support Model", () => {
    /**
     * Configuration avant chaque test
     * - Mock des fonctions Prisma 
     * - Chaque fonction mockée retourne une valeur par défaut
     */
    beforeEach(() => {
      jest.spyOn(prisma.ticketSupport, "findUnique").mockImplementation(() => Promise.resolve({}));
      jest.spyOn(prisma.ticketSupport, "findMany").mockImplementation(() => Promise.resolve([]));
      jest.spyOn(prisma.ticketSupport, "create").mockImplementation(() => Promise.resolve({}));
      jest.spyOn(prisma.ticketSupport, "update").mockImplementation(() => Promise.resolve({}));
    });
  
    /**
     * Nettoyage après chaque test
     * - Réinitialise tous les mocks pour éviter les interférences entre les tests
     */
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    /**
     * Tests pour la méthode findById
     */
    describe("findById", () => {
      it("doit appeler prisma.ticketSupport.findUnique avec les bons paramètres", async () => {
        // Arrange
        const ticketId = 123;
        const mockTicket = { 
          id_ticket: ticketId, 
          sujet: "Problème technique", 
          client: { nom: "Client Test" } 
        };
        prisma.ticketSupport.findUnique.mockResolvedValue(mockTicket);
  
        // Act
        const result = await TicketSupportModel.findById(ticketId);
  
        // Assert
        expect(prisma.ticketSupport.findUnique).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.findUnique).toHaveBeenCalledWith({
          where: { id_ticket: ticketId },
          include: {
            client: true,
            personnel: true,
            emails_envoyes: true
          }
        });
        expect(result).toEqual(mockTicket);
      });
  
      it("doit propager l'erreur si prisma.ticketSupport.findUnique échoue", async () => {
        // Arrange
        const ticketId = 123;
        const mockError = new Error("Erreur de base de données");
        prisma.ticketSupport.findUnique.mockRejectedValue(mockError);
  
        // Act & Assert
        await expect(TicketSupportModel.findById(ticketId)).rejects.toThrow(mockError);
        expect(prisma.ticketSupport.findUnique).toHaveBeenCalledTimes(1);
      });
    });
  
    /**
     * Tests pour la méthode findAll
     */
    describe("findAll", () => {
      it("doit appeler prisma.ticketSupport.findMany sans filtre lorsque aucun filtre n'est fourni", async () => {
        // Arrange
        const mockTickets = [
          { id_ticket: 1, sujet: "Ticket 1" },
          { id_ticket: 2, sujet: "Ticket 2" }
        ];
        prisma.ticketSupport.findMany.mockResolvedValue(mockTickets);
  
        // Act
        const result = await TicketSupportModel.findAll();
  
        // Assert
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledWith({
          where: {},
          include: {
            client: true,
            personnel: true,
            emails_envoyes: true
          }
        });
        expect(result).toEqual(mockTickets);
      });
  
      it("doit appeler prisma.ticketSupport.findMany avec les filtres appropriés", async () => {
        // Arrange
        const filters = { statut: "en_cours", type: "technique" };
        const mockTickets = [{ id_ticket: 1, sujet: "Ticket filtré", statut: "en_cours", type: "technique" }];
        prisma.ticketSupport.findMany.mockResolvedValue(mockTickets);
  
        // Act
        const result = await TicketSupportModel.findAll(filters);
  
        // Assert
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledWith({
          where: filters,
          include: {
            client: true,
            personnel: true,
            emails_envoyes: true
          }
        });
        expect(result).toEqual(mockTickets);
      });
    });
  
    /**
     * Tests pour la méthode findByClient
     */
    describe("findByClient", () => {
      it("doit appeler prisma.ticketSupport.findMany avec l'ID du client", async () => {
        // Arrange
        const clientId = 456;
        const mockTickets = [
          { id_ticket: 1, sujet: "Ticket Client 1", id_client: clientId },
          { id_ticket: 2, sujet: "Ticket Client 2", id_client: clientId }
        ];
        prisma.ticketSupport.findMany.mockResolvedValue(mockTickets);
  
        // Act
        const result = await TicketSupportModel.findByClient(clientId);
  
        // Assert
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.findMany).toHaveBeenCalledWith({
          where: { id_client: clientId },
          include: {
            personnel: true,
            emails_envoyes: true
          }
        });
        expect(result).toEqual(mockTickets);
      });
    });
  
    /**
     * Tests pour la méthode create
     */
    describe("create", () => {
      it("doit appeler prisma.ticketSupport.create avec les données du ticket", async () => {
        // Arrange
        const ticketData = {
          sujet: "Nouveau ticket",
          type: "technique",
          description: "Description du problème",
          id_client: 456,
          id_personnel: 789
        };
        const mockCreatedTicket = { 
          id_ticket: 999, 
          ...ticketData,
          statut: "en_attente",
          date_creation: new Date()
        };
        prisma.ticketSupport.create.mockResolvedValue(mockCreatedTicket);
  
        // Act
        const result = await TicketSupportModel.create(ticketData);
  
        // Assert
        expect(prisma.ticketSupport.create).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.create).toHaveBeenCalledWith({
          data: ticketData
        });
        expect(result).toEqual(mockCreatedTicket);
      });
    });
  
    /**
     * Tests pour la méthode assignToSelf
     */
    describe("assignToSelf", () => {
      it("doit appeler prisma.ticketSupport.update pour assigner un ticket à un personnel", async () => {
        // Arrange
        const ticketId = 123;
        const personnelId = 456;
        const mockUpdatedTicket = { 
          id_ticket: ticketId, 
          id_personnel: personnelId, 
          sujet: "Ticket assigné"
        };
        prisma.ticketSupport.update.mockResolvedValue(mockUpdatedTicket);
  
        // Act
        const result = await TicketSupportModel.assignToSelf(ticketId, personnelId);
  
        // Assert
        expect(prisma.ticketSupport.update).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.update).toHaveBeenCalledWith({
          where: { id_ticket: ticketId },
          data: { id_personnel: personnelId }
        });
        expect(result).toEqual(mockUpdatedTicket);
      });
    });
  
    /**
     * Tests pour la méthode updateStatut
     */
    describe("updateStatut", () => {
      it("doit appeler prisma.ticketSupport.update pour changer le statut d'un ticket", async () => {
        // Arrange
        const ticketId = 123;
        const newStatut = "résolu";
        const mockUpdatedTicket = { 
          id_ticket: ticketId, 
          statut: newStatut,
          sujet: "Ticket résolu"
        };
        prisma.ticketSupport.update.mockResolvedValue(mockUpdatedTicket);
  
        // Act
        const result = await TicketSupportModel.updateStatut(ticketId, newStatut);
  
        // Assert
        expect(prisma.ticketSupport.update).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.update).toHaveBeenCalledWith({
          where: { id_ticket: ticketId },
          data: { statut: newStatut }
        });
        expect(result).toEqual(mockUpdatedTicket);
      });
    });
  
    /**
     * Tests pour la méthode reassignTo
     */
    describe("reassignTo", () => {
      it("doit appeler prisma.ticketSupport.update pour réassigner un ticket à un autre personnel", async () => {
        // Arrange
        const ticketId = 123;
        const newPersonnelId = 789;
        const mockUpdatedTicket = { 
          id_ticket: ticketId, 
          id_personnel: newPersonnelId, 
          sujet: "Ticket réassigné"
        };
        prisma.ticketSupport.update.mockResolvedValue(mockUpdatedTicket);
  
        // Act
        const result = await TicketSupportModel.reassignTo(ticketId, newPersonnelId);
  
        // Assert
        expect(prisma.ticketSupport.update).toHaveBeenCalledTimes(1);
        expect(prisma.ticketSupport.update).toHaveBeenCalledWith({
          where: { id_ticket: ticketId },
          data: { id_personnel: newPersonnelId }
        });
        expect(result).toEqual(mockUpdatedTicket);
      });
    });
  });