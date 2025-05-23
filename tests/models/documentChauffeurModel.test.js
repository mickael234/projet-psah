import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import DocumentChauffeurModel from '../../src/models/documentChauffer.model.js';

describe('DocumentChauffeurModel', () => {
    const mockPersonnel = {
        id_personnel: 1,
        permis_url: 'https://docs.com/permis.pdf',
        piece_identite_url: 'https://docs.com/cni.pdf',
        date_expiration_permis: new Date('2026-01-01'),
        documents_verifies: true,
        est_actif: true
    };

    /**
     * Avant chaque test, on simule le comportement des méthodes `update` et `findMany` de Prisma.
     */
    beforeEach(() => {
        jest.spyOn(prisma.personnel, 'update').mockResolvedValue(mockPersonnel);
        jest.spyOn(prisma.personnel, 'findMany').mockResolvedValue([
            mockPersonnel
        ]);
    });

    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => jest.clearAllMocks());

    it('doit uploader les documents chauffeur', async () => {
        /**
         * Teste l'upload des documents pour un chauffeur.
         * Vérifie que la méthode `uploadDocuments` retourne correctement les données du chauffeur avec les documents téléchargés.
         */
        const data = {
            permis_url: mockPersonnel.permis_url,
            piece_identite_url: mockPersonnel.piece_identite_url,
            date_expiration_permis: mockPersonnel.date_expiration_permis
        };
        const result = await DocumentChauffeurModel.uploadDocuments(1, data);
        expect(result).toEqual(mockPersonnel);
    });

    it('doit valider les documents chauffeur', async () => {
        /**
         * Teste la validation des documents pour un chauffeur.
         * Vérifie que la méthode `validerDocuments` met à jour correctement les informations du chauffeur.
         */
        const result = await DocumentChauffeurModel.validerDocuments(1, true);
        expect(result).toEqual(mockPersonnel);
    });

    it('doit retourner les chauffeurs avec permis expiré', async () => {
        /**
         * Teste la récupération des chauffeurs dont le permis est expiré.
         * Vérifie que la méthode `findChauffeursAvecPermisExpire` retourne bien les chauffeurs dont le permis a expiré.
         */
        const result =
            await DocumentChauffeurModel.findChauffeursAvecPermisExpire();
        expect(result).toEqual([mockPersonnel]);
    });
});
