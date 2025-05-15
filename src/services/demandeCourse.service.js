import DemandeCourseModel from '../models/demandeCourse.model.js';
import { ValidationError, NotFoundError } from '../errors/apiError.js';

class DemandeCourseService {

    /**
     * Récupère une demande par son ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async getById(id) {
        if (!id || isNaN(id))
            throw new ValidationError(
                "L'identifiant de la demande n'est pas valide."
            );

        const demande = await DemandeCourseModel.findById(id);
        if (!demande) throw new NotFoundError('Demande introuvable.');

        return demande;
    }

    /**
     * Liste des demandes d’un client
     * @param {number} clientId
     * @param {Object} filters
     */
    static async getByClient(clientId, filters = {}) {
        if (!clientId) throw new ValidationError('ID du client requis.');
        const demandes = await DemandeCourseModel.findAllByClient(
            clientId,
            filters
        );
        if (!demandes || demandes.length <= 0) {
            throw new NotFoundError(
                "Aucune demande n'a été trouvé concernant ce client."
            );
        }
        return demandes;
    }

    /**
     * Liste des demandes en attente (chauffeur)
     */
    static async getEnAttente(filters = {}) {
        const demandes = await DemandeCourseModel.findPending(filters);
        if (!demandes || demandes.length <= 0) {
            throw new NotFoundError(
                "Aucune demande en attente n'a été trouvé."
            );
        }
        return demandes;
    }

    /**
     * Crée une nouvelle demande de course
     * @param {Object} data - Données de la demande
     * @returns {Promise<Object>}
     */
    static async creerDemande(data) {
        const { id_client, lieu_depart, lieu_arrivee } = data;

        if (!id_client || isNaN(id_client) || !lieu_depart || !lieu_arrivee) {
            throw new ValidationError(
                'Les champs valides id_client, lieu_depart et lieu_arrivee sont requis.'
            );
        }

        if(lieu_depart === lieu_arrivee){
            throw new ValidationError('Le lieu de depart et d\'arrivée doivent être différents')
        }

        return await DemandeCourseModel.create({
            ...data,
            statut: 'en_attente',
            date_demande: new Date()
        });
    }

    
    /**
     * Met à jour une demande (lieu ou horaire) si statut = en_attente
     */
    static async modifierDemande(id, updateData) {
        const demande = await DemandeCourseModel.findById(id);
        if (!demande) throw new NotFoundError('Demande non trouvée.');

        if (demande.statut !== 'en_attente') {
            throw new ValidationError(
                'Seules les demandes en attente peuvent être modifiées.'
            );
        }

        return await DemandeCourseModel.update(id, updateData);
    }

    /**
     * Change le statut (accepter, refuser, annuler)
     * @param {number} id
     * @param {string} nouveauStatut
     */
    static async changerStatut(id, nouveauStatut) {
        const demande = await DemandeCourseModel.findById(id);
        if (!demande) throw new NotFoundError('Demande non trouvée.');

        const statutsValid = ['acceptee', 'refusee', 'annulee'];
        if (!statutsValid.includes(nouveauStatut)) {
            throw new ValidationError('Statut invalide.');
        }

        if (demande.statut !== 'en_attente') {
            throw new ValidationError(
                'Seules les demandes en attente peuvent changer de statut.'
            );
        }

        return await DemandeCourseModel.updateStatut(id, nouveauStatut);
    }

    /**
     * Supprime une demande
     */
    static async supprimer(id) {
        const demande = await DemandeCourseModel.findById(id);
        if (!demande) throw new NotFoundError();

        return await DemandeCourseModel.delete(id);
    }
}

export default DemandeCourseService;
