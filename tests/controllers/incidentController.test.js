import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';

// Mock de la fonction d'authentification pour récupérer l'ID de l'utilisateur
jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getUtilisateurIdFromUser: jest.fn()
}));

let IncidentController, IncidentService, AuthHelpers;

describe('IncidentController', () => {
    let req, res, next;

    /**
     * Avant chaque test, on réinitialise les modules, les mocks et les objets nécessaires
     * à l'exécution des tests pour isoler chaque test et éviter les interférences.
     */
    beforeEach(async () => {
        jest.resetModules();

        // Importation des modules nécessaires
        IncidentController = (
            await import('../../src/controllers/incidentController.js')
        ).default;
        IncidentService = (
            await import('../../src/services/incident.service.js')
        ).default;
        AuthHelpers = await import('../../src/utils/auth.helpers.js');

        // Initialisation des objets de requête, réponse et du middleware 'next'
        req = {
            params: {},
            body: {},
            utilisateur: { email: 'client@example.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        // Mock des services
        jest.spyOn(IncidentService, 'signalerIncident').mockResolvedValue({});
        jest.spyOn(IncidentService, 'getByTrajetId').mockResolvedValue({});
        jest.spyOn(IncidentService, 'getAllIncidents').mockResolvedValue([]);
        jest.spyOn(IncidentService, 'traiterIncident').mockResolvedValue({});
    });

    /**
     * Après chaque test, on nettoie les mocks pour éviter des interférences entre les tests.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signaler', () => {
        /**
         * Teste la fonctionnalité de signalement d'un incident.
         * Vérifie que l'incident est correctement signalé avec les données envoyées.
         * On s'assure que le service `signalerIncident` est appelé avec les bonnes données,
         * et que la réponse retourne un statut 201.
         */
        it('devrait signaler un incident', async () => {
            AuthHelpers.getUtilisateurIdFromUser.mockResolvedValue(1);
            req.body = {
                type: 'accident',
                description: 'Choc sur le pare-choc.'
            };

            await IncidentController.signaler(req, res, next);

            expect(IncidentService.signalerIncident).toHaveBeenCalledWith(
                expect.objectContaining({
                    id_utilisateur: 1,
                    type: 'accident',
                    description: 'Choc sur le pare-choc.'
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getByTrajet', () => {
        /**
         * Teste la récupération d'un incident lié à un trajet spécifique.
         * Vérifie que le service `getByTrajetId` est appelé avec l'ID du trajet
         * et que la réponse retourne un statut 200.
         */
        it('devrait retourner un incident lié à un trajet', async () => {
            req.params.id = '42';

            await IncidentController.getByTrajet(req, res, next);

            expect(IncidentService.getByTrajetId).toHaveBeenCalledWith(42);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getAll', () => {
        /**
         * Teste la récupération de tous les incidents.
         * On s'assure que le service `getAllIncidents` est appelé et que la réponse
         * contient tous les incidents sous forme de données dans la réponse JSON avec un statut 200.
         */
        it('devrait retourner tous les incidents', async () => {
            const incidents = [{ id_incident: 1 }, { id_incident: 2 }];
            IncidentService.getAllIncidents.mockResolvedValue(incidents);

            await IncidentController.getAll(req, res, next);

            expect(IncidentService.getAllIncidents).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ data: incidents })
            );
        });
    });

    describe('traiter', () => {
        /**
         * Teste la fonctionnalité de marquage d'un incident comme traité.
         * Vérifie que le service `traiterIncident` est appelé avec l'ID de l'incident
         * et que la réponse retourne un statut 200.
         */
        it('devrait marquer un incident comme traité', async () => {
            req.params.id = '5';

            await IncidentController.traiter(req, res, next);

            expect(IncidentService.traiterIncident).toHaveBeenCalledWith(5);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
