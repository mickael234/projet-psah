// Importation du client Prisma pour interagir avec la base de données
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fonction pour générer la facture d'une réservation
export const genererFacture = async (req, res) => {
  const id = parseInt(req.params.id); // Récupère l'ID de réservation depuis l'URL

  try {
    // Recherche de la réservation avec ses relations (client, paiements, services, etc.)
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: {
          include: {
            utilisateur: true // Pour récupérer nom/email du client
          }
        },
        paiements: true, // Inclure les paiements associés
        services: {
          include: { service: true } // Inclure détails de chaque service
        },
        services_locaux: {
          include: { service_local: true } // Inclure services locaux (ex: pressing, transport)
        }
      }
    });

    // Si la réservation n'existe pas, on retourne une erreur 404
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }

    // Récupération des infos utilisateur liées au client
    const client = reservation.client.utilisateur;

    // Calcul du total des services hôteliers (ex: ménage, petit-déj)
    const totalServices = reservation.services.reduce(
      (total, s) => total + (s.service.prix * s.quantite),
      0
    );

    // Calcul du total des services locaux (prix optionnel)
    const totalServicesLocaux = reservation.services_locaux.reduce(
      (total, s) => total + (s.service_local?.prix || 0),
      0
    );

    // Calcul des paiements déjà effectués
    const totalPaiements = reservation.paiements.reduce(
      (total, p) => total + p.montant,
      0
    );

    // Construction de la facture au format JSON
    const facture = {
      facture_id: `FAC-${reservation.id_reservation}`,
      date: reservation.date_reservation,
      client: {
        nom: client.nom_utilisateur,
        email: client.email
      },
      reservation: {
        id: reservation.id_reservation,
        etat: reservation.etat,
        prix_total: reservation.prix_total,
        paiement: {
          statut: reservation.etat_paiement,
          montant_total_paye: totalPaiements
        }
      },
      services: reservation.services.map(s => ({
        nom: s.service.nom,
        prix_unitaire: s.service.prix,
        quantite: s.quantite,
        total: s.service.prix * s.quantite
      })),
      services_locaux: reservation.services_locaux.map(s => ({
        nom: s.service_local?.nom || 'Inconnu',
        prix: s.service_local?.prix || 0
      })),
      montant_total_services: totalServices,
      montant_total_services_locaux: totalServicesLocaux,
      montant_total_general: (reservation.prix_total || 0) + totalServices + totalServicesLocaux
    };

    // Envoie de la facture au client en réponse
    res.status(200).json(facture);
  } catch (error) {
    // Gestion des erreurs serveur
    console.error("Erreur génération facture :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture", error: error.message });
  }
};
