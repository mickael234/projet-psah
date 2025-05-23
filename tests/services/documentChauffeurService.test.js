import { jest, describe, it, expect, afterEach } from '@jest/globals';
import DocumentChauffeurService from '../../src/services/documentChauffeur.service.js';
import DocumentChauffeurModel from '../../src/models/documentChauffer.model.js';
import PersonnelModel from '../../src/models/personnel.model.js';
import { ValidationError, NotFoundError } from '../../src/errors/apiError.js';

describe('DocumentChauffeurService', () => {
    const mockData = {
        permis_url: 'https://mock.permis.url',
        piece_identite_url: 'https://mock.cni.url',
        date_expiration_permis: new Date('2026-01-01')
    };

    const mockPersonnel = {
        id_personnel: 1,
        ...mockData,
        documents_verifies: false
    };

    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => jest.clearAllMocks());

    describe('upload', () => {
        /**
         * Avant chaque test dans cette section, on simule le comportement de la méthode `uploadDocuments`
         * du modèle `DocumentChauffeurModel` pour retourner un personnel fictif.
         */
        beforeEach(() => {
            jest.spyOn(
                DocumentChauffeurModel,
                'uploadDocuments'
            ).mockResolvedValue(mockPersonnel);
        });

        it('devrait téléverser des documents valides', async () => {
            /**
             * Teste la téléversement de documents valides.
             * Vérifie que le service `upload` retourne correctement le personnel avec les données.
             */
            const result = await DocumentChauffeurService.upload(1, mockData);
            expect(result).toEqual(mockPersonnel);
        });

        it('doit lancer une ValidationError si des champs sont manquants', async () => {
            /**
             * Teste le cas où des champs sont manquants lors du téléversement des documents.
             * Vérifie que le service lance une erreur `ValidationError` si les données sont invalides.
             */
            await expect(
                DocumentChauffeurService.upload(1, {})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('valider', () => {
        /**
         * Avant chaque test dans cette section, on simule le comportement de la méthode `validerDocuments`
         * du modèle `DocumentChauffeurModel` pour simuler la validation réussie des documents.
         */
        beforeEach(() => {
            jest.spyOn(
                DocumentChauffeurModel,
                'validerDocuments'
            ).mockResolvedValue({ documents_verifies: true });
        });

        it('devrait valider les documents', async () => {
            /**
             * Teste la validation des documents d'un chauffeur.
             * Vérifie que le service `valider` retourne bien les informations sur les documents validés.
             */
            jest.spyOn(PersonnelModel, 'getWithRelations').mockResolvedValue({
                id: 2,
                nom: 'Nom Test'
            });
            const result = await DocumentChauffeurService.valider(2, true);
            expect(result).toEqual({ documents_verifies: true });
        });
    });

    describe('getChauffeursAvecPermisExpire', () => {
        it('retourne une liste de chauffeurs expirés', async () => {
            /**
             * Teste la récupération des chauffeurs dont le permis est expiré.
             * Vérifie que la méthode `getChauffeursAvecPermisExpire` retourne la bonne liste de chauffeurs.
             */
            jest.spyOn(
                DocumentChauffeurModel,
                'findChauffeursAvecPermisExpire'
            ).mockResolvedValue([mockPersonnel]);
            const result =
                await DocumentChauffeurService.getChauffeursAvecPermisExpire();
            expect(result).toHaveLength(1);
        });

        it('lance NotFoundError si aucun chauffeur trouvé', async () => {
            /**
             * Teste le cas où aucun chauffeur n'a de permis expiré.
             * Vérifie que la méthode lance une `NotFoundError` si la liste est vide.
             */
            jest.spyOn(
                DocumentChauffeurModel,
                'findChauffeursAvecPermisExpire'
            ).mockResolvedValue([]);
            await expect(
                DocumentChauffeurService.getChauffeursAvecPermisExpire()
            ).rejects.toThrow(NotFoundError);
        });
    });
});
