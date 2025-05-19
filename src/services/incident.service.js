import IncidentModel from '../models/incident.model.js';
import {NotFoundError, ValidationError} from '../errors/apiError.js';

class IncidentService {
    static async signalerIncident(data) {
        if (!data || !data.id_utilisateur || !data.type)
            throw new ValidationError("Données d'incident incomplètes.");

        return await IncidentModel.signaler(data);
    }

    static async getByTrajetId(idTrajet){
        if(!idTrajet || isNaN(idTrajet)) throw new ValidationError("ID du trajet invalide.");
        
        const incident = await IncidentModel.findByTrajetId(idTrajet);
        if(!incident){
            throw new NotFoundError("Incident non trouvé.")
        }

        return incident;
    }

    static async getAllIncidents() {
        const incidents = await IncidentModel.findAll();
        if (!incidents || incidents.length === 0)
            throw new NotFoundError("Aucun incident trouvé.");

        return incidents;
    }

    static async traiterIncident(id) {
        if (!id || isNaN(id)) throw new ValidationError("ID d'incident invalide.");

        return await IncidentModel.marquerCommeTraite(id);
    }
}

export default IncidentService;
