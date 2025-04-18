import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Créer une nouvelle réservation
export const creerReservation = async (req, res) => {
  const { id_client, prix_total, etat, etat_paiement } = req.body;

  try {
    const nouvelleReservation = await prisma.reservation.create({
      data: {
        id_client,
        prix_total,
        etat,
        etat_paiement,
      },
    });

    res.status(201).json({ message: "Réservation créée avec succès.", reservation: nouvelleReservation });
  } catch (error) {
    console.error("Erreur création réservation :", error);
    res.status(500).json({ message: "Erreur lors de la création de la réservation", error: error.message });
  }
};

// Arrivée (Check-in)
export const enregistrerArrivee = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const existing = await prisma.reservation.findUnique({
      where: { id_reservation: id }
    });

    if (!existing) {
      return res.status(404).json({ message: "Aucune réservation trouvée avec cet identifiant." });
    }

    const reservation = await prisma.reservation.update({
      where: { id_reservation: id },
      data: { etat: 'enregistree' }
    });

    res.status(200).json({ message: 'Check-in effectué avec succès.', reservation });
  } catch (error) {
    console.error("Erreur checkin:", error);
    res.status(500).json({ message: "Erreur lors du check-in", error: error.message });
  }
};

// Départ (Check-out)
export const enregistrerDepart = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const existing = await prisma.reservation.findUnique({
      where: { id_reservation: id }
    });

    if (!existing) {
      return res.status(404).json({ message: "Aucune réservation trouvée avec cet identifiant." });
    }

    const reservation = await prisma.reservation.update({
      where: { id_reservation: id },
      data: { etat: 'depart' }
    });

    res.status(200).json({ message: 'Check-out effectué avec succès.', reservation });
  } catch (error) {
    console.error("Erreur checkout:", error);
    res.status(500).json({ message: "Erreur lors du check-out", error: error.message });
  }
};
