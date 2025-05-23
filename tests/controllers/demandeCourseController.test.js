import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';

jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getClientIdFromUser: jest.fn()
}));

let DemandeCourseController, DemandeCourseService, AuthHelpers;

describe('DemandeCourseController', () => {
    let req, res, next;

    beforeEach(async () => {
        jest.resetModules();

        DemandeCourseController = (
            await import('../../src/controllers/demandeCourseController.js')
        ).default;
        DemandeCourseService = (
            await import('../../src/services/demandeCourse.service.js')
        ).default;
        AuthHelpers = await import('../../src/utils/auth.helpers.js');

        req = {
            params: {},
            query: {},
            body: {},
            utilisateur: { email: 'client@example.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        jest.spyOn(DemandeCourseService, 'getById').mockResolvedValue({});
        jest.spyOn(DemandeCourseService, 'getByClient').mockResolvedValue([]);
        jest.spyOn(DemandeCourseService, 'getEnAttente').mockResolvedValue([]);
        jest.spyOn(DemandeCourseService, 'creerDemande').mockResolvedValue({});
        jest.spyOn(DemandeCourseService, 'modifierDemande').mockResolvedValue({});
        jest.spyOn(DemandeCourseService, 'changerStatut').mockResolvedValue({});
        jest.spyOn(DemandeCourseService, 'supprimer').mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getById - devrait retourner une demande existante', async () => {
        req.params.id = '1';
        await DemandeCourseController.getById(req, res, next);
        expect(DemandeCourseService.getById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getMesDemandes - devrait retourner les demandes du client connecté', async () => {
        AuthHelpers.getClientIdFromUser.mockResolvedValue(10);
        req.query = { statut: 'en_attente' };

        await DemandeCourseController.getMesDemandes(req, res, next);

        expect(DemandeCourseService.getByClient).toHaveBeenCalledWith(10, {
            statut: 'en_attente'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getEnAttente - devrait retourner les demandes en attente', async () => {
        req.query = { dateMin: '2025-01-01', dateMax: '2025-01-07' };

        await DemandeCourseController.getEnAttente(req, res, next);

        expect(DemandeCourseService.getEnAttente).toHaveBeenCalledWith({
            dateMin: '2025-01-01',
            dateMax: '2025-01-07'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('create - devrait créer une demande de course', async () => {
        AuthHelpers.getClientIdFromUser.mockResolvedValue(20);
        req.body = {
            lieu_depart: 'A',
            lieu_arrivee: 'B'
        };

        await DemandeCourseController.create(req, res, next);

        expect(DemandeCourseService.creerDemande).toHaveBeenCalledWith({
            lieu_depart: 'A',
            lieu_arrivee: 'B',
            id_client: 20
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('update - devrait modifier une demande existante', async () => {
        req.params.id = '5';
        req.body = { lieu_depart: 'C' };

        await DemandeCourseController.update(req, res, next);

        expect(DemandeCourseService.modifierDemande).toHaveBeenCalledWith(5, {
            lieu_depart: 'C'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('updateStatut - devrait mettre à jour le statut de la demande', async () => {
        req.params.id = '8';
        req.body = { statut: 'acceptee' };

        await DemandeCourseController.updateStatut(req, res, next);

        expect(DemandeCourseService.changerStatut).toHaveBeenCalledWith(
            8,
            'acceptee'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('delete - devrait supprimer une demande', async () => {
        req.params.id = '9';

        await DemandeCourseController.delete(req, res, next);

        expect(DemandeCourseService.supprimer).toHaveBeenCalledWith(9);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
