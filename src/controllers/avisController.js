import AvisModel from "../models/avis.model";

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
                message: 'Une erreur interne est survenue.'
            });
        }
    }

   /**
     * Récupère un avis d'une réservation spécifique.
     * @param {Express.Request} req - La requête HTTP contenant l'id de la réservation.
     * @param {Express.Response} res - La réponse HTTP contenant les avis ou les erreurs.
     * @returns {Promise<Object>} La réponse HTTP avec un avis ou les erreurs.
     */

    static async getByReservation(req, res){
        try {

            const id = req.idReservation;

            if(isNaN(id) || !id){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la réservation est invalide"
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
            const id = req.idChambre;

            if(isNaN(id) || !id){
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la chambre est invalide"
                });
            }
    
            const avisParChambre = await AvisModel.findAllByChambre(id);
            if(avisParChambre.length === 0 || !avisParChambre){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette chambre"
                });
            }
    
            return res.status(200).json({
                status: "OK",
                data : avisParChambre
            })

        } catch (error){
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
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
                message: 'Une erreur interne est survenue.'
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
            const note = req.note;

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
                    message: "Aucun avis n'a été trouvé pour avec cette note"
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
            const nouvelAvis = req.nouvelAvis;

            if (!nouvelAvis || isNaN(nouvelAvis.note) || !nouvelAvis.commentaire || nouvelAvis.commentaire.length < 5) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'avis n'est pas valide (note ou commentaire insuffisant)."
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
            const avisExistant = await AvisModel.findById(req.params.idAvis);
            const reponsePersonnel = req.body.reponse;
            const rolePersonnel = req.user.role.name

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

            const avisAvecReponse = await AvisModel.update(req.params.idAvis, nouveauCommentaire);

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
            const id = req.idAvis;

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de l'avis est invalide"
                });
            }
    
            const avisSupprime = await AvisModel.delete(id);
    
            return res.status(200).json({
                status: "OK",
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