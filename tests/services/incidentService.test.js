import { jest, describe, it, expect, afterEach } from '@jest/globals';
import IncidentService from '../../src/services/incident.service.js';
import IncidentModel from '../../src/models/incident.model.js';
import { ValidationError, NotFoundError } from '../../src/errors/apiError.js';

describe('IncidentService', () => {
    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signalerIncident', () => {
        /**
         * Teste la création d'un incident avec des données valides.
         * Vérifie que le service `signalerIncident` retourne correctement un incident avec les données passées.
         */
        it('doit créer un incident avec des données valides', async () => {
            const data = {
                id_utilisateur: 1,
                type: 'panne',
                description: 'Le véhicule ne démarre pas.'
            };
            const mockIncident = { id_incident: 10, ...data };
            jest.spyOn(IncidentModel, 'signaler').mockResolvedValue(
                mockIncident
            );

            const result = await IncidentService.signalerIncident(data);
            expect(result).toEqual(mockIncident);
        });

        /**
         * Teste la gestion des données incomplètes.
         * Vérifie que le service lance une `ValidationError` si les données sont insuffisantes.
         */
        it('doit lancer une erreur si les données sont incomplètes', async () => {
            await expect(
                IncidentService.signalerIncident({ type: 'panne' })
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('getByTrajetId', () => {
        /**
         * Teste la récupération d'un incident existant pour un trajet donné.
         * Vérifie que le service retourne un incident trouvé pour un ID de trajet spécifique.
         */
        it('doit retourner un incident existant pour un trajet donné', async () => {
            const mockIncident = { id_incident: 5, id_trajet: 22 };
            jest.spyOn(IncidentModel, 'findByTrajetId').mockResolvedValue(
                mockIncident
            );

            const result = await IncidentService.getByTrajetId(22);
            expect(result).toEqual(mockIncident);
        });

        /**
         * Teste la gestion d'un ID de trajet invalide.
         * Vérifie que le service lance une `ValidationError` si l'ID du trajet est invalide.
         */
        it('doit lancer une erreur si idTrajet est invalide', async () => {
            await expect(IncidentService.getByTrajetId(null)).rejects.toThrow(
                ValidationError
            );
        });

        /**
         * Teste le cas où aucun incident n'est trouvé pour un ID de trajet donné.
         * Vérifie que le service lance une `NotFoundError` si aucun incident n'est trouvé.
         */
        it('doit lancer une erreur si aucun incident trouvé', async () => {
            jest.spyOn(IncidentModel, 'findByTrajetId').mockResolvedValue(null);
            await expect(IncidentService.getByTrajetId(99)).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('getAllIncidents', () => {
        /**
         * Teste la récupération de tous les incidents existants.
         * Vérifie que le service retourne correctement tous les incidents présents dans la base de données.
         */
        it('doit retourner tous les incidents existants', async () => {
            const incidents = [{ id_incident: 1 }, { id_incident: 2 }];
            jest.spyOn(IncidentModel, 'findAll').mockResolvedValue(incidents);

            const result = await IncidentService.getAllIncidents();
            expect(result).toEqual(incidents);
        });

        /**
         * Teste le cas où aucun incident n'est trouvé.
         * Vérifie que le service lance une `NotFoundError` si aucun incident n'est trouvé.
         */
        it('doit lancer une erreur si aucun incident n’est trouvé', async () => {
            jest.spyOn(IncidentModel, 'findAll').mockResolvedValue([]);
            await expect(IncidentService.getAllIncidents()).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('traiterIncident', () => {
        /**
         * Teste le marquage d'un incident comme traité.
         * Vérifie que le service `traiterIncident` retourne correctement un incident marqué comme traité.
         */
        it('doit marquer un incident comme traité', async () => {
            const mockResult = { id_incident: 3, statut: 'traite' };
            jest.spyOn(IncidentModel, 'marquerCommeTraite').mockResolvedValue(
                mockResult
            );

            const result = await IncidentService.traiterIncident(3);
            expect(result).toEqual(mockResult);
        });

        /**
         * Teste la gestion d'un ID d'incident invalide.
         * Vérifie que le service lance une `ValidationError` si l'ID de l'incident est invalide.
         */
        it('doit lancer une erreur si l’ID est invalide', async () => {
            await expect(IncidentService.traiterIncident('')).rejects.toThrow(
                ValidationError
            );
        });
    });
});
