import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';

// Mock des fonctions utilitaires d'authentification
jest.unstable_mockModule('../../src/utils/auth.helpers.js', () => ({
    getPersonnelIdFromUser: jest.fn()
}));

let DocumentChauffeurController,
    DocumentChauffeurService,
    AuthHelpers,
    req,
    res,
    next;

describe('DocumentChauffeurController', () => {

    /**
     * Avant chaque test, initialisation des mocks et des variables nécessaires pour les tests.
     * Réinitialisation des modules et des fonctions mockées.
     */

    beforeEach(async () => {
        jest.resetModules();

        DocumentChauffeurController = (
            await import(
                '../../src/controllers/documentChauffeurController.js'
            )
        ).default;
        DocumentChauffeurService = (
            await import('../../src/services/documentChauffeur.service.js')
        ).default;
        AuthHelpers = await import('../../src/utils/auth.helpers.js');

        req = {
            params: {},
            body: {},
            utilisateur: { email: 'test@example.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        jest.spyOn(DocumentChauffeurService, 'upload').mockResolvedValue({});
        jest.spyOn(DocumentChauffeurService, 'valider').mockResolvedValue({});
        jest.spyOn(
            DocumentChauffeurService,
            'getChauffeursAvecPermisExpire'
        ).mockResolvedValue([]);
    });

    /**
     * Après chaque test, nettoyage des mocks pour éviter les interférences entre tests.
     */

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Teste le téléversement des documents pour le chauffeur connecté.
     * Il s'assure que le service `upload` est appelé avec les bons arguments et que la réponse a un statut 200.
     */
    describe('upload', () => {
        it('devrait téléverser les documents du chauffeur connecté', async () => {
            AuthHelpers.getPersonnelIdFromUser.mockResolvedValue(123);
            req.body = {
                permis_url: 'https://mock.permis',
                piece_identite_url: 'https://mock.id',
                date_expiration_permis: '2025-12-01'
            };

            await DocumentChauffeurController.upload(req, res, next);

            expect(DocumentChauffeurService.upload).toHaveBeenCalledWith(
                123,
                req.body
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

     /**
     * Teste la validation des documents d'un chauffeur.
     * Vérifie que le service `valider` est appelé avec les bons arguments et que la réponse a un statut 200.
     */

    describe('valider', () => {
        it('devrait valider les documents d’un chauffeur', async () => {
            req.params.id = '7';
            req.body = { isValid: true };

            await DocumentChauffeurController.valider(req, res, next);

            expect(DocumentChauffeurService.valider).toHaveBeenCalledWith(
                7,
                true
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    /**
     * Teste la récupération des chauffeurs dont le permis est expiré.
     * Vérifie que la fonction retourne la liste des chauffeurs et que la réponse a un statut 200.
     */

    describe('getChauffeursAvecPermisExpire', () => {
        it('devrait retourner les chauffeurs avec permis expiré', async () => {
            const expiredList = [
                {
                    id_personnel: 1,
                    permis_url: 'url1',
                    date_expiration_permis: '2023-01-01'
                }
            ];
            DocumentChauffeurService.getChauffeursAvecPermisExpire.mockResolvedValue(
                expiredList
            );

            await DocumentChauffeurController.getChauffeursAvecPermisExpire(
                req,
                res,
                next
            );

            expect(
                DocumentChauffeurService.getChauffeursAvecPermisExpire
            ).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expiredList
                })
            );
        });
    });
});
