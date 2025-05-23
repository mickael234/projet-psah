import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import FormationModel from '../../src/models/formation.model.js';

describe('FormationModel', () => {
    const mockFormation = {
        id: 1,
        titre: 'Formation sécurité',
        obligatoire: true,
        active: true
    };

    const mockAssignment = {
        id: 1,
        id_personnel: 10,
        id_formation: 1,
        completee: false,
        date_completion: null
    };

    /**
     * Avant chaque test, on simule le comportement des méthodes de Prisma pour la gestion des formations et des assignations.
     */
    beforeEach(() => {
        jest.spyOn(prisma.formation, 'create').mockResolvedValue(mockFormation);
        jest.spyOn(prisma.formation, 'update').mockResolvedValue(mockFormation);
        jest.spyOn(prisma.formation, 'findMany').mockResolvedValue([
            mockFormation
        ]);
        jest.spyOn(prisma.formationsChauffeur, 'create').mockResolvedValue(
            mockAssignment
        );
        jest.spyOn(prisma.formationsChauffeur, 'findMany').mockResolvedValue([
            mockAssignment
        ]);
        jest.spyOn(prisma.formationsChauffeur, 'updateMany').mockResolvedValue({
            count: 1
        });
    });

    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => jest.clearAllMocks());

    it('doit créer une formation', async () => {
        /**
         * Teste la création d'une nouvelle formation.
         * Vérifie que la méthode `create` crée correctement une formation dans la base de données.
         */
        const result = await FormationModel.create({
            titre: 'Formation sécurité'
        });
        expect(result).toEqual(mockFormation);
    });

    it('doit retourner les formations', async () => {
        /**
         * Teste la récupération de toutes les formations.
         * Vérifie que la méthode `findAll` retourne bien toutes les formations existantes.
         */
        const result = await FormationModel.findAll();
        expect(result).toEqual([mockFormation]);
    });

    it('doit mettre à jour une formation', async () => {
        /**
         * Teste la mise à jour d'une formation existante.
         * Vérifie que la méthode `update` met correctement à jour une formation en base de données.
         */
        const result = await FormationModel.update(1, { obligatoire: true });
        expect(result).toEqual(mockFormation);
    });

    it('doit désactiver une formation', async () => {
        /**
         * Teste la désactivation d'une formation.
         * Vérifie que la méthode `disable` désactive correctement la formation.
         */
        const result = await FormationModel.disable(1);
        expect(result).toEqual(mockFormation);
    });

    it('doit assigner une formation à un chauffeur', async () => {
        /**
         * Teste l'assignation d'une formation à un chauffeur.
         * Vérifie que la méthode `assignerFormation` assigne correctement la formation au chauffeur.
         */
        const result = await FormationModel.assignerFormation(10, 1);
        expect(result).toEqual(mockAssignment);
    });

    it('doit marquer une formation comme complétée', async () => {
        /**
         * Teste la complétion d'une formation.
         * Vérifie que la méthode `marquerCommeComplete` marque correctement la formation comme complétée pour le chauffeur.
         */
        const result = await FormationModel.marquerCommeComplete(10, 1);
        expect(result).toEqual({ count: 1 });
    });
});
