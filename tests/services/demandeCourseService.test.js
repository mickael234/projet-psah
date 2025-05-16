import { jest, describe, it, expect, afterEach } from '@jest/globals';
import DemandeCourseService from '../../src/services/demandeCourse.service.js';
import DemandeCourseModel from '../../src/models/demandeCourse.model.js';
import { ValidationError, NotFoundError } from '../../src/errors/apiError.js';

describe('DemandeCourseService', () => {
    /**
     * Nettoie tous les mocks après chaque test
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        /**
         * Vérifie que getById retourne une demande existante
         */
        it('devrait retourner une demande valide si trouvée', async () => {
            const id = 1;
            const mockDemande = { id_demande_course: id, statut: 'en_attente' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );

            const result = await DemandeCourseService.getById(id);
            expect(DemandeCourseModel.findById).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockDemande);
        });

        /**
         * Vérifie que getById lance une ValidationError si l'ID est invalide
         */
        it('devrait lancer ValidationError si ID invalide', async () => {
            await expect(DemandeCourseService.getById('abc')).rejects.toThrow(
                ValidationError
            );
        });

        /**
         * Vérifie que getById lance une NotFoundError si la demande n'existe pas
         */
        it('devrait lancer NotFoundError si la demande est introuvable', async () => {
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(null);
            await expect(DemandeCourseService.getById(999)).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('getByClient', () => {
        /**
         * Vérifie que getByClient retourne les demandes du client
         */
        it('devrait retourner les demandes du client', async () => {
            const clientId = 1;
            const mockDemandes = [{}, {}];
            jest.spyOn(DemandeCourseModel, 'findAllByClient').mockResolvedValue(
                mockDemandes
            );

            const result = await DemandeCourseService.getByClient(clientId);
            expect(DemandeCourseModel.findAllByClient).toHaveBeenCalledWith(
                clientId,
                {}
            );
            expect(result).toEqual(mockDemandes);
        });

        /**
         * Vérifie que getByClient lance une erreur si l'ID client est manquant
         */
        it('devrait lancer ValidationError si ID client est manquant', async () => {
            await expect(
                DemandeCourseService.getByClient(null)
            ).rejects.toThrow(ValidationError);
        });

        /**
         * Vérifie que getByClient lance NotFoundError si aucune demande n'est trouvée
         */
        it('devrait lancer NotFoundError si aucune demande trouvée', async () => {
            jest.spyOn(DemandeCourseModel, 'findAllByClient').mockResolvedValue(
                []
            );
            await expect(DemandeCourseService.getByClient(1)).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('getEnAttente', () => {
        /**
         * Vérifie que getEnAttente retourne les demandes en attente
         */
        it('devrait retourner les demandes en attente', async () => {
            const mockDemandes = [{}, {}];
            jest.spyOn(DemandeCourseModel, 'findPending').mockResolvedValue(
                mockDemandes
            );

            const result = await DemandeCourseService.getEnAttente();
            expect(DemandeCourseModel.findPending).toHaveBeenCalled();
            expect(result).toEqual(mockDemandes);
        });

        /**
         * Vérifie que getEnAttente lance une erreur si aucune demande n'est trouvée
         */
        it('devrait lancer NotFoundError si aucune demande en attente', async () => {
            jest.spyOn(DemandeCourseModel, 'findPending').mockResolvedValue([]);
            await expect(DemandeCourseService.getEnAttente()).rejects.toThrow(
                NotFoundError
            );
        });
    });

    describe('creerDemande', () => {
        /**
         * Vérifie que creerDemande crée une demande valide
         */
        it('devrait créer une nouvelle demande', async () => {
            const data = { id_client: 2, lieu_depart: 'A', lieu_arrivee: 'B' };
            const mockCreated = { ...data, id_demande_course: 99 };
            jest.spyOn(DemandeCourseModel, 'create').mockResolvedValue(
                mockCreated
            );

            const result = await DemandeCourseService.creerDemande(data);
            expect(DemandeCourseModel.create).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });

        /**
         * Vérifie que creerDemande rejette les données invalides
         */
        it('devrait lancer ValidationError si données invalides', async () => {
            const badData = {
                id_client: 'abc',
                lieu_depart: '',
                lieu_arrivee: ''
            };
            await expect(
                DemandeCourseService.creerDemande(badData)
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('modifierDemande', () => {
        /**
         * Vérifie que modifierDemande met à jour une demande en attente
         */
        it('devrait mettre à jour une demande en attente', async () => {
            const id = 1;
            const mockDemande = { id_demande_course: id, statut: 'en_attente' };
            const updateData = { lieu_depart: 'Nouveau lieu' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            jest.spyOn(DemandeCourseModel, 'update').mockResolvedValue({
                ...mockDemande,
                ...updateData
            });

            const result = await DemandeCourseService.modifierDemande(
                id,
                updateData
            );
            expect(DemandeCourseModel.update).toHaveBeenCalled();
            expect(result).toEqual({ ...mockDemande, ...updateData });
        });

        /**
         * Vérifie que modifierDemande échoue si le statut n'est pas en_attente
         */
        it('devrait refuser la modification si le statut est différent de en_attente', async () => {
            const mockDemande = { id_demande_course: 1, statut: 'acceptee' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            await expect(
                DemandeCourseService.modifierDemande(1, {})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('changerStatut', () => {
        /**
         * Vérifie que changerStatut met à jour le statut si valide
         */
        it('devrait changer le statut si valide', async () => {
            const id = 1;
            const mockDemande = { id_demande_course: id, statut: 'en_attente' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            jest.spyOn(DemandeCourseModel, 'updateStatut').mockResolvedValue({
                ...mockDemande,
                statut: 'acceptee'
            });

            const result = await DemandeCourseService.changerStatut(
                id,
                'acceptee'
            );
            expect(DemandeCourseModel.updateStatut).toHaveBeenCalledWith(
                id,
                'acceptee'
            );
            expect(result).toEqual({ ...mockDemande, statut: 'acceptee' });
        });

        /**
         * Vérifie que changerStatut échoue si le statut est invalide
         */
        it('devrait lancer une erreur si statut invalide', async () => {
            const mockDemande = { id_demande_course: 1, statut: 'en_attente' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            await expect(
                DemandeCourseService.changerStatut(1, 'invalide')
            ).rejects.toThrow(ValidationError);
        });

        /**
         * Vérifie que changerStatut échoue si la demande est déjà traitée
         */
        it('devrait lancer une erreur si la demande est déjà traitée', async () => {
            const mockDemande = { id_demande_course: 1, statut: 'acceptee' };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            await expect(
                DemandeCourseService.changerStatut(1, 'refusee')
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('supprimer', () => {
        /**
         * Vérifie que supprimer retire une demande existante
         */
        it('devrait supprimer une demande existante', async () => {
            const id = 5;
            const mockDemande = { id_demande_course: id };
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(
                mockDemande
            );
            jest.spyOn(DemandeCourseModel, 'delete').mockResolvedValue(
                mockDemande
            );

            const result = await DemandeCourseService.supprimer(id);
            expect(DemandeCourseModel.delete).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockDemande);
        });

        /**
         * Vérifie que supprimer lance une erreur si la demande n'existe pas
         */
        it('devrait lancer NotFoundError si la demande est introuvable', async () => {
            jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(null);
            await expect(DemandeCourseService.supprimer(999)).rejects.toThrow(
                NotFoundError
            );
        });
    });
});
