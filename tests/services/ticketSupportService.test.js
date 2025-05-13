import { jest,describe,it,expect,afterEach} from '@jest/globals';
import TicketSupportService from '../../src/services/ticketSupport.service.js';
import TicketSupportModel from '../../src/models/ticketSupport.model.js';
import PersonnelModel from '../../src/models/personnel.model.js';
import ClientModel from '../../src/models/client.model.js';
import { ValidationError, NotFoundError } from '../../src/errors/apiError.js';

describe('TicketSupportService', () => {
    // Nettoyer les spies après chaque test
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Tests pour la méthode getTicketById
     */
    describe('getTicketById', () => {
        it('doit récupérer un ticket existant par son ID', async () => {
            // Arrange
            const ticketId = 123;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Problème technique'
            };
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );

            // Act
            const result = await TicketSupportService.getTicketById(ticketId);

            // Assert
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findById).toHaveBeenCalledWith(ticketId);
            expect(result).toEqual(mockTicket);
        });

        it("doit lancer ValidationError si l'ID du ticket est invalide", async () => {
            // Arrange
            jest.spyOn(TicketSupportModel, 'findById');

            // Act / Assert
            await expect(
                TicketSupportService.getTicketById(null)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.getTicketById('abc')
            ).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.findById).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le ticket n'existe pas", async () => {
            // Arrange
            const ticketId = 999;
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(null);

            // Act / Assert
            await expect(
                TicketSupportService.getTicketById(ticketId)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * Tests pour la méthode getTicketsByClient
     */
    describe('getTicketsByClient', () => {
        it("doit récupérer les tickets d'un client existant", async () => {
            // Arrange
            const clientId = 456;
            const mockClient = { id_client: clientId, nom: 'Client Test' };
            const mockTickets = [
                { id_ticket: 1, sujet: 'Ticket 1', id_client: clientId },
                { id_ticket: 2, sujet: 'Ticket 2', id_client: clientId }
            ];

            jest.spyOn(ClientModel, 'getWithRelations').mockReturnValue(
                mockClient
            );
            jest.spyOn(TicketSupportModel, 'findByClient').mockResolvedValue(
                mockTickets
            );

            // Act
            const result =
                await TicketSupportService.getTicketsByClient(clientId);

            // Assert
            expect(ClientModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(ClientModel.getWithRelations).toHaveBeenCalledWith(clientId);
            expect(TicketSupportModel.findByClient).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findByClient).toHaveBeenCalledWith(
                clientId
            );
            expect(result).toEqual(mockTickets);
        });

        it("doit lancer ValidationError si l'ID client est invalide", async () => {
            // Arrange
            jest.spyOn(ClientModel, 'getWithRelations');
            jest.spyOn(TicketSupportModel, 'findByClient');

            // Act / Assert
            await expect(
                TicketSupportService.getTicketsByClient(null)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.getTicketsByClient('abc')
            ).rejects.toThrow(ValidationError);
            expect(ClientModel.getWithRelations).not.toHaveBeenCalled();
            expect(TicketSupportModel.findByClient).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le client n'existe pas", async () => {
            // Arrange
            const clientId = 999;
            jest.spyOn(ClientModel, 'getWithRelations').mockReturnValue(null);
            jest.spyOn(TicketSupportModel, 'findByClient');

            // Act / Assert
            await expect(
                TicketSupportService.getTicketsByClient(clientId)
            ).rejects.toThrow(NotFoundError);
            expect(ClientModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findByClient).not.toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la méthode getAllTickets
     */
    describe('getAllTickets', () => {
        it('doit récupérer tous les tickets sans filtre', async () => {
            // Arrange
            const mockTickets = [
                { id_ticket: 1, sujet: 'Ticket 1' },
                { id_ticket: 2, sujet: 'Ticket 2' }
            ];
            jest.spyOn(TicketSupportModel, 'findAll').mockResolvedValue(
                mockTickets
            );

            // Act
            const result = await TicketSupportService.getAllTickets();

            // Assert
            expect(TicketSupportModel.findAll).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findAll).toHaveBeenCalledWith({});
            expect(result).toEqual(mockTickets);
        });

        it('doit récupérer les tickets avec filtres', async () => {
            // Arrange
            const filters = { statut: 'en_cours' };
            const mockTickets = [
                { id_ticket: 3, sujet: 'Ticket 3', statut: 'en_cours' }
            ];
            jest.spyOn(TicketSupportModel, 'findAll').mockResolvedValue(
                mockTickets
            );

            // Act
            const result = await TicketSupportService.getAllTickets(filters);

            // Assert
            expect(TicketSupportModel.findAll).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findAll).toHaveBeenCalledWith(filters);
            expect(result).toEqual(mockTickets);
        });
    });

    /**
     * Tests pour la méthode assignTicket
     */
    describe('assignTicket', () => {
        it('doit assigner un ticket à un membre du personnel', async () => {
            // Arrange
            const ticketId = 123;
            const personnelId = 789;
            const mockTicket = { id_ticket: ticketId, sujet: 'Ticket test' };
            const mockPersonnel = {
                id_personnel: personnelId,
                nom: 'Support Test'
            };
            const mockAssignedTicket = {
                ...mockTicket,
                id_personnel: personnelId
            };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );
            jest.spyOn(PersonnelModel, 'getWithRelations').mockReturnValue(
                mockPersonnel
            );
            jest.spyOn(TicketSupportModel, 'assignToSelf').mockResolvedValue(
                mockAssignedTicket
            );

            // Act
            const result = await TicketSupportService.assignTicket(
                ticketId,
                personnelId
            );

            // Assert
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findById).toHaveBeenCalledWith(ticketId);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledWith(
                personnelId
            );
            expect(TicketSupportModel.assignToSelf).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.assignToSelf).toHaveBeenCalledWith(
                ticketId,
                personnelId
            );
            expect(result).toEqual(mockAssignedTicket);
        });

        it('doit lancer ValidationError si les IDs sont invalides', async () => {
            // Arrange
            jest.spyOn(TicketSupportModel, 'findById');
            jest.spyOn(PersonnelModel, 'getWithRelations');
            jest.spyOn(TicketSupportModel, 'assignToSelf');

            // Act / Assert
            await expect(
                TicketSupportService.assignTicket(null, 123)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.assignTicket(123, null)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.assignTicket('abc', 123)
            ).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.findById).not.toHaveBeenCalled();
            expect(PersonnelModel.getWithRelations).not.toHaveBeenCalled();
            expect(TicketSupportModel.assignToSelf).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le ticket n'existe pas", async () => {
            // Arrange
            const ticketId = 999;
            const personnelId = 789;
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(null);
            jest.spyOn(PersonnelModel, 'getWithRelations');
            jest.spyOn(TicketSupportModel, 'assignToSelf');

            // Act / Assert
            await expect(
                TicketSupportService.assignTicket(ticketId, personnelId)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).not.toHaveBeenCalled();
            expect(TicketSupportModel.assignToSelf).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le personnel n'existe pas", async () => {
            // Arrange
            const ticketId = 123;
            const personnelId = 999;
            const mockTicket = { id_ticket: ticketId, sujet: 'Ticket test' };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );
            jest.spyOn(PersonnelModel, 'getWithRelations').mockReturnValue(
                null
            );
            jest.spyOn(TicketSupportModel, 'assignToSelf');

            // Act / Assert
            await expect(
                TicketSupportService.assignTicket(ticketId, personnelId)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.assignToSelf).not.toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la méthode updateTicketStatus
     */
    describe('updateTicketStatus', () => {
        it("doit mettre à jour le statut d'un ticket", async () => {
            // Arrange
            const ticketId = 123;
            const statut = 'en_cours';
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Ticket test',
                statut: 'en_attente'
            };
            const mockUpdatedTicket = { ...mockTicket, statut };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );
            jest.spyOn(TicketSupportModel, 'updateStatut').mockResolvedValue(
                mockUpdatedTicket
            );

            // Act
            const result = await TicketSupportService.updateTicketStatus(
                ticketId,
                statut
            );

            // Assert
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findById).toHaveBeenCalledWith(ticketId);
            expect(TicketSupportModel.updateStatut).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.updateStatut).toHaveBeenCalledWith(
                ticketId,
                statut
            );
            expect(result).toEqual(mockUpdatedTicket);
        });

        it('doit lancer ValidationError si le statut est invalide', async () => {
            // Arrange
            const ticketId = 123;
            const statut = 'statut_invalide';
            jest.spyOn(TicketSupportModel, 'findById');
            jest.spyOn(TicketSupportModel, 'updateStatut');

            // Act / Assert
            await expect(
                TicketSupportService.updateTicketStatus(ticketId, statut)
            ).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.findById).not.toHaveBeenCalled();
            expect(TicketSupportModel.updateStatut).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le ticket n'existe pas", async () => {
            // Arrange
            const ticketId = 999;
            const statut = 'en_cours';
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(null);
            jest.spyOn(TicketSupportModel, 'updateStatut');

            // Act / Assert
            await expect(
                TicketSupportService.updateTicketStatus(ticketId, statut)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.updateStatut).not.toHaveBeenCalled();
        });
    });

    /**
     * Tests pour la méthode reassignTicket
     */
    describe('reassignTicket', () => {
        it('doit réassigner un ticket à un autre membre du personnel', async () => {
            // Arrange
            const ticketId = 123;
            const newPersonnelId = 789;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Ticket test',
                id_personnel: 456
            };
            const mockPersonnel = {
                id_personnel: newPersonnelId,
                nom: 'Nouveau Support'
            };
            const mockReassignedTicket = {
                ...mockTicket,
                id_personnel: newPersonnelId
            };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );
            jest.spyOn(PersonnelModel, 'getWithRelations').mockReturnValue(
                mockPersonnel
            );
            jest.spyOn(TicketSupportModel, 'reassignTo').mockResolvedValue(
                mockReassignedTicket
            );

            // Act
            const result = await TicketSupportService.reassignTicket(
                ticketId,
                newPersonnelId
            );

            // Assert
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.findById).toHaveBeenCalledWith(ticketId);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledWith(
                newPersonnelId
            );
            expect(TicketSupportModel.reassignTo).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.reassignTo).toHaveBeenCalledWith(
                ticketId,
                newPersonnelId
            );
            expect(result).toEqual(mockReassignedTicket);
        });

        it('doit lancer ValidationError si les IDs sont invalides', async () => {
            // Arrange
            jest.spyOn(TicketSupportModel, 'findById');
            jest.spyOn(PersonnelModel, 'getWithRelations');
            jest.spyOn(TicketSupportModel, 'reassignTo');

            // Act / Assert
            await expect(
                TicketSupportService.reassignTicket(null, 123)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.reassignTicket(123, null)
            ).rejects.toThrow(ValidationError);
            await expect(
                TicketSupportService.reassignTicket('abc', 123)
            ).rejects.toThrow(ValidationError);
            expect(TicketSupportModel.findById).not.toHaveBeenCalled();
            expect(PersonnelModel.getWithRelations).not.toHaveBeenCalled();
            expect(TicketSupportModel.reassignTo).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le ticket n'existe pas", async () => {
            // Arrange
            const ticketId = 999;
            const newPersonnelId = 789;
            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(null);
            jest.spyOn(PersonnelModel, 'getWithRelations');
            jest.spyOn(TicketSupportModel, 'reassignTo');

            // Act / Assert
            await expect(
                TicketSupportService.reassignTicket(ticketId, newPersonnelId)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).not.toHaveBeenCalled();
            expect(TicketSupportModel.reassignTo).not.toHaveBeenCalled();
        });

        it("doit lancer NotFoundError si le personnel n'existe pas", async () => {
            // Arrange
            const ticketId = 123;
            const newPersonnelId = 999;
            const mockTicket = {
                id_ticket: ticketId,
                sujet: 'Ticket test',
                id_personnel: 456
            };

            jest.spyOn(TicketSupportModel, 'findById').mockResolvedValue(
                mockTicket
            );
            jest.spyOn(PersonnelModel, 'getWithRelations').mockReturnValue(
                null
            );
            jest.spyOn(TicketSupportModel, 'reassignTo');

            // Act / Assert
            await expect(
                TicketSupportService.reassignTicket(ticketId, newPersonnelId)
            ).rejects.toThrow(NotFoundError);
            expect(TicketSupportModel.findById).toHaveBeenCalledTimes(1);
            expect(PersonnelModel.getWithRelations).toHaveBeenCalledTimes(1);
            expect(TicketSupportModel.reassignTo).not.toHaveBeenCalled();
        });
    });
});
