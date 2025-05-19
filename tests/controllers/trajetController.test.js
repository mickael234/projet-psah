import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';

jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn(),
    getClientIdFromUser: jest.fn(),
    assertChauffeurAutorise: jest.fn()
}));

let TrajetController, TrajetService, AuthHelpers;

describe('TrajetController', () => {
    let req, res, next;

    beforeEach(async () => {
        jest.resetModules();

        TrajetController = (
            await import('../../src/controllers/trajetController.js')
        ).default;
        TrajetService = (await import('../../src/services/trajet.service.js'))
            .default;
        AuthHelpers = await import('../../src/utils/auth.helpers.js');

        req = {
            params: {},
            query: {},
            body: {},
            user: { email: 'test@example.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        jest.spyOn(TrajetService, 'getById').mockResolvedValue({});
        jest.spyOn(TrajetService, 'getByChauffeur').mockResolvedValue([]);
        jest.spyOn(TrajetService, 'getPlanningParJour').mockResolvedValue([]);
        jest.spyOn(TrajetService, 'creerTrajet').mockResolvedValue({});
        jest.spyOn(TrajetService, 'modifierHoraires').mockResolvedValue({});
        jest.spyOn(TrajetService, 'changerStatut').mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('devrait retourner un trajet existant', async () => {
            req.params.id = '1';
            AuthHelpers.assertChauffeurAutorise.mockResolvedValue(2);

            await TrajetController.getById(req, res, next);

            expect(TrajetService.getById).toHaveBeenCalledWith(1, 2);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getMyTrajets', () => {
        it('devrait retourner les trajets du chauffeur connecté', async () => {
            AuthHelpers.assertChauffeurAutorise.mockResolvedValue(3);
            req.query = { statut: 'en_cours' };

            await TrajetController.getMyTrajets(req, res, next);

            expect(TrajetService.getByChauffeur).toHaveBeenCalledWith(3, {
                statut: 'en_cours'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getPlanning', () => {
        it('devrait retourner le planning des trajets par jour', async () => {
            AuthHelpers.assertChauffeurAutorise.mockResolvedValue(4);
            req.query = { dateMin: '2025-01-01', dateMax: '2025-01-07' };

            await TrajetController.getPlanning(req, res, next);

            expect(TrajetService.getPlanningParJour).toHaveBeenCalledWith(
                4,
                '2025-01-01',
                '2025-01-07'
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('create', () => {
        it('devrait créer un nouveau trajet', async () => {
            const req = {
                user: { email: 'chauffeur1@example.com' },
                body: {
                    date_prise_en_charge: "2025-01-01T10:00",
                    date_depose: "2025-01-01T11:00",
                    id_demande_course: 1
                }
            };
            
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            
            const next = jest.fn();
            
            AuthHelpers.assertChauffeurAutorise.mockResolvedValue(123);
            
            const mockTrajet = {
                id: 1,
                id_personnel: 123,
                id_demande_course: 1,
                date_prise_en_charge: new Date("2025-01-01T10:00"),
                date_depose: new Date("2025-01-01T11:00"),
                statut: 'en_attente'
            };
            jest.spyOn(TrajetService, 'creerTrajet').mockResolvedValue(mockTrajet);
            
            await TrajetController.create(req, res, next);
            
            const personnelId = 123;
            
            expect(TrajetService.creerTrajet).toHaveBeenCalledWith(personnelId, req.body);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateHoraires', () => {
        it('devrait mettre à jour les horaires d’un trajet', async () => {
            req.params.id = '5';
            req.body = {
                date_prise_en_charge: '2025-01-02T10:00',
                date_depose: '2025-01-02T12:00'
            };
            AuthHelpers.getClientIdFromUser.mockResolvedValue(6);

            await TrajetController.updateHoraires(req, res, next);

            expect(TrajetService.modifierHoraires).toHaveBeenCalledWith(
                5,
                6,
                '2025-01-02T10:00',
                '2025-01-02T12:00'
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('updateStatut', () => {
        it('devrait modifier le statut d’un trajet', async () => {
            req.params.id = '9';
            req.body = { statut: 'termine' };
            AuthHelpers.getPersonnelIdFromUser.mockResolvedValue(7);

            await TrajetController.updateStatut(req, res, next);

            expect(TrajetService.changerStatut).toHaveBeenCalledWith(
                9,
                'termine',
                7
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});