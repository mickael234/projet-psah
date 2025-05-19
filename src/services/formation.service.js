import FormationModel from '../models/formation.model.js';
import { NotFoundError, ValidationError } from '../errors/apiError.js';

class FormationService {


    /**
     * Récupérer toutes les formations du catalogue (filtrées ou non)
     * @param {Object} filters - Filtres optionnels (ex: { obligatoire: true })
     * @returns {Promise<Array>} - Liste des formations
     * @throws {NotFoundError}
     */
    static async getAll(filters = {}) {
        const formations = await FormationModel.findAll(filters);

        if (!formations || formations.length === 0) {
            throw new NotFoundError("Aucune formation trouvée.");
        }

        return formations;
    }


     /**
     * Assigner une formation à un chauffeur
     * @param {number} idPersonnel
     * @param {number} idFormation
     * @returns {Promise<Object>}
     * @throws {ValidationError}
     */
    static async assigner(idPersonnel, idFormation) {
        if (!idPersonnel || isNaN(idPersonnel))
            throw new ValidationError("ID du chauffeur invalide.");

        if (!idFormation || isNaN(idFormation))
            throw new ValidationError("ID de la formation invalide.");

        const formation = FormationModel.findById(idFormation);

        if(!formation){
            throw new NotFoundError("Formation non trouvée.")
        }

        return await FormationModel.assignerFormation(idPersonnel, idFormation);
    }



    /**
     * Récupérer les formations d'un chauffeur
     * @param {number} idPersonnel
     * @returns {Promise<Array>} - Liste des formations avec complétion
     * @throws {NotFoundError}
     */
    static async getByChauffeur(idPersonnel) {
        if (!idPersonnel || isNaN(idPersonnel))
            throw new ValidationError("ID du chauffeur invalide.");

        const formations = await FormationModel.findByChauffeur(idPersonnel);

        if (!formations || formations.length === 0) {
            throw new NotFoundError("Aucune formation assignée à ce chauffeur.");
        }

        return formations;
    }


    /**
     * Lister les chauffeurs affectés à une formation
     * @param {number} idFormation
     * @returns {Promise<Array>} - Liste des chauffeurs
     * @throws {NotFoundError}
     */
    static async getChauffeursParFormation(idFormation) {
        if (!idFormation || isNaN(idFormation)) {
            throw new ValidationError("ID de la formation invalide.");
        }

        const formation = FormationModel.findById(idFormation);

        if(!formation){
            throw new NotFoundError("Formation non trouvée.")
        }

        const chauffeurs = await FormationModel.getChauffeursParFormation(idFormation);
        if (!chauffeurs || chauffeurs.length === 0) {
            throw new NotFoundError("Aucun chauffeur affecté à cette formation.");
        }

        return chauffeurs;
    }


    /**
     * Marquer une formation comme complétée
     * @param {number} idPersonnel
     * @param {number} idFormation
     * @returns {Promise<Object>}
     */
    static async completer(idPersonnel, idFormation) {
        if (!idPersonnel || isNaN(idPersonnel))
            throw new ValidationError("ID du chauffeur invalide.");

        if (!idFormation || isNaN(idFormation))
            throw new ValidationError("ID de la formation invalide.");

        const formation = FormationModel.findById(idFormation);

        if(!formation){
            throw new NotFoundError("Formation non trouvée.")
        }

        return await FormationModel.marquerCommeComplete(idPersonnel, idFormation);
    }



    /**
     * Créer une formation dans le catalogue
     * @param {Object} data - Données de la formation
     * @returns {Promise<Object>} - Formation créée
     */
    static async creer(data) {
        if (!data || !data.titre) {
            throw new ValidationError("Titre de la formation requis.");
        }
        return await FormationModel.create(data);
    }

    /**
     * Met à jour une formation existante
     * @param {number} id - ID de la formation
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<Object>} - Formation mise à jour
     */
    static async update(id, data) {
        if (!id || isNaN(id)) {
            throw new ValidationError("ID de la formation invalide.");
        }

        const formation = FormationModel.findById(id);

        if(!formation){
            throw new NotFoundError("Formation non trouvée.")
        }

        return await FormationModel.update(id, data);
    }

    /**
     * Désactive une formation du catalogue
     * @param {number} id - ID de la formation
     * @returns {Promise<Object>} - Formation désactivée
     */
    static async disable(id) {
        if (!id || isNaN(id)) {
            throw new ValidationError("ID de la formation invalide.");
        }

        const formation = FormationModel.findById(id);

        if(!formation){
            throw new NotFoundError("Formation non trouvée.")
        }

        return await FormationModel.disable(id);
    }
}

export default FormationService;
