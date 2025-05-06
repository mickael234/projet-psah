import PDFDocument from "pdfkit"
import fs from 'fs';
import ReservationModel from "../models/reservation.model.js"
import PaiementModel from "../models/paiement.model.js";
import prisma from "../config/prisma.js";
import nodemailer from 'nodemailer';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { NotFoundError, ValidationError, PermissionError, InternalServerError } from "../errors/apiError.js";
import { RoleMapper } from "../utils/roleMapper.js";

class PaiementService {

    /**
     * Vérifie si l'utilisateur a les permissions nécessaires
     * @param {Object} user - Utilisateur connecté
     * @param {Array} rolesAutorises - Liste des rôles autorisés
     */
    static verifierPermissions(user, rolesAutorises) {
        if (!user) {
            throw new PermissionError("Authentification requise");
        }
        
        if (!RoleMapper.hasAuthorizedRole(user, rolesAutorises)) {
            throw new PermissionError("Vous n'avez pas les permissions nécessaires pour cette action");
        }
        
        return true;
    }


    /**
     * Récupère un paiement par son ID
     * @param {Object} transaction - Transaction Prisma ou instance Prisma
     * @param {number|string} id_paiement - ID du paiement à récupérer
     * @returns {Promise<Object>} - Le paiement trouvé
     */
    static async getById(transaction, id_paiement) {
        if (!id_paiement || isNaN(parseInt(id_paiement))) {
            throw new ValidationError("L'identifiant du paiement est invalide");
        }

        const paiement = await PaiementModel.findById(transaction, id_paiement);
        
        if (!paiement) {
            throw new NotFoundError("Paiement non trouvé");
        }
        
        return paiement;
    }


    /**
     * Récupère les paiements d'une réservation
     * @param {number|string} id_reservation - ID de la réservation
     * @returns {Promise<Array>} - Liste des paiements
     */
    static async getPaiementsByReservation(id_reservation) {
        if (!id_reservation || isNaN(parseInt(id_reservation))) {
            throw new ValidationError("L'identifiant de réservation est invalide");
        }
        
        // Vérifier que la réservation existe
        const reservation = await ReservationModel.findById(id_reservation);
        if (!reservation) {
            throw new NotFoundError("Réservation introuvable");
        }
      
        const paiements = await PaiementModel.findByReservation(Number(id_reservation));
        if(!paiements || paiements.length <= 0){
            throw new NotFoundError("Aucun paiement n'a été trouvé sur cette réservation.")
        }
        
        return paiements;
    }

    
    /**
     * Calcule le total des paiements d'une réservation
     * @param {number|string} id_reservation - ID de la réservation
     * @returns {Promise<number>} - Total des paiements
     */
     static async getTotalPaiements(id_reservation) {
        if (!id_reservation || isNaN(parseInt(id_reservation))) {
            throw new ValidationError("L'identifiant de réservation est invalide");
        }
        
        // Vérifier que la réservation existe
        const reservation = await ReservationModel.findById(id_reservation);
        if (!reservation) {
            throw new NotFoundError("Réservation introuvable");
        }
        
        return PaiementModel.getTotalPaiements(Number(id_reservation));
    }


    /**
     * Vérifie si une réservation est entièrement payée
     * @param {number|string} id_reservation - ID de la réservation
     * @returns {Promise<boolean>} - True si la réservation est payée
     */
    static async isReservationPaid(id_reservation) {
        if (!id_reservation || isNaN(parseInt(id_reservation))) {
            throw new ValidationError("L'identifiant de réservation est invalide");
        }
        
        // Vérifier que la réservation existe
        const reservation = await ReservationModel.findById(id_reservation);
        if (!reservation) {
            throw new NotFoundError("Réservation introuvable");
        }
        
        return PaiementModel.isReservationPaid(Number(id_reservation));
    }

    /**
     * Génère un rapport financier en fonction d'une période
     * @param {String} dateMin - Date minimale (format YYYY-MM-DD)
     * @param {String} dateMax - Date maximale (format YYYY-MM-DD)
     * @returns {Promise<Object>} - Transactions effectuées lors de la période choisie
     */
    static async getRapportFinancier(dateMin, dateMax) {
        // Valider le format des dates
        if (dateMin && !/^\d{4}-\d{2}-\d{2}$/.test(dateMin)) {
            throw new ValidationError("Le format de la date minimale est invalide (YYYY-MM-DD attendu)");
        }
        
        if (dateMax && !/^\d{4}-\d{2}-\d{2}$/.test(dateMax)) {
            throw new ValidationError("Le format de la date maximale est invalide (YYYY-MM-DD attendu)");
        }
        
        // Vérifier que dateMin est antérieure à dateMax
        if (dateMin && dateMax && new Date(dateMin) > new Date(dateMax)) {
            throw new ValidationError("La date minimale doit être antérieure à la date maximale");
        }
        
        const result = await PaiementModel.getRapportFinancier(dateMin, dateMax);
        
        if (result.totalTransactions <= 0) {
            throw new NotFoundError(`Aucune transaction n'a été trouvée pour la période allant du : ${dateMin} au ${dateMax}`);
        }
        
        return result;
    }

    /**
     * Exporte le rapport financier en format PDF
     * @param {String} dateMin - Date minimale (format YYYY-MM-DD)
     * @param {String} dateMax - Date maximale (format YYYY-MM-DD)
     * @returns {Promise<String>} - Chemin du fichier PDF généré
     * @throws {ValidationError} - Si les dates sont invalides
     * @throws {NotFoundError} - Si aucune transaction n'est trouvée
     * @throws {InternalServerError} - Si une erreur survient lors de la génération du PDF
     */
    static async exportRapportFinancierToPDF(dateMin, dateMax) {
        // Validation déjà présente dans getRapportFinancier
        const { data, totalMontant } = await this.getRapportFinancier(dateMin, dateMax);
        
        try {
            // Génère un chemin temporaire pour le PDF
            const filePath = path.resolve(`rapport-financier-${Date.now()}.pdf`);
            
            // Génère le PDF avec les données spécifiées
            generateRapportPDF(data, totalMontant, filePath);
            
            return filePath;
        } catch (error) {
            throw new InternalServerError("Une erreur est survenue lors de la génération du rapport financier au format PDF");
        }
    }

    /**
     * Calcule le revenu total 
     * @returns {Promise<number>} - Revenu total
     */
    static async getRevenuTotal() {
        return await PaiementModel.getRevenuTotal();
    }

    /**
     * Recupère les paiements en retard
     * @returns {Promise<Array>} - Paiements en retard
     * @throws {NotFoundError} - Si aucun paiement en retard n'est trouvé
     */
    static async getPaiementsEnRetard() {
        const paiements = await PaiementModel.findPaiementsEnRetard();
        
        if (!paiements || paiements.length === 0) {
            throw new NotFoundError("Aucun paiement en retard trouvé");
        }
        
        return paiements;
    }

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
     * @throws {ValidationError} - Si les données sont invalides
     * @throws {NotFoundError} - Si la réservation n'existe pas
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
        if (!id_reservation || isNaN(Number(id_reservation))) {
            throw new ValidationError("L'ID de réservation est invalide.");
        }
        
        // Vérifier que la réservation existe
        const reservation = await ReservationModel.findById(id_reservation);
        if (!reservation) {
            throw new NotFoundError("Réservation introuvable.");
        }
        
        // Validation du montant
        if (!montant || isNaN(Number(montant)) || Number(montant) <= 0) {
            throw new ValidationError("Le montant doit être un nombre positif.");
        }
        
        // Validation de la méthode de paiement
        if (!methode_paiement) {
            throw new ValidationError("La méthode de paiement est requise.");
        }
        
        // Vérifier les paiements déjà existants
        const paiementsExistants = await PaiementModel.findByReservation(id_reservation);
    
        if (total_echeances && total_echeances > 1) {
            // Vérifier s'il n'y a pas déjà des paiements échelonnés pour cette réservation
            const echeancesExistantes = paiementsExistants.filter(paiement => paiement.total_echeances && paiement.total_echeances > 1);
            
            if (echeancesExistantes.length === 0) {
                // C'est la première saisie d'un paiement échelonné
                if (Math.abs(parseFloat(montant) - parseFloat(reservation.prix_total)) > 0.01) { // Tolérance pour les erreurs d'arrondi
                    throw new ValidationError("Pour un premier paiement échelonné, le montant total doit être égal au prix de la réservation.");
                }
            } else if (echeancesExistantes.length >= total_echeances) {
                throw new ValidationError("Toutes les échéances ont déjà été créées.");
            }
        } else {
            // Vérification standard pour les paiements non échelonnés
            const montantTotalPaye = paiementsExistants.reduce(
                (total, paiement) => total + parseFloat(paiement.montant), 0
            );
    
            if (montantTotalPaye + parseFloat(montant) > parseFloat(reservation.prix_total)) {
                throw new ValidationError("Le montant dépasse le total de la réservation.");
            }
        }
    
        try {
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
        } catch (error) {
            throw new InternalServerError(`Erreur lors de la création du paiement: ${error.message}`);
        }
    }
    
    /**
     * Met à jour uniquement l'état d'un paiement
     * 
     * @param {number|string} id_paiement - ID du paiement à mettre à jour
     * @param {string} nouvelEtat - Nouvel état du paiement ('en_attente', 'complete', 'annule')
     * @returns {Promise<Object>} Retourne le paiement mis à jour
     * @throws {ValidationError} - Si les données sont invalides
     * @throws {NotFoundError} - Si le paiement n'existe pas
     */
    static async updateEtatPaiement(id_paiement, nouvelEtat) {
        // Validation de l'ID
        if (!id_paiement || isNaN(Number(id_paiement))) {
            throw new ValidationError("L'identifiant du paiement est invalide");
        }
        
        // Validation de l'état
        if (!nouvelEtat || !['en_attente', 'complete', 'annule', 'rembourse'].includes(nouvelEtat)) {
            throw new ValidationError("État de paiement invalide. Valeurs acceptées: 'en_attente', 'complete', 'annule', 'rembourse'");
        }

        try {
            return await prisma.$transaction(async (transaction) => {
                // Récupérer le paiement
                const paiement = await PaiementModel.findById(transaction, id_paiement);
                if (!paiement) {
                    throw new NotFoundError("Paiement non trouvé");
                }
                
                // Si c'est un paiement échelonné, effectuer les vérifications spécifiques
                if (paiement.total_echeances && paiement.total_echeances > 1) {
                    if (paiement.numero_echeance > 1) {
                        const echeancePrecedente = await PaiementModel.findEcheancePrecedente(
                            transaction,
                            paiement.id_reservation,
                            paiement.numero_echeance
                        );
                        
                        if (!echeancePrecedente || echeancePrecedente.etat !== "complete") {
                            throw new ValidationError("L'échéance précédente doit être réglée d'abord");
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
        } catch (error) {
            // Propager les erreurs du type ApiError
            if (error.statusCode) {
                throw error;
            }
            
            throw new InternalServerError(`Erreur lors de la mise à jour de l'état du paiement: ${error.message}`);
        }
    }

    /**
     * Met à jour un paiement complet
     * @param {number|string} id_paiement - ID du paiement
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<Object>} - Paiement mis à jour
     * @throws {ValidationError} - Si les données sont invalides
     * @throws {NotFoundError} - Si le paiement n'existe pas
     */
    static async updatePaiement(id_paiement, data) {
        // Validation de l'ID
        if (!id_paiement || isNaN(Number(id_paiement))) {
            throw new ValidationError("L'identifiant du paiement est invalide");
        }
        
        try {
            // Vérifier si le paiement existe
            const existingPaiement = await prisma.paiement.findUnique({
                where: { id_paiement: Number(id_paiement) }
            });
            
            if (!existingPaiement) {
                throw new NotFoundError("Paiement non trouvé");
            }
            
            // Mettre à jour le paiement
            const paiement = await prisma.paiement.update({
                where: { id_paiement: Number(id_paiement) },
                data
            });
            
            // Si l'état du paiement a changé, mettre à jour l'état de paiement de la réservation
            if (data.etat && data.etat !== existingPaiement.etat) {
                await this.mettreAJourEtatPaiementReservation(existingPaiement.id_reservation);
            }
            
            return paiement;
        } catch (error) {
            // Propager les erreurs du type ApiError
            if (error.statusCode) {
                throw error;
            }
            
            throw new InternalServerError(`Erreur lors de la mise à jour du paiement: ${error.message}`);
        }
    }
    
    /**
     * Met à jour l'état de paiement d'une réservation
     * @param {number} id_reservation - ID de la réservation
     * @returns {Promise<void>}
     */
    static async mettreAJourEtatPaiementReservation(id_reservation) {
        try {
            const totalPaiements = await prisma.paiement.aggregate({
                where: {
                    id_reservation: Number(id_reservation),
                    etat: 'complete'
                },
                _sum: {
                    montant: true
                }
            });
            
            const reservation = await prisma.reservation.findUnique({
                where: { id_reservation: Number(id_reservation) }
            });
            
            const totalPaye = totalPaiements._sum.montant || 0;
            const etatPaiement = totalPaye >= reservation.prix_total ? 'complete' : 'en_attente';
            
            await prisma.reservation.update({
                where: { id_reservation: Number(id_reservation) },
                data: { etat_paiement: etatPaiement }
            });
        } catch (error) {
            throw new InternalServerError(`Erreur lors de la mise à jour de l'état de paiement de la réservation: ${error.message}`);
        }
    }

    /**
     * Rembourse un paiement
     * @param {number|string} id_paiement - ID du paiement
     * @param {Object} data - Données pour le remboursement (raison, etc.)
     * @param {number|string} userId - ID de l'utilisateur effectuant le remboursement
     * @returns {Promise<Object>} - Paiement remboursé
     * @throws {ValidationError} - Si les données sont invalides
     * @throws {NotFoundError} - Si le paiement n'existe pas
     */
    static async refundPaiement(id_paiement, { raison }, userId) {
        // Validation de l'ID
        if (!id_paiement || isNaN(Number(id_paiement))) {
            throw new ValidationError("L'identifiant du paiement est invalide");
        }
        
        try {
            // Vérifier si le paiement existe
            const existingPaiement = await prisma.paiement.findUnique({
                where: { id_paiement: Number(id_paiement) }
            });
            
            if (!existingPaiement) {
                throw new NotFoundError("Paiement non trouvé");
            }
            
            // Mettre à jour le paiement
            const paiement = await prisma.paiement.update({
                where: { id_paiement: Number(id_paiement) },
                data: {
                    etat: 'rembourse',
                    notes: raison || 'Remboursement sans raison spécifiée'
                }
            });
            
            // Mettre à jour l'état de paiement de la réservation
            await this.mettreAJourEtatPaiementReservation(existingPaiement.id_reservation);
            
            // Vérification si l'utilisateur existe avant d'ajouter une entrée dans le journal
            let validUserId = 1; // Valeur par défaut
            
            if (userId) {
                // Vérification si l'utilisateur existe dans la base de données
                const utilisateur = await prisma.utilisateur.findUnique({
                    where: { id_utilisateur: Number(userId) }
                });
                
                if (utilisateur) {
                    validUserId = Number(userId);
                }
            }
            
            // Ajout d'une entrée dans le journal des modifications
            await prisma.journalModifications.create({
                data: {
                    id_utilisateur: validUserId,
                    type_ressource: 'paiement',
                    id_ressource: Number(id_paiement),
                    action: 'remboursement',
                    details: {
                        raison: raison || 'Remboursement sans raison spécifiée',
                        montant: existingPaiement.montant.toString(),
                        date: new Date().toISOString()
                    }
                }
            });
            
            return paiement;
        } catch (error) {
            // Propager les erreurs du type ApiError
            if (error.statusCode) {
                throw error;
            }
            
            throw new InternalServerError(`Erreur lors du remboursement du paiement: ${error.message}`);
        }
    }

    /**
     * Envoie un email de notification pour les paiements en retard
     * @param {String} destinataire - Adresse email du destinataire
     * @returns {Promise<boolean>} - True si l'email a été envoyé
     * @throws {ValidationError} - Si l'adresse email est invalide
     */
    static async envoyerNotificationPaiementsEnRetard(destinataire) {
        // Validation de l'adresse email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!destinataire || !emailRegex.test(destinataire)) {
            throw new ValidationError("L'adresse email du destinataire est invalide");
        }
        
        try {
            // Récupérer les paiements en retard
            const paiementsEnRetard = await this.getPaiementsEnRetard();
            
            if (paiementsEnRetard.length <= 0) {
                return false; // Pas de paiements en retard, pas d'email à envoyer
            }
            
            // Générer le contenu de l'email
            const contenuHTML = genererContenuEmail(paiementsEnRetard);
            
            // Envoyer l'email
            sendEmail(
                destinataire, 
                `Notification : ${paiementsEnRetard.length} paiements en retard`, 
                contenuHTML
            );
            
            return true;
        } catch (error) {
            // Si c'est une erreur NotFoundError (aucun paiement en retard), on renvoie false
            if (error instanceof NotFoundError) {
                return false;
            }
            
            // Propager les autres erreurs du type ApiError
            if (error.statusCode) {
                throw error;
            }
            
            throw new InternalServerError(`Erreur lors de l'envoi de la notification: ${error.message}`);
        }
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

/**
 * Génère le contenu HTML de l'email à partir d'un template et des paiements en retard.
 *
 * @param {Array<Object>} paiements - Liste des paiements en retard.
 * @returns {string} - Contenu HTML prêt à être inséré dans l'email.
 */
export function genererContenuEmail(paiements) {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const templatePath = path.join(__dirname, '../utils', 'paiements-retard-template.html');
    let template = fs.readFileSync(templatePath, 'utf-8');
  
    const lignes = paiements.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${p.reservation.client.nom}</td>
        <td>${p.montant} €</td>
        <td>${p.date_echeance}</td>
        <td>${calculerRetard(p.date_echeance)} jours</td>
      </tr>
    `).join('');
  
    template = template.replace('{{rows}}', lignes);
  
    return template;
}
  
/**
 * Calcule le nombre de jours de retard entre la date d'échéance et aujourd'hui.
 *
 * @param {string} dateEcheanceStr - Date d'échéance (au format ISO ou YYYY-MM-DD).
 * @returns {number} - Nombre de jours de retard (0 si la date est future ou aujourd'hui).
 */
export function calculerRetard(dateEcheanceStr) {
    const aujourdHui = new Date();
    const dateEcheance = new Date(dateEcheanceStr);
    const diffMs = aujourdHui - dateEcheance;
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffJours > 0 ? diffJours : 0;
}

// Transporteur SMTP configuré pour l'envoi des emails
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
  
/**
 * Envoie un email via le service SMTP configuré.
 *
 * @param {string} to - Adresse email du destinataire.
 * @param {string} subject - Sujet de l'email.
 * @param {string} html - Contenu HTML du corps du mail.
 * @returns {void}
 */
export function sendEmail(to, subject, html) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi :', error);
        } else {
            console.log('Email envoyé :', info.response);
        }
    });
}

export default PaiementService;