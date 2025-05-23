import DocumentChauffeurService from '../services/documentChauffeur.service.js';
import * as AuthHelpers from '../utils/auth.helpers.js';

class DocumentChauffeurController {
    /**
     * Téléverser ou mettre à jour les documents d’un chauffeur connecté
     * @route POST /documents
     * @param {import('express').Request} req - Requête contenant les documents
     * @param {import('express').Response} res - Réponse HTTP
     * @param {Function} next - Middleware pour la gestion des erreurs
     */
    static async upload(req, res, next) {
        try {
            const personnelId = await AuthHelpers.getPersonnelIdFromUser(
                req.utilisateur.email
            );
            const documents = await DocumentChauffeurService.upload(
                personnelId,
                req.body
            );

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
     * Valider ou rejeter les documents d’un chauffeur
     * @route PATCH /documents/:id/valider
     * @param {import('express').Request} req - Contient l'ID chauffeur et le statut
     * @param {import('express').Response} res - Réponse HTTP
     * @param {Function} next - Middleware d'erreur
     */
    static async valider(req, res, next) {
        try {
            const personnelId = Number(req.params.id);
            const { isValid } = req.body;
            const personnel = await DocumentChauffeurService.valider(
                personnelId,
                isValid
            );

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
     * Récupérer les chauffeurs ayant un permis expiré
     * @route GET /documents/permis-expire
     * @param {import('express').Request} req - Requête HTTP
     * @param {import('express').Response} res - Réponse HTTP
     * @param {Function} next - Middleware pour gestion d’erreur
     */
    static async getChauffeursAvecPermisExpire(req, res, next) {
        try {
            const chauffeurs =
                await DocumentChauffeurService.getChauffeursAvecPermisExpire();

            res.status(200).json({
                status: 'OK',
                message: 'Chauffeurs avec permis expiré récupérés.',
                data: chauffeurs
            });
        } catch (error) {
            next(error);
        }
    }
}

export default DocumentChauffeurController;
