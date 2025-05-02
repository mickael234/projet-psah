import prisma from "../config/prisma.js";

class PaiementModel {

    /**
     * Récupère un paiement par son ID
     * 
     * @param {Object} transaction - Transaction Prisma ou instance Prisma
     * @param {number|string} id_paiement - ID du paiement à récupérer
     * @returns {Promise<Object|null>} Le paiement trouvé ou null s'il n'existe pas
     */
    static async findById(transaction, id_paiement) {
        // Si transaction est null, utiliser prisma directement
        const db = transaction || prisma;
        
        return await db.paiement.findUnique({
            where: { 
                id_paiement: Number(id_paiement)
            }
        })
    }

    /**
     * Récupère les paiements d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<Array>} - Liste des paiements
     */
    static findByReservation(idReservation) {
        return prisma.paiement.findMany({
            where: { id_reservation: idReservation }
        });
    }

    /**
     * Calcule le total des paiements d'une réservation
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<number>} - Total des paiements
     */
    static getTotalPaiements(idReservation) {
        return prisma.paiement
            .aggregate({
                where: {
                    id_reservation: idReservation,
                    etat: 'complete'
                },
                _sum: {
                    montant: true
                }
            })
            .then((result) => result._sum.montant || 0);
    }

    /**
     * Vérifie si une réservation est entièrement payée
     * @param {number} idReservation - ID de la réservation
     * @returns {Promise<boolean>} - True si la réservation est payée
     */
    static async isReservationPaid(idReservation) {
        const reservation = await prisma.reservation.findUnique({
            where: { id_reservation: idReservation }
        });

        const totalPaye = await this.getTotalPaiements(idReservation);

        return totalPaye >= reservation.prix_total;
    }

    /**
     * Génère un rapport financier en fonction d'une période
     * @param {String} dateMin - Date minimale
     * @param {String} dateMax - Date maximale
     * @returns {Promise<Object>} - Transactions effectuées lors de la période choisie
     */


    static async getRapportFinancier(dateMin, dateMax) {

        const minDate = dateMin ? new Date(dateMin) : new Date('2000-01-01');
        const maxDate = dateMax ? new Date(dateMax) : new Date();
        
    
        if (isNaN(minDate.getTime()) || isNaN(maxDate.getTime())) {
            throw new Error('Les dates fournies ne sont pas valides');
        }

        // Récupérer les transactions
        const transactions = await prisma.paiement.findMany({
            where: {
              etat: "complete",
              date_transaction: {
                lte: new Date(maxDate),
                gte: new Date(minDate)
              }
            }, 
            include: {
                reservation: {
                    include: {
                        client: {
                            select: {
                                prenom: true,
                                nom: true 
                            }
                        }
                    }
                }
            },
            orderBy: [
                { montant: "asc" }
            ]

        })

        // Calcul du total des montants des transactions
        const { _sum } = await prisma.paiement.aggregate({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: maxDate,
                    gte: minDate
                }
            },
            _sum: {
                montant: true
            }
        });

        // Calcul du nombre total de transactions 
        const totalTransactions = await prisma.paiement.count({
            where: {
                etat: "complete",
                date_transaction: {
                    lte: maxDate,
                    gte: minDate
                }
            }
        });
      
        return {
            data: transactions,
            totalTransactions: totalTransactions,
            totalMontant: _sum.montant || 0
        };
    }

    /**
     * Calcule le revenu total 
     * @returns {Promise<number>} - Revenu total
     */

    static async getRevenuTotal(){
        const revenuTotal = await prisma.paiement
        .aggregate({ 
            _sum: { montant: true }, 
            where: { etat: "complete" } 
        })

        return revenuTotal._sum.montant;
    }

    /**
     * Recupère les paiements en retard
     * @returns {Promise<Object>} - Paiements en retard
     */

    static async findPaiementsEnRetard(){
        return await prisma.paiement.findMany({
            where : {
                etat: {
                   in : ["en_attente", "echoue"]
                },
                date_echeance : {
                    lt: new Date()
                }
            },
            include : {
                reservation : {
                    select : {
                        idReservation: true,
                        include : {
                            client : {
                                select : {
                                    prenom: true,
                                    nom: true
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * Crée un ou plusieurs paiements avec gestion des échéances.
     * @returns {Promise<Object>} - Objet contenant le(s) paiement(s) créé(s)
     */
    static async creerPaiementAvecEcheances({ id_reservation, montant, methode_paiement, reference_transaction, etat, numero_echeance, total_echeances, notes }) {
    
        return await prisma.$transaction(async (transaction) => {
  
            // Récupération de la réservation liée
            const reservation = await transaction.reservation.findUnique({
                where: { id_reservation: Number(id_reservation) }
            });
        
            if (!reservation) {
                throw new Error("Réservation non trouvée");
            }
        
            // Paiement en plusieurs échéances
            if (total_echeances && total_echeances > 1) {
                const montantParEcheance = Number(montant) / total_echeances;
                const paiementsEcheances = [];
        
                for (let i = 0; i < total_echeances; i++) {
                const dateEcheance = new Date();
                dateEcheance.setMonth(dateEcheance.getMonth() + i);
        
                paiementsEcheances.push({
                    id_reservation: Number(id_reservation),
                    montant: montantParEcheance,
                    methode_paiement,
                    date_transaction: new Date(),
                    date_echeance: dateEcheance,
                    numero_echeance: i + 1,
                    total_echeances,
                    etat: i === 0 ? "complete" : "en_attente",
                    reference_transaction,
                    notes
                });
                }
        
                await transaction.paiement.createMany({ data: paiementsEcheances });
        
                // Mise à jour de l’état de paiement de la réservation
                await PaiementModel.mettreAJourEtatPaiement(transaction, id_reservation);
        
                return { type: "multiple", paiements: paiementsEcheances };
            }
        
            // Paiement simple (non échelonné)
            const paiement = await transaction.paiement.create({
                data: {
                id_reservation: Number(id_reservation),
                montant: Number(montant),
                methode_paiement,
                date_transaction: new Date(),
                date_echeance: new Date(),
                numero_echeance: numero_echeance ? Number(numero_echeance) : null,
                total_echeances: total_echeances || 1,
                etat,
                reference_transaction,
                notes
                }
            });
        
            await PaiementModel.mettreAJourEtatPaiement(transaction, id_reservation);
        
            return { type: "single", paiement };
        });
    }
  
  
    /**
     * Met à jour l’état de paiement d’une réservation.
     */
    static async mettreAJourEtatPaiement(transaction, id_reservation) {
        //console.log("Transaction:", JSON.stringify(transaction, null, 2));
        try {
            const totalPaiements = await transaction.paiement.aggregate({
                where: {
                    id_reservation: Number(id_reservation),
                    etat: "complete"
                },
                _sum: {
                    montant: true
                }
            });
            console.log("Total paiements:", totalPaiements);
    
            const reservation = await transaction.reservation.findUnique({
                where: { id_reservation: Number(id_reservation) }
            });
            console.log("Reservation:", reservation);
    
            const totalPaye = totalPaiements._sum.montant || 0;
            const nouvelEtat = totalPaye >= reservation.prix_total ? "complete" : "en_attente";
            console.log("nouvelEtat:", nouvelEtat);
    
            console.log("Avant update");
            await transaction.reservation.update({
                where: { id_reservation: Number(id_reservation) },
                data: { etat_paiement: nouvelEtat }
            });
            console.log("Après update");
        } catch (err) {
            console.error("Erreur dans mettreAJourEtatPaiement:", err);
            throw err;
        }
    }
  
  
    /**
     * Met à jour un paiement unique dans un échéancier
     */
    static async mettreAJourPaiementEcheance(transaction, id_paiement, dataUpdate) {
        const paiement = await transaction.paiement.findUnique({
        where: { id_paiement }
        });
    
        if (!paiement) {
        throw new Error("Paiement non trouvé.");
        }
    
        // Vérification que ce paiement appartient à un échéancier
        if (!paiement.total_echeances || paiement.total_echeances <= 1) {
        throw new Error("Ce paiement n'est pas dans un échéancier.");
        }
    
        // Vérification que l’échéance précédente est complète
        if (paiement.numero_echeance > 1) {
        const echeancePrecedente = await transaction.paiement.findFirst({
            where: {
            id_reservation: paiement.id_reservation,
            numero_echeance: paiement.numero_echeance - 1
            }
        });
    
        if (!echeancePrecedente || echeancePrecedente.etat !== "complete") {
            throw new Error("L'échéance précédente doit être réglée d'abord.");
        }
        }
    
        // Vérification du montant (pas supérieur à celui prévu)
        if (dataUpdate.montant && Number(dataUpdate.montant) > paiement.montant) {
        throw new Error("Le montant ne peut pas dépasser le montant prévu.");
        }
    
        // Mise à jour du paiement
        const paiementMisAJour = await transaction.paiement.update({
        where: { id_paiement },
        data: {
            ...dataUpdate,
            date_transaction: new Date() // Met à jour la date de paiement
        }
        });
    
        // Mise à jour de l’état global si ce paiement est maintenant "complete"
        if (dataUpdate.etat === "complete") {
        await PaiementModel.mettreAJourEtatPaiement(transaction, paiement.id_reservation);
        }
    
        return paiementMisAJour;
    }

    static async findEcheancePrecedente(transaction, id_reservation, numero_echeance) {
        return await transaction.paiement.findFirst({
          where: {
            id_reservation,
            numero_echeance: numero_echeance - 1
          }
        });
    }
      
      // Mettre à jour un paiement
    static async updatePaiement(transaction, id_paiement, data) {
        return await transaction.paiement.update({
          where: { id_paiement },
          data
        });
    }
  
      
      
}

export default PaiementModel;
