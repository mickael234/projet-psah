import { describe, it, expect, jest, afterEach } from '@jest/globals';

import FormationService from '../../src/services/formation.service.js';
import FormationModel from '../../src/models/formation.model.js';
import PersonnelModel from '../../src/models/personnel.model.js';
import { NotFoundError, ValidationError } from '../../src/errors/apiError.js';

describe('FormationService', () => {
    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        /**
         * Teste la récupération de toutes les formations.
         * Vérifie que la méthode `getAll` retourne les formations présentes dans la base de données.
         */
        it('retourne les formations si présentes', async () => {
            const mockFormations = [{ id: 1, titre: 'Formation 1' }];
            jest.spyOn(FormationModel, 'findAll').mockResolvedValue(
                mockFormations
            );

            const result = await FormationService.getAll();

            expect(result).toEqual(mockFormations);
        });

        /**
         * Teste le cas où aucune formation n'est trouvée.
         * Vérifie que la méthode lance une `NotFoundError` si aucune formation n'est présente.
         */
        it('lance une NotFoundError si aucune formation', async () => {
            jest.spyOn(FormationModel, 'findAll').mockResolvedValue([]);
            await expect(FormationService.getAll()).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('assigner', () => {
        /**
         * Teste l'assignation d'une formation à un chauffeur.
         * Vérifie que les données sont validées et que la formation est correctement assignée.
         */
        it('valide les données et assigne une formation', async () => {
            const idPersonnel = 10,
                idFormation = 5;

            jest.spyOn(PersonnelModel, 'getWithRelations').mockResolvedValue({
                id: idPersonnel,
                nom: 'Nom Test'
            });
            jest.spyOn(FormationModel, 'findById').mockResolvedValue({
                id: idFormation
            });
            jest.spyOn(FormationModel, 'assignerFormation').mockResolvedValue({
                id_personnel: idPersonnel,
                id_formation: idFormation
            });

            const result = await FormationService.assigner(
                idPersonnel,
                idFormation
            );
            expect(result).toMatchObject({ id_personnel: idPersonnel });
        });

        /**
         * Teste le cas où les IDs sont invalides.
         * Vérifie que la méthode lance une `ValidationError` si les IDs fournis sont invalides.
         */
        it('rejette avec ValidationError si les IDs sont invalides', async () => {
            await expect(FormationService.assigner(null, 1)).rejects.toThrow(
                ValidationError
            );
            await expect(FormationService.assigner(1, null)).rejects.toThrow(
                ValidationError
            );
        });

        /**
         * Teste le cas où la formation est introuvable.
         * Vérifie que la méthode lance une `NotFoundError` si la formation n'est pas trouvée.
         */
        it('rejette si la formation est introuvable', async () => {
            jest.spyOn(PersonnelModel, 'getWithRelations').mockResolvedValue({
                id: 1,
                nom: 'Nom Test'
            });
            jest.spyOn(FormationModel, 'findById').mockResolvedValue(null);
            await expect(FormationService.assigner(1, 99)).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('getByChauffeur', () => {
        /**
         * Teste la récupération des formations d'un chauffeur.
         * Vérifie que la méthode `getByChauffeur` retourne bien les formations associées au chauffeur.
         */
        it('retourne les formations du chauffeur', async () => {
            jest.spyOn(PersonnelModel, 'getWithRelations').mockResolvedValue({
                id: 1,
                nom: 'Nom Test'
            });

            const formations = [{ id: 1, completee: true }];
            jest.spyOn(FormationModel, 'findByChauffeur').mockResolvedValue(
                formations
            );
            const result = await FormationService.getByChauffeur(1);
            expect(result).toEqual(formations);
        });

        /**
         * Teste le cas où aucune formation n'est trouvée pour un chauffeur.
         * Vérifie que la méthode lance une `NotFoundError` si aucun résultat n'est trouvé.
         */
        it('lance une erreur si pas de résultat', async () => {
            jest.spyOn(FormationModel, 'findByChauffeur').mockResolvedValue([]);
            await expect(FormationService.getByChauffeur(1)).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('getChauffeursParFormation', () => {
        /**
         * Teste la récupération des chauffeurs associés à une formation.
         * Vérifie que la méthode `getChauffeursParFormation` retourne bien les chauffeurs associés à une formation spécifique.
         */
        it('retourne les chauffeurs associés', async () => {
            const mockFormation = { id: 1 };
            const mockChauffeurs = [{ id_personnel: 1 }];

            jest.spyOn(FormationModel, 'findById').mockResolvedValue(
                mockFormation
            );
            jest.spyOn(
                FormationModel,
                'getChauffeursParFormation'
            ).mockResolvedValue(mockChauffeurs);

            const result = await FormationService.getChauffeursParFormation(1);
            expect(result).toEqual(mockChauffeurs);
        });

        /**
         * Teste le cas où aucun chauffeur n'est trouvé pour une formation.
         * Vérifie que la méthode lance une `NotFoundError` si aucun chauffeur n'est trouvé.
         */
        it('rejette si aucun chauffeur trouvé', async () => {
            jest.spyOn(FormationModel, 'findById').mockResolvedValue({ id: 1 });
            jest.spyOn(
                FormationModel,
                'getChauffeursParFormation'
            ).mockResolvedValue([]);

            await expect(
                FormationService.getChauffeursParFormation(1)
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('completer', () => {
        /**
         * Teste la mise à jour d'une formation pour la marquer comme complétée.
         * Vérifie que la méthode `completer` retourne bien un objet avec l'attribut `completee` égal à `true`.
         */
        it('marque une formation comme complétée', async () => {
            jest.spyOn(FormationModel, 'findById').mockResolvedValue({ id: 1 });
            jest.spyOn(
                FormationModel,
                'marquerCommeComplete'
            ).mockResolvedValue({ completee: true });

            const result = await FormationService.completer(1, 1);
            expect(result).toEqual({ completee: true });
        });
    });

    describe('creer', () => {
        /**
         * Teste la création d'une nouvelle formation.
         * Vérifie que la méthode `creer` retourne bien les données de la formation créée.
         */
        it('crée une formation', async () => {
            const mockData = { titre: 'Formation X', obligatoire: true};
            jest.spyOn(FormationModel, 'create').mockResolvedValue(mockData);

            const result = await FormationService.creer(mockData);
            expect(result).toEqual(mockData);
        });

        /**
         * Teste le cas où un champ requis est manquant lors de la création d'une formation.
         * Vérifie que la méthode lance une `ValidationError` si le titre est manquant.
         */
        it('rejette si titre manquant', async () => {
            await expect(FormationService.creer({})).rejects.toThrow(
                ValidationError
            );
        });
    });
});
