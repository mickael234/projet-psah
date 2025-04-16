// src/controllers/reservationController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// PUT /api/reservations/:id/checkin
export const enregistrerArrivee = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await prisma.reservation.update({
      where: { id_reservation: parseInt(id) },
      data: { etat: 'enregistree' }
    });
    res.status(200).json({ message: "Arrivée enregistrée", reservation });
  } catch (error) {
    console.error('Erreur checkin:', error);
    res.status(500).json({ message: "Erreur lors de l’enregistrement de l’arrivée", error: error.message });
  }
};

// PUT /api/reservations/:id/checkout
export const enregistrerDepart = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await prisma.reservation.update({
      where: { id_reservation: parseInt(id) },
      data: { etat: 'depart' }
    });
    res.status(200).json({ message: "Départ enregistré", reservation });
  } catch (error) {
    console.error('Erreur checkout:', error);
    res.status(500).json({ message: "Erreur lors de l’enregistrement du départ", error: error.message });
  }
};
