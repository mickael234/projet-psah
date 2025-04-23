import PaiementModel from '../models/paiement.model.js';
import prisma from '../config/prisma.js';
import path from 'path';
import { generateRapportPDF } from '../services/paiementService.js';
import fs from 'fs';
import { RoleMapper } from "../utils/roleMapper.js"

class PaiementController {
  /**
   * Vérifie si l'utilisateur a les permissions nécessaires
   * @param {Object} req - Requête Express
   * @param {Array} rolesAutorises - Rôles autorisés
   * @returns {boolean} - L'utilisateur a-t-il les permissions
   */
  static verifierPermissions(req, rolesAutorises) {
    if (!req.user) return false

    // Utiliser le service RoleMapper pour vérifier les permissions
    return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
  }
  /**
   * Récupère tous les paiements d'une réservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getPaiementsByReservation(req, res) {
    try {
      // Vérifier les permissions (consultation des paiements)
      if (
        !PaiementController.verifierPermissions(req, [
          "COMPTABILITE",
          "SUPER_ADMIN",
          "ADMIN_GENERAL",
          "RESPONSABLE_HEBERGEMENT",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour consulter les paiements",
        })
      }
      const { id } = req.params

            const paiements = await prisma.paiement.findMany({
                where: { id_reservation: Number.parseInt(id) },
                orderBy: { date_transaction: 'desc' }
            });

            res.status(200).json({
                status: 'OK',
                message: 'Paiements récupérés avec succès',
                data: paiements
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des paiements',
                error: error.message
            });
        }
    }

  /**
   * Récupère un paiement par son ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getPaiementById(req, res) {
    try {
      // Vérifier les permissions (consultation des paiements)
      if (
        !PaiementController.verifierPermissions(req, [
          "COMPTABILITE",
          "SUPER_ADMIN",
          "ADMIN_GENERAL",
          "RESPONSABLE_HEBERGEMENT",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour consulter les paiements",
        })
      }

      const { id } = req.params

            const paiement = await prisma.paiement.findUnique({
                where: { id_paiement: Number.parseInt(id) }
            });

            if (!paiement) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Paiement non trouvé'
                });
            }

            res.status(200).json({
                status: 'OK',
                message: 'Paiement récupéré avec succès',
                data: paiement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération du paiement',
                error: error.message
            });
        }
    }

  /**
   * Crée un nouveau paiement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async createPaiement(req, res) {
    try {
      // Vérifier les permissions (gestion des paiements)
      if (!PaiementController.verifierPermissions(req, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"])) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour créer un paiement",
        })
      }

      const {
        id_reservation,
        montant,
        methode_paiement,
        reference_transaction,
        etat = "en_attente",
        numero_echeance,
        total_echeances,
        notes,
      } = req.body

            // Validation des données
            if (!id_reservation || !montant || !methode_paiement) {
                return res.status(400).json({
                    status: 'ERROR',
                    message:
                        'ID de réservation, montant et méthode de paiement sont requis'
                });
            }

            // Vérifier si la réservation existe
            const reservation = await prisma.reservation.findUnique({
                where: { id_reservation: Number.parseInt(id_reservation) }
            });

            if (!reservation) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Réservation non trouvée'
                });
            }

            // Créer le paiement
            const paiement = await prisma.paiement.create({
                data: {
                    id_reservation: Number.parseInt(id_reservation),
                    montant: Number.parseFloat(montant),
                    methode_paiement,
                    date_transaction: new Date(),
                    etat,
                    reference_transaction,
                    ...(numero_echeance
                        ? { numero_echeance: Number.parseInt(numero_echeance) }
                        : {}),
                    ...(total_echeances
                        ? { total_echeances: Number.parseInt(total_echeances) }
                        : {}),
                    ...(notes ? { notes } : {})
                }
            });

            // Mettre à jour l'état de paiement de la réservation
            const totalPaiements = await prisma.paiement.aggregate({
                where: {
                    id_reservation: Number.parseInt(id_reservation),
                    etat: 'complete'
                },
                _sum: {
                    montant: true
                }
            });

            const totalPaye = totalPaiements._sum.montant || 0;
            const etatPaiement =
                totalPaye >= reservation.prix_total ? 'complete' : 'en_attente';

            await prisma.reservation.update({
                where: { id_reservation: Number.parseInt(id_reservation) },
                data: { etat_paiement: etatPaiement }
            });

            res.status(201).json({
                status: 'OK',
                message: 'Paiement créé avec succès',
                data: paiement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la création du paiement',
                error: error.message
            });
        }
    }

  /**
   * Met à jour un paiement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updatePaiement(req, res) {
    try {
      // Vérifier les permissions (gestion des paiements)
      if (!PaiementController.verifierPermissions(req, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"])) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour modifier un paiement",
        })
      }

      const { id } = req.params
      const { etat, reference_transaction, notes } = req.body

            // Vérifier si le paiement existe
            const existingPaiement = await prisma.paiement.findUnique({
                where: { id_paiement: Number.parseInt(id) }
            });

            if (!existingPaiement) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Paiement non trouvé'
                });
            }

            // Mettre à jour le paiement
            const paiement = await prisma.paiement.update({
                where: { id_paiement: Number.parseInt(id) },
                data: {
                    ...(etat ? { etat } : {}),
                    ...(reference_transaction ? { reference_transaction } : {}),
                    ...(notes ? { notes } : {})
                }
            });

            // Si l'état du paiement a changé, mettre à jour l'état de paiement de la réservation
            if (etat && etat !== existingPaiement.etat) {
                const totalPaiements = await prisma.paiement.aggregate({
                    where: {
                        id_reservation: existingPaiement.id_reservation,
                        etat: 'complete'
                    },
                    _sum: {
                        montant: true
                    }
                });

                const reservation = await prisma.reservation.findUnique({
                    where: { id_reservation: existingPaiement.id_reservation }
                });

                const totalPaye = totalPaiements._sum.montant || 0;
                const etatPaiement =
                    totalPaye >= reservation.prix_total
                        ? 'complete'
                        : 'en_attente';

                await prisma.reservation.update({
                    where: { id_reservation: existingPaiement.id_reservation },
                    data: { etat_paiement: etatPaiement }
                });
            }

            res.status(200).json({
                status: 'OK',
                message: 'Paiement mis à jour avec succès',
                data: paiement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour du paiement',
                error: error.message
            });
        }
    }

  /**
   * Rembourse un paiement
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async refundPaiement(req, res) {
    try {
      // Vérifier les permissions (gestion des paiements)
      if (!PaiementController.verifierPermissions(req, ["COMPTABILITE", "SUPER_ADMIN", "ADMIN_GENERAL"])) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour rembourser un paiement",
        })
      }

      const { id } = req.params
      const { raison } = req.body

            // Vérifier si le paiement existe
            const existingPaiement = await prisma.paiement.findUnique({
                where: { id_paiement: Number.parseInt(id) }
            });

            if (!existingPaiement) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Paiement non trouvé'
                });
            }

            // Mettre à jour le paiement avec le champ notes
            const paiement = await prisma.paiement.update({
                where: { id_paiement: Number.parseInt(id) },
                data: {
                    etat: 'rembourse',
                    notes: raison || 'Remboursement sans raison spécifiée'
                }
            });

            // Mettre à jour l'état de paiement de la réservation
            const totalPaiements = await prisma.paiement.aggregate({
                where: {
                    id_reservation: existingPaiement.id_reservation,
                    etat: 'complete'
                },
                _sum: {
                    montant: true
                }
            });

            const reservation = await prisma.reservation.findUnique({
                where: { id_reservation: existingPaiement.id_reservation }
            });

            const totalPaye = totalPaiements._sum.montant || 0;
            const etatPaiement =
                totalPaye >= reservation.prix_total ? 'complete' : 'en_attente';

            await prisma.reservation.update({
                where: { id_reservation: existingPaiement.id_reservation },
                data: { etat_paiement: etatPaiement }
            });

            // Vérification si l'utilisateur existe avant d'ajouter une entrée dans le journal
            let userId = 1; // Valeur par défaut

            if (req.user && req.user.userId) {
                // Vérification si l'utilisateur existe dans la base de données
                const utilisateur = await prisma.utilisateur.findUnique({
                    where: { id_utilisateur: req.user.userId }
                });

                if (utilisateur) {
                    userId = req.user.userId;
                }
            }

            // Ajout d'une entrée dans le journal des modifications
            await prisma.journalModifications.create({
                data: {
                    id_utilisateur: userId, // Utilisez l'ID vérifié
                    type_ressource: 'paiement',
                    id_ressource: Number.parseInt(id),
                    action: 'remboursement',
                    details: {
                        raison: raison || 'Remboursement sans raison spécifiée',
                        montant: existingPaiement.montant.toString(),
                        date: new Date().toISOString()
                    }
                }
            });

            res.status(200).json({
                status: 'OK',
                message: 'Paiement remboursé avec succès',
                data: paiement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors du remboursement du paiement',
                error: error.message
            });
        }
    }

    /**
     * Génère un rapport financier selon la periode demandée
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */

    static async generateRapportFinancier(req, res){

        try {
            const {debut, fin} = req.query;

            // Vérifie que les dates sont bien passées en paramètres
            if(!debut || !fin){
                return res.status(400).json({
                    status: "MAUVAISE DEMANDE",
                    message: "Les dates pour déterminer la période sont requises."
                })
            }

            const result = await PaiementModel.getRapportFinancier(debut, fin);
            if(result.totalTransactions <= 0){
                return res.status(404).json({
                    status: "RESSOURCE NON TROUVEE",
                    message: `Aucune transaction n'a été trouvée pour la période allant du : ${debut} au ${fin}`
                })
            }

            res.status(200).json({
                status: "OK",
                data: result.data,
                totalMontant: result.totalMontant
            });
                
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR INTERNE',
                message: 'Une erreur est survenue lors de la génération du rapport financier.',
            });
        }

    }

    /**
     * Exporte le rapport financier en format PDF
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */

    static async exportRapportFinancierToPDF(req, res){
        const { debut, fin } = req.query;

        // Vérifie que les dates sont bien passées en paramètres
        if(!debut || !fin){
            return res.status(400).json({
                status: "MAUVAISE DEMANDE",
                message: "Les dates de début et de fin sont requises."
            })
        }

        try {

            const {data, totalMontant} = await PaiementModel.getRapportFinancier(debut, fin);

            if(totalMontant <= 0){
                return res.status(404).json({
                    status: "RESSOURCE NON TROUVEE",
                    message: `Aucune transaction n'a été trouvée pour la période allant du : ${debut} au ${fin}`
                })
            }

            // Génère un chemin temporaire pour le PDF
            const filePath = path.resolve(`rapport-financier-${Date.now()}.pdf`);

            // Génère le PDF avec les données spécifiées
            generateRapportPDF(data, totalMontant, filePath);

            // Pause de 500ms pour s'assurer que le fichier est bien écrit avant envoi
            setTimeout(() => {
                res.download(filePath, (err) => {
                  if (err) {
                    console.error('Erreur lors du téléchargement du fichier :', err);
                    res.status(500).json({
                        status: 'ERREUR INTERNE',
                        message: 'Une erreur est survenue lors de la génération du rapport financier au format PDF.',
                    });
                  } else {
                    fs.unlinkSync(filePath); // Supprime le fichier temporaire après téléchargement
                  }
                });
            }, 500);


        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR INTERNE',
                message: 'Une erreur est survenue lors de la génération du rapport financier au format PDF.',
            });
            
        }
    }



    /**
     * Retourne le revenu total
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */

    static async getRevenuTotal(req, res){
        try {
            const revenuTotal = await PaiementModel.getRevenuTotal();

            res.status(200).json({
                status: "OK",
                data: {
                    revenuTotal
                }
            });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERREUR INTERNE',
                message: 'Une erreur est survenue lors du calcul du revenu total.',
            });
        }
    }

}

export default PaiementController;
