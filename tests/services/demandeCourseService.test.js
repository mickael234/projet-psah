import { jest, describe, it, expect, afterEach } from '@jest/globals';
import DemandeCourseService from '../../src/services/demandeCourse.service.js';
import DemandeCourseModel from '../../src/models/demandeCourse.model.js';
import { ValidationError, NotFoundError } from '../../src/errors/apiError.js';

describe('DemandeCourseService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('devrait retourner une demande valide si trouvée', async () => {
      const id = 1;
      const mockDemande = { id_demande_course: id, statut: 'en_attente' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);

      const result = await DemandeCourseService.getById(id);
      expect(DemandeCourseModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockDemande);
    });

    it('devrait lancer ValidationError si ID invalide', async () => {
      await expect(DemandeCourseService.getById('abc')).rejects.toThrow(ValidationError);
    });

    it('devrait lancer NotFoundError si la demande est introuvable', async () => {
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(null);
      await expect(DemandeCourseService.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getByClient', () => {
    it('devrait retourner les demandes du client', async () => {
      const clientId = 1;
      const mockDemandes = [{}, {}];
      jest.spyOn(DemandeCourseModel, 'findAllByClient').mockResolvedValue(mockDemandes);

      const result = await DemandeCourseService.getByClient(clientId);
      expect(DemandeCourseModel.findAllByClient).toHaveBeenCalledWith(clientId, {});
      expect(result).toEqual(mockDemandes);
    });

    it('devrait lancer ValidationError si ID client est manquant', async () => {
      await expect(DemandeCourseService.getByClient(null)).rejects.toThrow(ValidationError);
    });

    it('devrait lancer NotFoundError si aucune demande trouvée', async () => {
      jest.spyOn(DemandeCourseModel, 'findAllByClient').mockResolvedValue([]);
      await expect(DemandeCourseService.getByClient(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getEnAttente', () => {
    it('devrait retourner les demandes en attente', async () => {
      const mockDemandes = [{}, {}];
      jest.spyOn(DemandeCourseModel, 'findPending').mockResolvedValue(mockDemandes);

      const result = await DemandeCourseService.getEnAttente();
      expect(DemandeCourseModel.findPending).toHaveBeenCalled();
      expect(result).toEqual(mockDemandes);
    });

    it('devrait lancer NotFoundError si aucune demande en attente', async () => {
      jest.spyOn(DemandeCourseModel, 'findPending').mockResolvedValue([]);
      await expect(DemandeCourseService.getEnAttente()).rejects.toThrow(NotFoundError);
    });
  });

  describe('creerDemande', () => {
    it('devrait créer une nouvelle demande', async () => {
      const data = { id_client: 2, lieu_depart: 'A', lieu_arrivee: 'B' };
      const mockCreated = { ...data, id_demande_course: 99 };
      jest.spyOn(DemandeCourseModel, 'create').mockResolvedValue(mockCreated);

      const result = await DemandeCourseService.creerDemande(data);
      expect(DemandeCourseModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });

    it('devrait lancer ValidationError si données invalides', async () => {
      const badData = { id_client: 'abc', lieu_depart: '', lieu_arrivee: '' };
      await expect(DemandeCourseService.creerDemande(badData)).rejects.toThrow(ValidationError);
    });
  });

  describe('modifierDemande', () => {
    it('devrait mettre à jour une demande en attente', async () => {
      const id = 1;
      const mockDemande = { id_demande_course: id, statut: 'en_attente' };
      const updateData = { lieu_depart: 'Nouveau lieu' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      jest.spyOn(DemandeCourseModel, 'update').mockResolvedValue({ ...mockDemande, ...updateData });

      const result = await DemandeCourseService.modifierDemande(id, updateData);
      expect(DemandeCourseModel.update).toHaveBeenCalled();
      expect(result).toEqual({ ...mockDemande, ...updateData });
    });

    it('devrait refuser la modification si le statut est différent de en_attente', async () => {
      const mockDemande = { id_demande_course: 1, statut: 'acceptee' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      await expect(DemandeCourseService.modifierDemande(1, {})).rejects.toThrow(ValidationError);
    });
  });

  describe('changerStatut', () => {
    it('devrait changer le statut si valide', async () => {
      const id = 1;
      const mockDemande = { id_demande_course: id, statut: 'en_attente' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      jest.spyOn(DemandeCourseModel, 'updateStatut').mockResolvedValue({ ...mockDemande, statut: 'acceptee' });

      const result = await DemandeCourseService.changerStatut(id, 'acceptee');
      expect(DemandeCourseModel.updateStatut).toHaveBeenCalledWith(id, 'acceptee');
      expect(result).toEqual({ ...mockDemande, statut: 'acceptee' });
    });

    it('devrait lancer une erreur si statut invalide', async () => {
      const mockDemande = { id_demande_course: 1, statut: 'en_attente' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      await expect(DemandeCourseService.changerStatut(1, 'invalide')).rejects.toThrow(ValidationError);
    });

    it('devrait lancer une erreur si la demande est déjà traitée', async () => {
      const mockDemande = { id_demande_course: 1, statut: 'acceptee' };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      await expect(DemandeCourseService.changerStatut(1, 'refusee')).rejects.toThrow(ValidationError);
    });
  });

  describe('supprimer', () => {
    it('devrait supprimer une demande existante', async () => {
      const id = 5;
      const mockDemande = { id_demande_course: id };
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(mockDemande);
      jest.spyOn(DemandeCourseModel, 'delete').mockResolvedValue(mockDemande);

      const result = await DemandeCourseService.supprimer(id);
      expect(DemandeCourseModel.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockDemande);
    });

    it('devrait lancer NotFoundError si la demande est introuvable', async () => {
      jest.spyOn(DemandeCourseModel, 'findById').mockResolvedValue(null);
      await expect(DemandeCourseService.supprimer(999)).rejects.toThrow(NotFoundError);
    });
  });
});
