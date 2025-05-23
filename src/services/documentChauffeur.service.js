import DocumentChauffeurModel from '../models/documentChauffer.model.js';
import { ValidationError, NotFoundError } from '../errors/apiError.js';
import PersonnelModel from '../models/personnel.model.js';

class DocumentChauffeurService {
    /**
     * Téléverse ou met à jour les documents d’un chauffeur
     * @param {number} personnelId
     * @param {Object} data - URLs des documents et date d'expiration
     * @returns {Promise<Object>}
     */
    static async upload(personnelId, data) {
        if (!personnelId || isNaN(personnelId))
            throw new ValidationError("ID du chauffeur invalide.");

        const { permis_url, piece_identite_url, date_expiration_permis } = data;

        if (!permis_url || !piece_identite_url || !date_expiration_permis) {
            throw new ValidationError("Tous les documents doivent être fournis.");
        }

        return await DocumentChauffeurModel.uploadDocuments(personnelId, data);
    }

    /**
     * Valider ou rejeter les documents d’un chauffeur
     * @param {number} personnelId
     * @param {boolean} isValid
     * @returns {Promise<Object>}
     */
    static async valider(personnelId, isValid) {
        if (!personnelId || isNaN(personnelId))
            throw new ValidationError("ID du chauffeur invalide.");

        const personnel = await PersonnelModel.getWithRelations(personnelId);
        if(!personnel){
            throw new NotFoundError("Membre du personnel non trouvé")
        }

        if (typeof isValid !== 'boolean')
            throw new ValidationError("Statut de validation invalide.");

        return await DocumentChauffeurModel.validerDocuments(personnelId, isValid);
    }

    /**
     * Lister les chauffeurs ayant un permis expiré
     * @returns {Promise<Array>} - Liste des chauffeurs expirés
     * @throws {NotFoundError}
     */
    static async getChauffeursAvecPermisExpire() {
        const result = await DocumentChauffeurModel.findChauffeursAvecPermisExpire();

        if (!result || result.length === 0) {
            throw new NotFoundError("Aucun chauffeur avec permis expiré trouvé.");
        }

        return result;
    }
}

export default DocumentChauffeurService;
