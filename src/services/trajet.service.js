import TrajetModel from '../models/trajet.model.js';
import DemandeCourseModel from '../models/demandeCourse.model.js';
import {
    ValidationError,
    NotFoundError,
    ConflictError,
    PermissionError
} from '../errors/apiError.js';

class TrajetService {
    /**
     * Récupère un trajet par ID
     */
    static async getById(id, idPersonnelConnecte) {
        if (!id || isNaN(id)) throw new ValidationError("L'ID du trajet est invalide.");

        const trajet = await TrajetModel.findById(id);
        if (!trajet) throw new NotFoundError('Trajet introuvable.');

        if (trajet.id_personnel !== idPersonnelConnecte) {
            throw new PermissionError("Accès refusé à ce trajet.");
        }

        return trajet;
    }

    /**
     * Récupère les trajets du chauffeur connecté
     */
    static async getByChauffeur(idChauffeur, filters = {}) {
        if (!idChauffeur || isNaN(idChauffeur))
            throw new ValidationError("L'ID du chauffeur est invalide.");

        const trajets = await TrajetModel.findAllByChauffeur(idChauffeur, filters);
        if (!trajets || trajets.length <= 0) {
            throw new NotFoundError('Aucun trajet trouvé.');
        }

        return trajets;
    }

    /**
     * Récupère les trajets d'un chauffeur regroupés par jour
     */
    static async getPlanningParJour(idChauffeur, dateMin, dateMax) {
        if (!idChauffeur || isNaN(idChauffeur))
            throw new ValidationError("L'ID du chauffeur est invalide.");

        const trajets = await TrajetModel.getPlanningParJour(idChauffeur, dateMin, dateMax);
        
        if (!trajets || trajets.length <= 0) {
            throw new NotFoundError('Aucun trajet trouvé.');
        }

        return trajets;
    }

    /**
     * Crée un trajet lié à une demande
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async creerTrajet(idPersonnel, data) {
        const {
            id_demande_course,
            date_prise_en_charge,
            date_depose
        } = data;
    
        if (
            !idPersonnel ||
            isNaN(idPersonnel) ||
            !id_demande_course ||
            isNaN(id_demande_course) ||
            !date_prise_en_charge ||
            !date_depose
        ) {
            throw new ValidationError(
                'Champs requis : id_demande_course, date_prise_en_charge, date_depose.'
            );
        }
    
        const demande = await DemandeCourseModel.findById(id_demande_course);
        if (!demande) {
            throw new NotFoundError('Demande de course introuvable.');
        }

        const existingTrajet = await TrajetModel.findByDemandeId(id_demande_course);
        if (existingTrajet) {
            throw new ConflictError("Un trajet a déjà été créé pour cette demande.");
        }

    
        if (demande.statut !== 'acceptee') {
            throw new ConflictError(
                'Un trajet ne peut être créé que pour une demande acceptée.'
            );
        }
    
        return await TrajetModel.create({
            id_personnel: idPersonnel,
            id_demande_course,
            date_prise_en_charge: new Date(date_prise_en_charge),
            date_depose: new Date(date_depose),
            statut: 'en_attente'
        });
    }

    /**
     * Met à jour les horaires d’un trajet (reprogrammation par client)
     */
    static async modifierHoraires(id, idClient, priseEnCharge, depose) {
        const trajet = await TrajetModel.findById(id);
        if (!trajet) throw new NotFoundError('Trajet introuvable.');

        if (trajet.demandeCourse?.id_client !== idClient) {
            throw new PermissionError("Vous ne pouvez modifier que vos propres trajets.");
        }

        if (trajet.statut !== 'en_attente') {
            throw new ConflictError("Seuls les trajets en attente peuvent être reprogrammés.");
        }

        if (!priseEnCharge || !depose) {
            throw new ValidationError('Les deux horaires sont requis.');
        }

        return await TrajetModel.updateHoraires(id, priseEnCharge, depose);
    }

    /**
     * Met à jour le statut du trajet
     * @param {number} id
     * @param {string} nouveauStatut
     */
    static async changerStatut(id, nouveauStatut, idPersonnelConnecte) {
        const trajet = await TrajetModel.findById(id);
        if (!trajet) throw new NotFoundError('Trajet introuvable.');

        if (trajet.id_personnel !== idPersonnelConnecte) {
            throw new PermissionError("Vous ne pouvez modifier que vos propres trajets.");
        }

        const statutsValides = ['en_attente', 'en_cours', 'termine'];
        if (!statutsValides.includes(nouveauStatut)) {
            throw new ValidationError('Statut de trajet invalide.');
        }

        return await TrajetModel.updateStatut(id, nouveauStatut);
    }
}

export default TrajetService;
