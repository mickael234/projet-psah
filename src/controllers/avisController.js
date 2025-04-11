import AvisModel from "../models/avis.model";

class AvisController{
    static async getAllAvis(req, res){
        try {

            const avis = await AvisModel.findAll();

            if(avis.length === 0){
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucun avis n'a été trouvé"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avis
            })
        } catch {error}{
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    static async getAllByReservation(req, res){
        try {

            const id = req.idReservation;

            if(isNaN(id) || !id){
                return res.status(404).json({
                    status: 'BAD REQUEST',
                    message: "L'id de la réservation est invalid"
                });
            }

            const avis = await AvisModel.findAllByReservation(id);

            if(avis.length === 0){
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucun avis n'a été trouvé pour cette réservation"
                });
            }

            return res.status(200).json({
                status: "OK",
                data : avis
            })

        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }

        
    }
}