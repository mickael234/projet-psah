import PaiementService from '../services/paiement.service.js';
import fs from 'fs';

class PaiementController {
  
    /**
     * Récupère tous les paiements d'une réservation
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getPaiementsByReservation(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const { id } = req.params;
            
            const paiements = await PaiementService.getPaiementsByReservation(id);
            
            res.status(200).json({
                status: 'OK',
                message: 'Paiements récupérés avec succès',
                data: paiements
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

  /**
   * Récupère un paiement par son ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getPaiementById(req, res) {
    try {
        // Vérifier les permissions
        PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
        const { id } = req.params;
        
        const paiement = await PaiementService.getById(null, id);
        
        res.status(200).json({
            status: 'OK',
            message: 'Paiement récupéré avec succès',
            data: paiement
        });
    } catch (error) {
        this.handleError(error, res);
    }
  }

    /**
     * Crée un nouveau paiement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async createPaiement(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const {
                id_reservation,
                montant,
                methode_paiement,
                reference_transaction,
                etat = "en_attente",
                numero_echeance,
                total_echeances,
                notes,
            } = req.body;
            
            const resultats = await PaiementService.createPaiementsAvecEcheances({
                id_reservation,
                montant,
                methode_paiement,
                reference_transaction,
                etat,
                numero_echeance,
                total_echeances,
                notes,
            });
            
            res.status(201).json({
                status: "OK",
                message: total_echeances && total_echeances > 1 
                    ? "Paiements échelonnés créés avec succès" 
                    : "Paiement créé avec succès",
                data: resultats
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

  /**
   * Met à jour un paiement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updatePaiement(req, res) {
    try {
        // Vérifier les permissions
        PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]);
            
        const { id } = req.params;
        const updateData = req.body;
        
        const paiement = await PaiementService.updatePaiement(id, updateData);
        
        res.status(200).json({
            status: 'OK',
            message: 'Paiement mis à jour avec succès',
            data: paiement
        });
    } catch (error) {
        this.handleError(error, res);
    }
  }

  /**
   * Rembourse un paiement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async refundPaiement(req, res) {
    try {
        // Vérifier les permissions
        PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]);
            
        const { id } = req.params;
        const { raison } = req.body;
        const userId = req.user ? req.user.userId : null;
        
        const paiement = await PaiementService.refundPaiement(id, { raison }, userId);
        
        res.status(200).json({
            status: 'OK',
            message: 'Paiement remboursé avec succès',
            data: paiement
        });
    } catch (error) {
        this.handleError(error, res);
    }
  }

    /**
     * Génère un rapport financier selon la periode demandée
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async generateRapportFinancier(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const { debut, fin } = req.query;
            
            const result = await PaiementService.getRapportFinancier(debut, fin);
            
            res.status(200).json({
                status: "OK",
                data: result.data,
                totalMontant: result.totalMontant
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Exporte le rapport financier en format PDF
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async exportRapportFinancierToPDF(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const { debut, fin } = req.query;
            
            // Génère le PDF et obtient le chemin du fichier
            const filePath = await PaiementService.exportRapportFinancierToPDF(debut, fin);
            
            // Pause de 500ms pour s'assurer que le fichier est bien écrit avant envoi
            setTimeout(() => {
                res.download(filePath, (err) => {
                    if (err) {
                        console.error('Erreur lors du téléchargement du fichier :', err);
                        res.status(500).json({
                            status: 'ERREUR INTERNE',
                            message: 'Une erreur est survenue lors du téléchargement du rapport PDF.',
                        });
                    } else {
                        fs.unlinkSync(filePath); // Supprime le fichier temporaire après téléchargement
                    }
                });
            }, 500);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Retourne le revenu total
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getRevenuTotal(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const revenuTotal = await PaiementService.getRevenuTotal();
            
            res.status(200).json({
                status: "OK",
                data: {
                    revenuTotal
                }
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Récupère les paiements en retard
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getPaiementsEnRetard(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const paiementsEnRetard = await PaiementService.getPaiementsEnRetard();
            
            res.status(200).json({
                status: "OK",
                data: {
                    paiementsEnRetard
                }
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Modifie uniquement l'état d'un paiement 
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updatePaiementStatus(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL", "RESPONSABLE_HEBERGEMENT"]);
            
            const { id } = req.params;
            const { etat } = req.body;
            
            const paiementMisAJour = await PaiementService.updateEtatPaiement(id, etat);
            
            res.status(200).json({
                status: "OK",
                message: `État du paiement mis à jour avec succès: ${etat}`,
                data: paiementMisAJour
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }
    
    /**
     * Envoie un email de notification pour les paiements en retard
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async envoyerNotificationPaiementsEnRetard(req, res) {
        try {
            // Vérifier les permissions
            PaiementService.verifierPermissions(req.user, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"]);
            
            const { email } = req.body;
            
            const envoye = await PaiementService.envoyerNotificationPaiementsEnRetard(email);
            
            if (envoye) {
                res.status(200).json({
                    status: "OK",
                    message: "Notification envoyée avec succès",
                });
            } else {
                res.status(200).json({
                    status: "OK",
                    message: "Aucun paiement en retard à notifier",
                });
            }
        } catch (error) {
            this.handleError(error, res);
        }
    }
    
    /**
     * Gère les erreurs et envoie une réponse appropriée
     * @param {Error} error - Erreur à gérer
     * @param {Object} res - Réponse Express
     */
    static handleError(error, res) {
        console.error(error);
        
        // Si c'est une erreur API personnalisée avec un statut
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                status: error.errorCode || "ERROR",
                message: error.message
            });
        }
        
        // Erreur par défaut
        return res.status(500).json({
            status: "ERREUR INTERNE",
            message: "Une erreur interne est survenue",
            error: error.message
        });
    }
}

export default PaiementController;