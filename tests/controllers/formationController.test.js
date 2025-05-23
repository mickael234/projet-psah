import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
    utilisateur: {
        findUnique: jest.fn()
    }
};

// Mock du module Prisma pour simuler des requêtes à la base de données
jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    default: mockPrisma
}));

let FormationController, FormationService;

describe('FormationController', () => {
    let req, res, next;

    /**
     * Avant chaque test, réinitialisation des modules, des mocks et des objets nécessaires.
     * Préparation des mocks des services et création des objets de requête, réponse et du middleware next.
     */
    beforeEach(async () => {
        jest.resetModules();
        FormationController = (await import('../../src/controllers/formationController.js')).default;
        FormationService = (await import('../../src/services/formation.service.js')).default;

        req = {
            params: {},
            query: {},
            body: {},
            utilisateur: { email: 'test@example.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        // Mock des services
        jest.spyOn(FormationService, 'getAll').mockResolvedValue([]);
        jest.spyOn(FormationService, 'creer').mockResolvedValue({});
        jest.spyOn(FormationService, 'assigner').mockResolvedValue({});
        jest.spyOn(FormationService, 'completer').mockResolvedValue({});
        jest.spyOn(FormationService, 'getByChauffeur').mockResolvedValue([]);
        jest.spyOn(FormationService, 'getChauffeursParFormation').mockResolvedValue([]);
        jest.spyOn(FormationService, 'update').mockResolvedValue({});
        jest.spyOn(FormationService, 'disable').mockResolvedValue({});
    });

    /**
     * Après chaque test, on nettoie les mocks pour éviter toute interférence entre les tests.
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait récupérer toutes les formations', async () => {
        /**
         * Teste la récupération de toutes les formations.
         * Vérifie que le service `getAll` est bien appelé et que la réponse a un statut 200.
         */
        await FormationController.getAll(req, res, next);
        expect(FormationService.getAll).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait créer une formation', async () => {
        /**
         * Teste la création d'une nouvelle formation.
         * Vérifie que le service `creer` est bien appelé avec les données fournies et que la réponse a un statut 201.
         */
        req.body = { titre: 'Sécurité routière' };
        await FormationController.create(req, res, next);
        expect(FormationService.creer).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait assigner une formation à un chauffeur', async () => {
        /**
         * Teste l'assignation d'une formation à un chauffeur.
         * Vérifie que le service `assigner` est appelé avec les bons IDs et que la réponse a un statut 200.
         */
        req.params = { id: '5', chauffeurId: '10' };
        await FormationController.assigner(req, res, next);
        expect(FormationService.assigner).toHaveBeenCalledWith(10, 5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait marquer une formation comme complétée', async () => {
        /**
         * Teste la mise à jour d'une formation pour la marquer comme complétée.
         * Vérifie que le service `completer` est bien appelé et que la réponse retourne un statut 200.
         */
        req.params = { id: '2', chauffeurId: '7' };
        await FormationController.completer(req, res, next);
        expect(FormationService.completer).toHaveBeenCalledWith(7, 2);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait récupérer les formations par chauffeur', async () => {
        /**
         * Teste la récupération des formations assignées à un chauffeur spécifique.
         * Vérifie que le service `getByChauffeur` est appelé avec l'ID du chauffeur et que la réponse retourne un statut 200.
         */
        req.params = { id: '3' };

        mockPrisma.utilisateur.findUnique.mockResolvedValue({
            email: 'test@example.com',
            role: 'chauffeur',
            personnel: {
                id_personnel: 3
            },
            client: null
        });

        await FormationController.getByChauffeur(req, res, next);

        expect(mockPrisma.utilisateur.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
            include: { personnel: true, client: true }
        });
        expect(FormationService.getByChauffeur).toHaveBeenCalledWith(3);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait récupérer les formations par chauffeur - cas administrateur', async () => {
        /**
         * Teste la récupération des formations par chauffeur lorsque l'utilisateur est un administrateur.
         * Vérifie que le service `getByChauffeur` est appelé et que la réponse retourne un statut 200.
         */
        req.params = { id: '3' };

        mockPrisma.utilisateur.findUnique.mockResolvedValue({
            email: 'test@example.com',
            role: 'administrateur',
            personnel: null,
            client: null
        });

        await FormationController.getByChauffeur(req, res, next);

        expect(FormationService.getByChauffeur).toHaveBeenCalledWith(3);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait refuser l\'accès si l\'utilisateur n\'est pas autorisé', async () => {
        /**
         * Teste l'accès refusé si le chauffeur tente de récupérer ses propres formations mais avec un ID incorrect.
         * Vérifie que la réponse retourne un statut 403 avec un message d'accès non autorisé.
         */
        req.params = { id: '3' };

        mockPrisma.utilisateur.findUnique.mockResolvedValue({
            email: 'test@example.com',
            role: 'chauffeur',
            personnel: {
                id_personnel: 999 // ID différent de celui demandé
            },
            client: null
        });

        await FormationController.getByChauffeur(req, res, next);

        expect(FormationService.getByChauffeur).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'NON AUTORISE',
            message: 'Accès non autorisé'
        });
    });

    it('devrait récupérer les chauffeurs par formation', async () => {
        /**
         * Teste la récupération des chauffeurs affectés à une formation spécifique.
         * Vérifie que le service `getChauffeursParFormation` est appelé et que la réponse retourne un statut 200.
         */
        req.params = { id: '4' };
        await FormationController.getChauffeursParFormation(req, res, next);
        expect(FormationService.getChauffeursParFormation).toHaveBeenCalledWith(4);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait mettre à jour une formation', async () => {
        /**
         * Teste la mise à jour d'une formation existante.
         * Vérifie que le service `update` est appelé avec les bonnes données et que la réponse retourne un statut 200.
         */
        req.params = { id: '8' };
        req.body = { obligatoire: true };
        await FormationController.update(req, res, next);
        expect(FormationService.update).toHaveBeenCalledWith(8, req.body);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait désactiver une formation', async () => {
        /**
         * Teste la désactivation d'une formation existante.
         * Vérifie que le service `disable` est bien appelé et que la réponse retourne un statut 200.
         */
        req.params = { id: '6' };
        await FormationController.disable(req, res, next);
        expect(FormationService.disable).toHaveBeenCalledWith(6);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
