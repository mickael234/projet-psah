import { jest, describe, it, expect, afterEach } from '@jest/globals';
import TrajetService from '../../src/services/trajet.service.js';
import TrajetModel from '../../src/models/trajet.model.js';
import DemandeCourseModel from '../../src/models/demandeCourse.model.js';
import {
    ValidationError,
    NotFoundError,
    ConflictError,
    PermissionError
} from '../../src/errors/apiError.js';

describe('TrajetService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it("retourne un trajet si l'utilisateur est le bon chauffeur", async () => {
            const id = 1;
            const idPersonnel = 10;
            const mockTrajet = { id_trajet: id, id_personnel: idPersonnel };
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue(mockTrajet);

            const result = await TrajetService.getById(id, idPersonnel);

            expect(result).toEqual(mockTrajet);
        });

        it("lance une erreur si l'ID est invalide", async () => {
            await expect(TrajetService.getById(null, 1)).rejects.toThrow(
                ValidationError
            );
        });

        it('lance une NotFoundError si le trajet est introuvable', async () => {
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue(null);
            await expect(TrajetService.getById(1, 1)).rejects.toThrow(
                NotFoundError
            );
        });

        it("lance une PermissionError si ce n'est pas son trajet", async () => {
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue({
                id_trajet: 1,
                id_personnel: 99
            });
            await expect(TrajetService.getById(1, 10)).rejects.toThrow(
                PermissionError
            );
        });
    });

    describe('creerTrajet', () => {
        it('crée un trajet pour une demande acceptée', async () => {
            const idPersonnel = 1;
            
            const data = {
                id_demande_course: 2,
                date_prise_en_charge: '2024-05-10T09:00:00Z',
                date_depose: '2024-05-10T10:00:00Z'
            };
            
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue({
                statut: 'acceptee'
            });
            
            jest.spyOn(TrajetModel, 'findByDemandeId').mockResolvedValue(null); // Aucun trajet existant
            
            jest.spyOn(TrajetModel, 'create').mockResolvedValue({
                id_trajet: 1,
                id_personnel: idPersonnel,
                ...data
            });
    
            const result = await TrajetService.creerTrajet(idPersonnel, data);
            
            expect(result).toMatchObject({ id_personnel: 1 });
        });
    
        it("rejette les trajets si la demande n'est pas acceptée", async () => {
            const idPersonnel = 1;
            const data = {
                id_demande_course: 2,
                date_prise_en_charge: '2024-05-10T09:00:00Z',
                date_depose: '2024-05-10T10:00:00Z'
            };
            
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue({
                statut: 'refusee'
            });
            
            jest.spyOn(TrajetModel, 'findByDemandeId').mockResolvedValue(null); 
            
            await expect(
                TrajetService.creerTrajet(idPersonnel, data)
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('changerStatut', () => {
        it('modifie le statut si tout est valide', async () => {
            const trajet = { id_trajet: 1, id_personnel: 5 };
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue(trajet);
            jest.spyOn(TrajetModel, 'updateStatut').mockResolvedValue({
                ...trajet,
                statut: 'en_cours'
            });

            const result = await TrajetService.changerStatut(1, 'en_cours', 5);
            expect(result).toMatchObject({ statut: 'en_cours' });
        });

        it("rejette si le chauffeur n'est pas le bon", async () => {
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue({
                id_trajet: 1,
                id_personnel: 2
            });
            await expect(
                TrajetService.changerStatut(1, 'termine', 1)
            ).rejects.toThrow(PermissionError);
        });

        it('rejette si le statut est invalide', async () => {
            jest.spyOn(TrajetModel, 'findById').mockResolvedValue({
                id_trajet: 1,
                id_personnel: 1
            });
            await expect(
                TrajetService.changerStatut(1, 'invalide', 1)
            ).rejects.toThrow(ValidationError);
        });
    });
});
