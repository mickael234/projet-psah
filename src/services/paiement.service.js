import PDFDocument from "pdfkit"
import fs from 'fs';
import ReservationModel from "../models/reservation.model.js"
import PaiementModel from "../models/paiement.model.js";
import prisma from "../config/prisma.js";

class PaiementService {

    /**
    * Crée un ou plusieurs paiements pour une réservation, avec gestion des échéances
    * 
    * @param {number|string} params.id_reservation - ID de la réservation associée au paiement
    * @param {number|string} params.montant - Montant total de la réservation
    * @param {string} params.methode_paiement - Méthode de paiement utilisée (ex: 'carte', 'especes', 'virement')
    * @param {string} [params.reference_transaction] - Référence externe de la transaction (optionnel)
    * @param {string} [params.etat='en_attente'] - État du paiement
    * @param {number|string} [params.numero_echeance] - Numéro de l'échéance si paiement échelonné
    * @param {number|string} [params.total_echeances] - Nombre total d'échéances prévues 
    * @param {string} [params.notes] - Notes ou commentaires sur le paiement
    * 
    * @returns {Promise<Object|Array>} Retourne le paiement créé ou un tableau des paiements échelonnés
    */

    static async createPaiementsAvecEcheances({
        id_reservation,
        montant,
        methode_paiement,
        reference_transaction,
        etat = "en_attente",
        numero_echeance,
        total_echeances,
        notes
    }) {
        // Vérification de l'ID
        if (isNaN(Number(id_reservation))) {
            throw new Error("L'ID de réservation est invalide.");
        }
    
        // Vérifier que la réservation existe
        const reservation = await ReservationModel.findById(id_reservation);
        if (!reservation) {
            throw new Error("Réservation introuvable.");
        }
    
        // Vérifier les paiements déjà existants
        const paiementsExistants = await PaiementModel.findByReservation(id_reservation);
    
        if (total_echeances && total_echeances > 1) {
            // Vérifier s'il n'y a pas déjà des paiements échelonnés pour cette réservation
            const echeancesExistantes = paiementsExistants.filter(p => p.total_echeances && p.total_echeances > 1);
            
            if (echeancesExistantes.length === 0) {
                // C'est la première saisie d'un paiement échelonné
                if (Math.abs(parseFloat(montant) - parseFloat(reservation.prix_total)) > 0.01) { // Tolérance pour les erreurs d'arrondi
                    throw new Error("Pour un premier paiement échelonné, le montant total doit être égal au prix de la réservation.");
                }
            } else if (echeancesExistantes.length >= total_echeances) {
                throw new Error("Toutes les échéances ont déjà été créées.");
            }
        } else {
            // Vérification standard pour les paiements non échelonnés
            const montantTotalPaye = paiementsExistants.reduce(
                (total, p) => total + parseFloat(p.montant), 0
            );
    
            if (montantTotalPaye + parseFloat(montant) > parseFloat(reservation.prix_total)) {
                throw new Error("Le montant dépasse le total de la réservation.");
            }
        }
    
    
        // Appel du modèle pour créer le(s) paiement(s)
        const resultats = await PaiementModel.creerPaiementAvecEcheances({
            id_reservation,
            montant,
            methode_paiement,
            reference_transaction,
            etat,
            numero_echeance,
            total_echeances,
            notes
        });
    
        return resultats;
    }
    
    /**
     * Met à jour uniquement l'état d'un paiement (méthode spécialisée pour un PATCH)
     * 
     * @param {number|string} id_paiement - ID du paiement à mettre à jour
     * @param {string} nouvelEtat - Nouvel état du paiement ('en_attente', 'complete', 'annule')
     * @returns {Promise<Object>} Retourne le paiement mis à jour
     * @throws {Error} Lance une erreur si le paiement n'existe pas, ou si les vérifications d'échéances échouent
     */
    static async updateEtatPaiement(id_paiement, nouvelEtat) {

        return await prisma.$transaction(async (transaction) => {
        // Récupérer le paiement
        const paiement = await PaiementModel.findById(transaction, id_paiement);
        if (!paiement) throw new Error("Paiement non trouvé.");
        
        // Si c'est un paiement échelonné, effectuer les vérifications spécifiques
        if (paiement.total_echeances && paiement.total_echeances > 1) {
            if (paiement.numero_echeance > 1) {
            const echeancePrecedente = await PaiementModel.findEcheancePrecedente(
                transaction,
                paiement.id_reservation,
                paiement.numero_echeance
            );

            
            if (!echeancePrecedente || echeancePrecedente.etat !== "complete") {
                throw new Error("L'échéance précédente doit être réglée d'abord.");
            }
            }
        }
        
        // Mettre à jour uniquement l'état du paiement
        const paiementMisAJour = await PaiementModel.updatePaiement(transaction, id_paiement, {
            etat: nouvelEtat,
            date_transaction: nouvelEtat === "complete" ? new Date() : paiement.date_transaction
        });
        
        // Si le paiement est marqué comme complet, vérifier s'il s'agit du dernier paiement
        if (nouvelEtat === "complete") {
            
            const paiementsRestants = await transaction.paiement.count({
            where: {
                id_reservation: paiement.id_reservation,
                etat: { not: "complete" },
                id_paiement: { not: Number(id_paiement) }
            }
            });
            
            // Si c'est le dernier paiement ou s'il n'y a plus de paiements en attente, mettre à jour l'état
            if (paiementsRestants === 0) {
            await PaiementModel.mettreAJourEtatPaiement(transaction, paiement.id_reservation);
            }
        }

        
        return paiementMisAJour;
        });
    }
      
}

/**
 * Génère un PDF contenant le rapport financier
 * @param {Array} transactions - Liste des paiements
 * @param {number} total - Total des paiements
 * @param {String} outputPath - Chemin du fichier PDF généré
 */

export function generateRapportPDF(transactions, total, outputPath){
    const doc = new PDFDocument();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR');
    
    doc.pipe(fs.createWriteStream(outputPath));

    doc.fontSize(10).text(`${formattedDate}`, {
        align: 'right'
    });

    doc.fontSize(18).text('Rapport Financier', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nombre de transactions : ${transactions.length}`);
    doc.text(`Total encaissé : ${total} €`);
    doc.moveDown();

    doc.fontSize(14).text('Détail des transactions :');
    doc.moveDown(0.5);

    transactions.forEach((transaction, index) => {
        const client = transaction.reservation?.client;
        const nomComplet = client ? `${client.prenom} ${client.nom}` : 'Client inconnu';
        doc
        .fontSize(12)
        .text(
            `${index + 1}. ${nomComplet} - ${transaction.montant} € - ${new Date(transaction.date_transaction).toLocaleDateString()}`
        );
    });

    doc.end();
}

export default PaiementService;