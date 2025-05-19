import DocumentChauffeurService from '../services/documentChauffeur.service.js';
import * as AuthHelpers from '../utils/auth.helpers.js';

class DocumentChauffeurController {
    /**
     * Téléverser les documents d’un chauffeur
     * @route POST /documents
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async upload(req, res, next) {
        try {
            const personnelId = await AuthHelpers.getPersonnelIdFromUser(req.user.email);
            const documents = await DocumentChauffeurService.upload(personnelId, req.body);

            res.status(200).json({
                status: 'OK',
                message: 'Documents téléversés avec succès.',
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Valider les documents d’un chauffeur
     * @route PATCH /documents/:id/valider
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async valider(req, res, next) {
        try {
            const personnelId = Number(req.params.id);
            const { isValid } = req.body;
            const personnel = await DocumentChauffeurService.valider(personnelId, isValid);

            res.status(200).json({
                status: 'OK',
                message: `Documents ${isValid ? 'validés' : 'rejetés'} avec succès.`,
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Lister les chauffeurs avec permis expiré
     * @route GET /documents/permis-expire
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {Function} next
     */
    static async getChauffeursAvecPermisExpire(req, res, next) {
        try {
            const chauffeurs = await DocumentChauffeurService.getChauffeursAvecPermisExpire();
            res.status(200).json({
                status: 'OK',
                message: 'Liste des chauffeurs avec permis expiré.',
                data: chauffeurs
            });
        } catch (error) {
            next(error);
        }
    }
}

export default DocumentChauffeurController;
