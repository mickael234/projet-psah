import ReservationModel from '../models/reservation.model.js';
import UtilisateurModel from '../models/utilisateur.model.js';

export const genererFacture = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = await ReservationModel.getFullReservation(id); 

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    const utilisateur = reservation.client.utilisateur;
    const user = await UtilisateurModel.findByEmail(utilisateur.email);
    const billing = user?.billingInfo;
    const chambreInfo = reservation.chambres[0];
    const chambre = chambreInfo?.chambre;
    const dateArrivee = chambreInfo?.date_arrivee;
    const dateDepart = chambreInfo?.date_depart;
    const nbNuits = (new Date(dateDepart) - new Date(dateArrivee)) / (1000 * 60 * 60 * 24);

    const prixChambreTotal = chambre?.prix_par_nuit * nbNuits;
    const totalServices = reservation.services.reduce((acc, s) => acc + s.service.prix * s.quantite, 0);
    const totalServicesLocaux = reservation.services_locaux.reduce((acc, s) => acc + (s.service_local?.prix || 0), 0);
    const totalGeneral = prixChambreTotal + totalServices + totalServicesLocaux;
    const montantPaye = reservation.paiements.reduce((acc, p) => acc + p.montant, 0);

    const facture = {
      date: new Date(),
      client: {
        nom: `${reservation.client.prenom} ${reservation.client.nom}`,
        email: utilisateur.email,
        adresse: billing ? `${billing.address}, ${billing.postalCode}, ${billing.city}, ${billing.country}` : null
      },
      reservation: {
        id: reservation.id_reservation,
        etat: reservation.etat,
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nb_nuits: nbNuits,
        chambre: {
          numero: chambre?.numero_chambre,
          type: chambre?.type_chambre,
          prix_par_nuit: chambre?.prix_par_nuit
        },
        paiement: {
          statut: reservation.etat_paiement,
          montant_total_paye: montantPaye
        }
      },
      services: reservation.services.map(s => ({
        nom: s.service.nom,
        prix: s.service.prix,
        quantite: s.quantite,
        total: s.service.prix * s.quantite
      })),
      services_locaux: reservation.services_locaux.map(s => ({
        nom: s.service_local?.nom,
        prix: s.service_local?.prix || 0
      })),
      montant_total_services: totalServices,
      montant_total_services_locaux: totalServicesLocaux,
      montant_total_general: totalGeneral
    };

    res.status(200).json(facture);

  } catch (error) {
    console.error('Erreur génération JSON :', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture JSON' });
  }
};
