// src/controllers/facturePdfController.js
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genererFacturePDF = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: {
          include: {
            utilisateur: true
          }
        },
        chambres: {
          include: { chambre: true }
        },
        paiements: true,
        services: {
          include: { service: true }
        },
        services_locaux: {
          include: { service_local: true }
        }
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    const utilisateur = reservation.client.utilisateur;

    const user = await prisma.user.findUnique({
      where: { email: utilisateur.email },
      include: { billingInfo: true }
    });

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

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', `inline; filename="facture_reservation_${id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Infos de facturation
    doc.fontSize(18).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date : ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Client : ${reservation.client.prenom} ${reservation.client.nom}`);
    doc.text(`Email : ${utilisateur.email}`);
    if (billing) {
      doc.text(`Adresse : ${billing.address}, ${billing.postalCode}, ${billing.city}, ${billing.country}`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Détails de la réservation');
    doc.fontSize(12).text(`Numéro de réservation : ${reservation.id_reservation}`);
    doc.text(`Chambre : ${chambre?.numero_chambre} - ${chambre?.type_chambre}`);
    doc.text(`Date d’arrivée : ${new Date(dateArrivee).toLocaleDateString()}`);
    doc.text(`Date de départ : ${new Date(dateDepart).toLocaleDateString()}`);
    doc.text(`Nombre de nuits : ${nbNuits}`);
    doc.text(`Prix par nuit : ${chambre?.prix_par_nuit} €`);
    doc.text(`Total chambre : ${prixChambreTotal.toFixed(2)} €`);
    doc.moveDown();

    if (reservation.services.length > 0) {
      doc.fontSize(14).text('Services additionnels');
      reservation.services.forEach(s => {
        doc.fontSize(12).text(`- ${s.service.nom} x ${s.quantite} : ${(s.service.prix * s.quantite).toFixed(2)} €`);
      });
      doc.text(`Total services : ${totalServices.toFixed(2)} €`);
      doc.moveDown();
    }

    if (reservation.services_locaux.length > 0) {
      doc.fontSize(14).text('Services locaux');
      reservation.services_locaux.forEach(s => {
        doc.fontSize(12).text(`- ${s.service_local.nom} : ${(s.service_local?.prix || 0).toFixed(2)} €`);
      });
      doc.text(`Total services locaux : ${totalServicesLocaux.toFixed(2)} €`);
      doc.moveDown();
    }

    doc.fontSize(14).text(`Montant total payé : ${montantPaye.toFixed(2)} €`);
    doc.fontSize(16).text(`Total à payer : ${totalGeneral.toFixed(2)} €`, { align: 'right' });

    doc.end();

  } catch (error) {
    console.error('Erreur génération PDF :', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture PDF' });
  }
};

// ✅ Export nommé pour éviter l’erreur dans reservationRoutes.js
export { genererFacturePDF };
