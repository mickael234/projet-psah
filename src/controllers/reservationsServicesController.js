import ReservationsServicesModel from '../models/reservationServices.model.js';
import ReservationModel from '../models/reservation.model.js';

class ReservationsServicesController {
  static async ajouter(req, res) {
    try {
      const id_reservation = Number(req.params.id);
      const { id_service, quantite } = req.body;

      if (
        isNaN(id_reservation) ||
        isNaN(id_service) ||
        id_reservation <= 0 ||
        id_service <= 0
      ) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: 'id_reservation ou id_service invalide'
        });
      }

      const reservation = await ReservationModel.getById(id_reservation);
      if (!reservation) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: 'Réservation inexistante'
        });
      }

      const ajout = await ReservationsServicesModel.ajouterService({
        id_reservation,
        id_service,
        quantite: quantite || 1
      });

      return res.status(201).json({
        status: 'OK',
        message: 'Service ajouté à la réservation',
        data: ajout
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur lors de l'ajout du service à la réservation"
      });
    }
  }

  static async modifier(req, res) {
    try {
      const id_reservation = Number(req.params.id);
      const id_service = Number(req.params.id_service);
      const { quantite } = req.body;

      if (
        isNaN(id_reservation) ||
        isNaN(id_service) ||
        id_reservation <= 0 ||
        id_service <= 0 ||
        !quantite || quantite <= 0
      ) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: 'Paramètres invalides'
        });
      }

      const modification = await ReservationsServicesModel.modifierService({
        id_reservation,
        id_service,
        quantite
      });

      return res.status(200).json({
        status: 'OK',
        message: 'Service modifié',
        data: modification
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur lors de la modification du service"
      });
    }
  }

  static async supprimer(req, res) {
    try {
      const id_reservation = Number(req.params.id);
      const id_service = Number(req.params.id_service);

      if (
        isNaN(id_reservation) ||
        isNaN(id_service) ||
        id_reservation <= 0 ||
        id_service <= 0
      ) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: 'Paramètres invalides'
        });
      }

      await ReservationsServicesModel.supprimerService({
        id_reservation,
        id_service
      });

      return res.status(200).json({
        status: 'OK',
        message: 'Service supprimé de la réservation'
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur lors de la suppression du service"
      });
    }
  }
}

export default ReservationsServicesController;
