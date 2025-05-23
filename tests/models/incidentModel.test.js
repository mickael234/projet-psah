import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import IncidentModel from '../../src/models/incident.model.js';

describe('IncidentModel', () => {
    const mockIncident = {
        id_incident: 1,
        id_utilisateur: 1,
        id_trajet: 2,
        type: 'panne',
        description: 'Problème moteur',
        date: new Date(),
        statut: 'ouvert'
    };

    /**
     * Avant chaque test, on simule le comportement des méthodes de Prisma pour la gestion des incidents.
     */
    beforeEach(() => {
        jest.spyOn(prisma.incident, 'create').mockResolvedValue(mockIncident);
        jest.spyOn(prisma.incident, 'findMany').mockResolvedValue([
            mockIncident
        ]);
        jest.spyOn(prisma.incident, 'update').mockResolvedValue({
            ...mockIncident,
            statut: 'traite'
        });
        jest.spyOn(prisma.incident, 'findUnique').mockResolvedValue(
            mockIncident
        );
    });

    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => jest.clearAllMocks());

    it('doit créer un incident', async () => {
        /**
         * Teste la création d'un incident.
         * Vérifie que la méthode `signaler` appelle correctement la méthode `create` de Prisma pour ajouter un incident dans la base de données.
         */
        const result = await IncidentModel.signaler(mockIncident);
        expect(prisma.incident.create).toHaveBeenCalledWith({
            data: mockIncident
        });
        expect(result).toEqual(mockIncident);
    });

    it('doit trouver un incident par trajet', async () => {
        /**
         * Teste la récupération d'un incident en fonction de l'ID d'un trajet.
         * Vérifie que la méthode `findByTrajetId` appelle correctement la méthode `findMany` de Prisma avec le bon ID de trajet.
         */
        const result = await IncidentModel.findByTrajetId(2);
        expect(prisma.incident.findMany).toHaveBeenCalledWith({
            where: { id_trajet: 2 }
        });
        expect(result).toEqual([mockIncident]);
    });

    it('doit retourner tous les incidents', async () => {
        /**
         * Teste la récupération de tous les incidents.
         * Vérifie que la méthode `findAll` retourne correctement tous les incidents de la base de données.
         */
        const result = await IncidentModel.findAll();
        expect(result).toEqual([mockIncident]);
    });

    it('doit marquer un incident comme traité', async () => {
        /**
         * Teste le marquage d'un incident comme traité.
         * Vérifie que la méthode `marquerCommeTraite` appelle correctement la méthode `update` de Prisma pour mettre à jour l'état d'un incident.
         */
        const result = await IncidentModel.marquerCommeTraite(1);
        expect(result).toEqual({ ...mockIncident, statut: 'traite' });
    });
});
