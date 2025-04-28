
// src/controllers/reservationController.js
import ReservationModel from '../models/reservation.model.js';

//  Check-in (changer l’état en "enregistree")
export const enregistrerArrivee = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const existing = await ReservationModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservation = await ReservationModel.updateEtat(id, 'enregistree');

    res.status(200).json({ message: "Check-in effectué avec succès.", reservation });
  } catch (error) {
    console.error("Erreur check-in :", error);
    res.status(500).json({ message: "Erreur lors du check-in", error: error.message });
  }
};

//  Check-out (changer l’état en "depart")
export const enregistrerDepart = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const existing = await ReservationModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const reservation = await ReservationModel.updateEtat(id, 'depart');

    res.status(200).json({ message: "Check-out effectué avec succès.", reservation });
  } catch (error) {
    console.error("Erreur check-out :", error);
    res.status(500).json({ message: "Erreur lors du check-out", error: error.message });
  }
};
