import FormationService from '../services/formation.service.js';
import prisma from '../config/prisma.js';

class FormationController {
    /**
     * Récupérer toutes les formations du catalogue
     * @route GET /formations
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getAll(req, res, next) {
        try {
            const formations = await FormationService.getAll(req.query);
            res.status(200).json({
                status: 'OK',
                message: 'Liste des formations récupérée avec succès.',
                data: formations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Créer une nouvelle formation
     * @route POST /formations
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async create(req, res, next) {
        try {
            const formation = await FormationService.creer(req.body);
            res.status(201).json({
                status: 'CREATED',
                message: 'Formation créée avec succès.',
                data: formation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assigner une formation à un chauffeur
     * @route POST /formations/:id/assigner/:chauffeurId
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async assigner(req, res, next) {
        try {
            const idFormation = Number(req.params.id);
            const idPersonnel = Number(req.params.chauffeurId);

            const result = await FormationService.assigner(
                idPersonnel,
                idFormation
            );

            res.status(200).json({
                status: 'OK',
                message: 'Formation assignée avec succès.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marquer une formation comme complétée
     * @route PATCH /formations/:id/completer/:chauffeurId
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async completer(req, res, next) {
        try {
            const idFormation = Number(req.params.id);
            const idPersonnel = Number(req.params.chauffeurId);

            const result = await FormationService.completer(
                idPersonnel,
                idFormation
            );

            res.status(200).json({
                status: 'OK',
                message: 'Formation marquée comme complétée.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer les formations d'un chauffeur
     * @route GET /formations/chauffeur/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getByChauffeur(req, res, next) {
        try {
            const idPersonnel = Number(req.params.id);

            const utilisateurComplet = await prisma.utilisateur.findUnique({
                where: { email: req.utilisateur.email },
                include: { personnel: true, client: true }
            });

            if (
                utilisateurComplet.role !== 'administrateur' &&
                (!utilisateurComplet.personnel ||
                    utilisateurComplet.personnel.id_personnel !== idPersonnel)
            ) {
                return res.status(403).json({
                    status: 'NON AUTORISE',
                    message: 'Accès non autorisé'
                });
            }

            const formations =
                await FormationService.getByChauffeur(idPersonnel);

            res.status(200).json({
                status: 'OK',
                message: 'Formations du chauffeur récupérées avec succès.',
                data: formations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupérer les chauffeurs assignés à une formation
     * @route GET /formations/:id/chauffeurs
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getChauffeursParFormation(req, res, next) {
        try {
            const idFormation = Number(req.params.id);
            const chauffeurs =
                await FormationService.getChauffeursParFormation(idFormation);

            res.status(200).json({
                status: 'OK',
                message:
                    'Chauffeurs récupérés avec succès pour cette formation.',
                data: chauffeurs
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mettre à jour une formation
     * @route PATCH /formations/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const formation = await FormationService.update(id, req.body);

            res.status(200).json({
                status: 'OK',
                message: 'Formation mise à jour avec succès.',
                data: formation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Désactiver une formation
     * @route PATCH /formations/:id/desactiver
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async disable(req, res, next) {
        try {
            const id = Number(req.params.id);
            const formation = await FormationService.disable(id);

            res.status(200).json({
                status: 'OK',
                message: 'Formation désactivée avec succès.',
                data: formation
            });
        } catch (error) {
            next(error);
        }
    }
}

export default FormationController;
