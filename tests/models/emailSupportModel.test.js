import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import EmailSupportModel from '../../src/models/emailSupport.model.js';
import prisma from '../../src/config/prisma.js'; 


describe("Email Support Model", () => {
  /**
   * Configuration avant chaque test
   * - Mock des fonctions Prisma
   * - Chaque fonction mockée retourne une valeur par défaut
   */
  beforeEach(() => {
    jest.spyOn(prisma.emailSupport, "create").mockImplementation(() => Promise.resolve({}));
    jest.spyOn(prisma.emailSupport, "findMany").mockImplementation(() => Promise.resolve([]));
  });

  /**
   * Nettoyage après chaque test
   * - Réinitialise tous les mocks pour éviter les interférences entre les tests
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Tests pour la méthode sendEmail
   */
  describe("sendEmail", () => {
    it("doit appeler prisma.emailSupport.create avec les données de l'email", async () => {
      // Arrange
      const emailData = {
        id_ticket: 123,
        email_client: "client@example.com",
        email_destinataire: "support@example.com",
        sujet: "Demande d'assistance",
        message: "Contenu du message d'assistance"
      };
      const mockCreatedEmail = {
        id_email: 456,
        ...emailData,
        date_envoi: new Date()
      };
      prisma.emailSupport.create.mockResolvedValue(mockCreatedEmail);

      // Act
      const result = await EmailSupportModel.sendEmail(emailData);

      // Assert
      expect(prisma.emailSupport.create).toHaveBeenCalledTimes(1);
      expect(prisma.emailSupport.create).toHaveBeenCalledWith({
        data: emailData
      });
      expect(result).toEqual(mockCreatedEmail);
    });

    it("doit propager l'erreur si prisma.emailSupport.create échoue", async () => {
      // Arrange
      const emailData = {
        id_ticket: 123,
        email_client: "client@example.com",
        email_destinataire: "support@example.com",
        sujet: "Demande d'assistance",
        message: "Contenu du message d'assistance"
      };
      const mockError = new Error("Erreur de création d'email");
      prisma.emailSupport.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(EmailSupportModel.sendEmail(emailData)).rejects.toThrow(mockError);
      expect(prisma.emailSupport.create).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Tests pour la méthode findByTicket
   */
  describe("findByTicket", () => {
    it("doit appeler prisma.emailSupport.findMany avec l'ID du ticket", async () => {
      // Arrange
      const ticketId = 123;
      const mockEmails = [
        {
          id_email: 1,
          id_ticket: ticketId,
          email_client: "client@example.com",
          email_destinataire: "support@example.com",
          sujet: "Premier email",
          message: "Premier message",
          date_envoi: new Date("2025-01-01")
        },
        {
          id_email: 2,
          id_ticket: ticketId,
          email_client: "client@example.com",
          email_destinataire: "support@example.com",
          sujet: "Deuxième email",
          message: "Deuxième message",
          date_envoi: new Date("2025-01-02")
        }
      ];
      prisma.emailSupport.findMany.mockResolvedValue(mockEmails);

      // Act
      const result = await EmailSupportModel.findByTicket(ticketId);

      // Assert
      expect(prisma.emailSupport.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.emailSupport.findMany).toHaveBeenCalledWith({
        where: { id_ticket: ticketId },
        orderBy: { date_envoi: 'asc' }
      });
      expect(result).toEqual(mockEmails);
    });

    it("doit retourner un tableau vide si aucun email n'est trouvé", async () => {
      // Arrange
      const ticketId = 999; // ID d'un ticket sans emails
      prisma.emailSupport.findMany.mockResolvedValue([]);

      // Act
      const result = await EmailSupportModel.findByTicket(ticketId);

      // Assert
      expect(prisma.emailSupport.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("doit propager l'erreur si prisma.emailSupport.findMany échoue", async () => {
      // Arrange
      const ticketId = 123;
      const mockError = new Error("Erreur de recherche d'emails");
      prisma.emailSupport.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(EmailSupportModel.findByTicket(ticketId)).rejects.toThrow(mockError);
      expect(prisma.emailSupport.findMany).toHaveBeenCalledTimes(1);
    });
  });
});