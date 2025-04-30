import ReservationsServicesModel from '../models/reservationServices.model.js';
import ReservationModel from '../models/reservation.model.js'; // ← utilise le modèle existant

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

      //  Vérifie que la réservation existe
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
}

export default ReservationsServicesController;
