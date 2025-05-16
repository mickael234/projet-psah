import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import DemandeCourseModel from '../../src/models/demandeCourse.model.js';

describe('DemandeCourseModel', () => {
    /**
     * Mocke les méthodes Prisma avant chaque test
     */
    beforeEach(() => {
        jest.spyOn(prisma.demandeCourse, 'findUnique').mockImplementation(() =>
            Promise.resolve({})
        );
        jest.spyOn(prisma.demandeCourse, 'findMany').mockImplementation(() =>
            Promise.resolve([])
        );
        jest.spyOn(prisma.demandeCourse, 'create').mockImplementation(() =>
            Promise.resolve({})
        );
        jest.spyOn(prisma.demandeCourse, 'update').mockImplementation(() =>
            Promise.resolve({})
        );
        jest.spyOn(prisma.demandeCourse, 'delete').mockImplementation(() =>
            Promise.resolve({})
        );
    });

    /**
     * Réinitialise les mocks après chaque test
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        /**
         * Vérifie que findById utilise correctement prisma.demandeCourse.findUnique
         */
        it('doit appeler prisma.demandeCourse.findUnique avec le bon id', async () => {
            const id = 1;
            const mockResult = { id_demande_course: id, statut: 'en_attente' };
            prisma.demandeCourse.findUnique.mockResolvedValue(mockResult);

            const result = await DemandeCourseModel.findById(id);

            expect(prisma.demandeCourse.findUnique).toHaveBeenCalledWith({
                where: { id_demande_course: id },
                include: {
                    client: {
                        select: {
                            nom: true,
                            prenom: true
                        }
                    },
                    trajet: true
                }
            });
            expect(result).toEqual(mockResult);
        });
    });

    describe('findAllByClient', () => {
        /**
         * Vérifie que findAllByClient filtre correctement par id_client et dates
         */
        it('doit appeler prisma.demandeCourse.findMany avec le bon id_client et les filtres', async () => {
            const clientId = 10;
            const filters = {
                statut: 'en_attente',
                dateMin: '2024-05-01',
                dateMax: '2024-05-31'
            };

            await DemandeCourseModel.findAllByClient(clientId, filters);

            expect(prisma.demandeCourse.findMany).toHaveBeenCalledWith({
                where: {
                    id_client: clientId,
                    statut: 'en_attente',
                    date_demande: {
                        gte: new Date('2024-05-01'),
                        lte: new Date('2024-05-31')
                    }
                },
                orderBy: { date_demande: 'desc' },
                include: { trajet: true }
            });
        });
    });

    describe('findPending', () => {
        /**
         * Vérifie que findPending récupère toutes les demandes en attente
         */
        it('doit appeler prisma.demandeCourse.findMany pour les demandes en attente', async () => {
            await DemandeCourseModel.findPending();

            expect(prisma.demandeCourse.findMany).toHaveBeenCalledWith({
                where: { statut: 'en_attente' },
                orderBy: { date_demande: 'asc' },
                include: {
                    client: {
                        select: {
                            nom: true,
                            prenom: true
                        }
                    }
                }
            });
        });
    });

    describe('create', () => {
        /**
         * Vérifie que create appelle prisma.demandeCourse.create avec les bonnes données
         */
        it('doit appeler prisma.demandeCourse.create avec les bonnes données', async () => {
            const data = {
                id_client: 2,
                lieu_depart: 'A',
                lieu_arrivee: 'B',
                date_demande: new Date(),
                statut: 'en_attente'
            };

            await DemandeCourseModel.create(data);

            expect(prisma.demandeCourse.create).toHaveBeenCalledWith({ data });
        });
    });

    describe('update', () => {
        /**
         * Vérifie que update applique les bonnes données de mise à jour
         */
        it('doit appeler prisma.demandeCourse.update avec les bons paramètres', async () => {
            const id = 7;
            const data = { lieu_depart: 'X', lieu_arrivee: 'Y' };

            await DemandeCourseModel.update(id, data);

            expect(prisma.demandeCourse.update).toHaveBeenCalledWith({
                where: { id_demande_course: id },
                data
            });
        });
    });

    describe('updateStatut', () => {
        /**
         * Vérifie que updateStatut modifie correctement le statut de la demande
         */
        it('doit appeler prisma.demandeCourse.update avec le nouveau statut', async () => {
            const id = 5;
            const statut = 'acceptee';

            await DemandeCourseModel.updateStatut(id, statut);

            expect(prisma.demandeCourse.update).toHaveBeenCalledWith({
                where: { id_demande_course: id },
                data: { statut }
            });
        });
    });

    describe('delete', () => {
        /**
         * Vérifie que delete supprime bien la demande avec le bon id
         */
        it('doit appeler prisma.demandeCourse.delete avec le bon id', async () => {
            const id = 99;

            await DemandeCourseModel.delete(id);

            expect(prisma.demandeCourse.delete).toHaveBeenCalledWith({
                where: { id_demande_course: id }
            });
        });
    });
});
