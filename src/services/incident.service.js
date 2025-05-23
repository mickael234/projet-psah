import IncidentModel from '../models/incident.model.js';
import {NotFoundError, ValidationError} from '../errors/apiError.js';
import TrajetModel from '../models/trajet.model.js';

class IncidentService {

    /**
     * Récupérer un incident par son ID.
     * @param {number} id - L'ID de l'incident.
     * @returns {Promise<Object>} - L'incident trouvé.
     * @throws {ValidationError} - Si l'incident n'est pas trouvé.
     */
    static async findById(id){
        const incident = await IncidentModel.findById(id);
        if(!incident){
            throw new ValidationError("Incident non trouvé")
        }

        return incident;
    }


    /**
     * Signaler un incident.
     * @param {Object} data - Les données de l'incident.
     * @param {number} data.id_utilisateur - L'ID de l'utilisateur signalant l'incident.
     * @param {string} data.type - Le type de l'incident (accident, agression, panne, autre).
     * @param {number} [data.id_trajet] - L'ID du trajet lié à l'incident (optionnel).
     * @returns {Promise<Object>} - L'incident signalé.
     * @throws {ValidationError} - Si les données sont incomplètes ou invalides.
     * @throws {NotFoundError} - Si le trajet est inexistant.
     */
    static async signalerIncident(data) {
        if (!data || !data.id_utilisateur || !data.type)
            throw new ValidationError("Données d'incident incomplètes.");

        const types = ["accident", "agression", "panne", "autre"];
        if(!types.includes(data.type)){
            throw new ValidationError("Le type d'incident doit être accident, agression, panne ou autre.")
        }

        if(data.id_trajet){
            const trajet = await TrajetModel.findById(data.id_trajet);
            if(!trajet){
                throw new NotFoundError("Trajet non trouvé.")
            }
        }

        return await IncidentModel.signaler(data);
    }

    /**
     * Récupérer tous les incidents liés à un trajet spécifique.
     * @param {number} idTrajet - L'ID du trajet.
     * @returns {Promise<Array>} - Liste des incidents liés au trajet.
     * @throws {ValidationError} - Si l'ID du trajet est invalide.
     * @throws {NotFoundError} - Si aucun incident n'est trouvé pour ce trajet.
     */
    static async getByTrajetId(idTrajet){
        if(!idTrajet || isNaN(idTrajet)) throw new ValidationError("ID du trajet invalide.");
        
        const incidents = await IncidentModel.findByTrajetId(idTrajet);
        if(!incidents || incidents.length === 0){
            throw new NotFoundError("Incidents non trouvés.")
        }

        return incidents;
    }

    /**
     * Récupérer tous les incidents.
     * @returns {Promise<Array>} - Liste de tous les incidents.
     * @throws {NotFoundError} - Si aucun incident n'est trouvé.
     */

    static async getAllIncidents() {
        const incidents = await IncidentModel.findAll();
        if (!incidents || incidents.length === 0)
            throw new NotFoundError("Aucun incident trouvé.");

        return incidents;
    }

     /**
     * Marquer un incident comme traité.
     * @param {number} id - L'ID de l'incident à traiter.
     * @returns {Promise<Object>} - L'incident mis à jour avec le statut "traité".
     * @throws {ValidationError} - Si l'ID de l'incident est invalide.
     * @throws {NotFoundError} - Si l'incident n'est pas trouvé.
     */

    static async traiterIncident(id) {
        if (!id || isNaN(id)) throw new ValidationError("ID d'incident invalide.");

        const incident = await this.findById(id);

        return await IncidentModel.marquerCommeTraite(id);
    }
}

export default IncidentService;
