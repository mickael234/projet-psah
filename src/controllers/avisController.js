import AvisModel from "../models/avis.model.js";
import ReservationModel from "../models/reservation.model.js";

class AvisController{

    /**
     * Récupère tous les avis disponibles.
     * @param {Express.Request} req - La requête HTTP.
     * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
     * @returns {Promise<Object>} La réponse HTTP avec les avis ou les erreurs.
     */

    static async getAllAvis(req, res){
        try {

            const avis = await AvisModel.findAll();

            if(!avis || avis.length === 0){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avis
            })

        } catch (error){
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue lors de la récupération des avis.'
            });
        }
    }

   /**
     * Récupère un avis laissé sur une réservation spécifique.
     * @param {Express.Request} req - La requête HTTP contenant l'id de la réservation.
     * @param {Express.Response} res - La réponse HTTP contenant les avis ou les erreurs.
     * @returns {Promise<Object>} La réponse HTTP avec un avis ou les erreurs.
     */

    static async getByReservation(req, res){
        try {

            const id = Number(req.params.idReservation);

            if(isNaN(id) || !id || id <= 0){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la réservation est invalide"
                });
            }
            
            const reservationExistante = await ReservationModel.getWithRelations(id); 
            if(!reservationExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucune réservation n'a été trouvé"
                });
            }
            const avisReservation = await AvisModel.findByReservation(id);

            if(!avisReservation){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette réservation"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avisReservation
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }

        
    }

   /**
 * Récupère les avis d'une chambre spécifique.
 * @param {Express.Request} req - La requête HTTP contenant l'id de la chambre.
 * @param {Express.Response} res - La réponse HTTP contenant les avis ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec les avis ou les erreurs.
 */

    static async getAvisByChambre (req, res){
        try {
            const id = Number(req.params.idChambre);

            if(isNaN(id) || !id || id <= 0){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la chambre est invalide"
                });
            }
    
            const avisChambre = await AvisModel.findAllByChambre(id);
            if(avisChambre.length === 0 || !avisChambre){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette chambre"
                });
            }
    
            return res.status(200).json({
                status: "OK",
                data : avisChambre
            })

        } catch (error){
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue lors de la récupération des avis de cette chambre.'
            });
        }
       

    }

    /**
 * Récupère la note moyenne des avis.
 * @param {Express.Request} req - La requête HTTP.
 * @param {Express.Response} res - La réponse HTTP contenant la note moyenne ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec la note moyenne ou les erreurs.
 */
    static async getNoteMoyenneAvis(req, res){
        try {
            const moyenne = await AvisModel.getAverageRating();

            return res.status(200).json({
                status: "OK",
                data : moyenne
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue lors de la récupération de la moyenne des avis existants.'
            });
        }
        
    }

    /**
 * Récupère les avis ayant une note spécifique.
 * @param {Express.Request} req - La requête HTTP contenant la note.
 * @param {Express.Response} res - La réponse HTTP contenant les avis ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec les avis ou les erreurs.
 */
    static async getByNote(req, res){
        try {
            const note = Number(req.params.note);

            if(note > 5 || note < 1 || isNaN(note) || !note){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
                });
            }

            const avisParNote = await AvisModel.findByRating(note);
            if(avisParNote.length === 0 || !avisParNote){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette note"
                });
            }


            return res.status(200).json({
                status: "OK",
                data : avisParNote
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue lors de la récupération des avis par note.'
            });
        }
    }

    /**
 * Crée un nouvel avis pour une réservation.
 * @param {Express.Request} req - La requête HTTP contenant le nouvel avis.
 * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec les données ou les erreurs.
 */
    static async createAvis(req, res){
        try {
            const nouvelAvis = req.body;

            if (!nouvelAvis || isNaN(nouvelAvis.note) || nouvelAvis.note < 0 || nouvelAvis.note > 5 || !nouvelAvis.commentaire || nouvelAvis.commentaire.length < 5) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'avis n'est pas valide (note ou commentaire insuffisant)."
                });
            }
            
            if(!nouvelAvis.id_reservation || isNaN(nouvelAvis.id_reservation) || nouvelAvis.id_reservation <= 0){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la réservation n'est pas valide."
                })
            }
            
            const reservationExistante = await ReservationModel.getWithRelations(nouvelAvis.id_reservation);

            if(!reservationExistante){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "La réservation spécifiée n'existe pas."
                });
            }

            // Extraction des dates de départ de toutes les chambres réservées
            const datesDepart = reservationExistante.chambres.map(chambre => new Date(chambre.date_depart));
            
            // Détermination de la date de départ la plus tardive parmi toutes les chambres
            const dateDepartMax = new Date(Math.max(...datesDepart.map(date => date.getTime())));
            
            const maintenant = new Date();
            

            if (maintenant < dateDepartMax) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "Vous ne pouvez laisser un avis qu'après la date de départ de votre séjour."
                });
            }

            const avisExistant = await AvisModel.findByReservation(nouvelAvis.id_reservation);
            if(avisExistant){
                return res.status(409).json({
                    status: 'CONFLIT',
                    message: "Vous ne pouvez pas laisser plusieurs avis sur cette réservation."
                });
            }

            const avisCree = await AvisModel.create(nouvelAvis);
            return res.status(201).json({
                status: "OK",
                data : avisCree
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: "Une erreur interne est survenue lors de la création d'avis."
            });
        }
    }

    /**
 * Répond à un avis existant.
 * @param {Express.Request} req - La requête HTTP contenant l'id de l'avis et la réponse du personnel.
 * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec les données ou les erreurs.
 */
    static async answerToAvis(req, res){
        try {
            const idAvis = Number(req.params.idAvis)
            const avisExistant = await AvisModel.findById(idAvis);
            const reponsePersonnel = req.body.reponse;
            const rolePersonnel = req.user.role

            if(!avisExistant){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Impossible de répondre à cet avis, aucun avis n'a été trouvé."
                });
            }

            if(!reponsePersonnel || reponsePersonnel.length < 5){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "La réponse est invalide (trop courte ou absente)."
                });
            }

            // Le commentaire du client est gardé mais le commentaire du personnel est ajouté ou remplacé
            const nouveauCommentaire = `${avisExistant.commentaire?.split('\n\n---\nRéponse du personnel')[0] ?? avisExistant.commentaire ?? ''}\n\n---\nRéponse du personnel : ${reponsePersonnel}\n(Répondu par ${rolePersonnel})`;

            const avisAvecReponse = await AvisModel.update(idAvis, nouveauCommentaire);

            return res.status(200).json({
                status: "OK",
                data : avisAvecReponse
            })

            
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }


/**
 * Supprime un avis existant.
 * @param {Express.Request} req - La requête HTTP contenant l'id de l'avis à supprimer.
 * @param {Express.Response} res - La réponse HTTP contenant les données ou les erreurs.
 * @returns {Promise<Object>} La réponse HTTP avec les données ou les erreurs.
 */

    static async deleteAvis (req, res){
        try {
            const id = Number(req.params.idAvis);

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de l'avis est invalide"
                });
            }

            const avisExistant = await AvisModel.findById(id);
            if(!avisExistant){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Impossible de supprimer cet avis, aucun avis n'a été trouvé."
                });
            }
    
            const avisSupprime = await AvisModel.delete(id);
    
            return res.status(200).json({
                status: "SUPPRIME",
                data : avisSupprime
            })
            
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue lors de la suppression de cet avis.'
            });
        }
    }
}

export default AvisController;