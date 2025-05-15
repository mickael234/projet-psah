import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import TrajetModel from '../../src/models/trajet.model.js';

describe('Trajet Model', () => {
    beforeEach(() => {
        jest.spyOn(prisma.trajet, 'findUnique').mockImplementation(() =>
            Promise.resolve({})
        );
        jest.spyOn(prisma.trajet, 'findMany').mockImplementation(() =>
            Promise.resolve([])
        );
        jest.spyOn(prisma.trajet, 'create').mockImplementation(() =>
            Promise.resolve({})
        );
        jest.spyOn(prisma.trajet, 'update').mockImplementation(() =>
            Promise.resolve({})
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('doit appeler prisma.trajet.findUnique avec les bons paramètres', async () => {
            const id = 101;
            const mockResult = { id_trajet: id, statut: 'en_attente' };
            prisma.trajet.findUnique.mockResolvedValue(mockResult);

            const result = await TrajetModel.findById(id);

            expect(prisma.trajet.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.trajet.findUnique).toHaveBeenCalledWith({
                where: { id_trajet: id },
                include: {
                    personnel: true,
                    demandeCourse: { select: { id_client: true } }
                }
            });
            expect(result).toEqual(mockResult);
        });

        it("doit propager l'erreur si prisma.trajet.findUnique échoue", async () => {
            const id = 101;
            const mockError = new Error('Erreur DB');
            prisma.trajet.findUnique.mockRejectedValue(mockError);

            await expect(TrajetModel.findById(id)).rejects.toThrow(mockError);
        });
    });

    describe('findAllByChauffeur', () => {
        it('doit appeler prisma.trajet.findMany avec les bons filtres', async () => {
            const id_personnel = 5;
            const filters = {
                statut: 'en_cours',
                dateMin: '2024-05-01',
                dateMax: '2024-05-31'
            };
            await TrajetModel.findAllByChauffeur(id_personnel, filters);

            expect(prisma.trajet.findMany).toHaveBeenCalledWith({
                where: {
                    id_personnel,
                    statut: 'en_cours',
                    date_prise_en_charge: {
                        gte: new Date('2024-05-01'),
                        lte: new Date('2024-05-31')
                    }
                },
                orderBy: { date_prise_en_charge: 'asc' },
                include: { demandeCourse: true }
            });
        });
    });

    describe('create', () => {
        it('doit appeler prisma.trajet.create avec les bonnes données', async () => {
            const data = {
                id_personnel: 1,
                id_demande_course: 2,
                date_prise_en_charge: new Date(),
                date_depose: new Date(),
                statut: 'en_attente'
            };

            await TrajetModel.create(data);

            expect(prisma.trajet.create).toHaveBeenCalledWith({
                data
            });
        });
    });

    describe('updateStatut', () => {
        it('doit appeler prisma.trajet.update avec le bon statut', async () => {
            const id = 11;
            const statut = 'termine';

            await TrajetModel.updateStatut(id, statut);

            expect(prisma.trajet.update).toHaveBeenCalledWith({
                where: { id_trajet: id },
                data: { statut }
            });
        });
    });

    describe('updateHoraires', () => {
        it('doit appeler prisma.trajet.update avec les nouvelles horaires', async () => {
            const id = 22;
            const date1 = new Date('2024-05-15T10:00:00');
            const date2 = new Date('2024-05-15T11:00:00');

            await TrajetModel.updateHoraires(id, date1, date2);

            expect(prisma.trajet.update).toHaveBeenCalledWith({
                where: { id_trajet: id },
                data: {
                    date_prise_en_charge: date1,
                    date_depose: date2
                }
            });
        });
    });
});
