import AvisModel from "../models/avis.model";

class AvisController{
    static async getAllAvis(req, res){
        try {

            const avis = await AvisModel.findAll();

            if(avis.length === 0){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avis
            })
        } catch {error}{
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    static async getByReservation(req, res){
        try {

            const id = req.idReservation;

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la réservation est invalide"
                });
            }

            const avis = await AvisModel.findByReservation(id);

            if(avis.length === 0 || !avis){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette réservation"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avis
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }

        
    }

    static async getAvisByChambre (req, res){
        try {
            const id = req.idChambre;

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de la chambre est invalide"
                });
            }
    
            const avis = await AvisModel.findAllByChambre(id);
            if(avis.length === 0 || !avis){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour cette chambre"
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

    static async getByNote(req, res){
        try {
            const note = req.note;

            if(note > 5 || note < 1 || isNaN(note)){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
                });
            }

            const avis = AvisModel.findByRating(note);
            if(avis.length === 0 || !avis){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé pour avec cette note"
                });
            }


            return res.status(200).json({
                status: "OK",
                data : avis
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    static async createAvis(req, res){
        try {
            const nouvelAvis = req.nouvelAvis;

            if(isNaN(avis) || avis.length < 5){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'avis n'est pas valide"
                });
            }

            const avis = AvisModel.create(nouvelAvis);
            return res.status(200).json({
                status: "OK",
                data : avis
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    static async answerToAvis(req, res){
        try {
            const avis = await AvisModel.findById(req.idAvis);
            const reponse = req.reponse;
            const role = user.role.name

            if(!avis){
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé"
                });
            }

            if(!reponse){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "La réponse est invalide."
                });
            }

            const dejaRepondu = avis.commentaire?.includes('Réponse du personnel');
            if (dejaRepondu) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: "Aucun avis n'a été trouvé"
                })
            };

            const nouveauCommentaire = `${avis.commentaire ?? ''}\n\n---\nRéponse du personnel : ${reponse}\n(Répondu par ${role})`;

            const avisAvecReponse = await AvisModel.updatedAvis(req.idAvis, nouveauCommentaire);

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

    static async deleteAvis (req, res){
        try {
            const id = req.idAvis;

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "L'id de l'avis est invalide"
                });
            }
    
            const avis = await AvisModel.delete(id);
    
            return res.status(200).json({
                status: "OK",
                data : "Avis supprimé avec succès"
            })
            
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            return res.status(500).json({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }
}