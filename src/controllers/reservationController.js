import Reservation from "../models/reservationModel.js";

class ReservationController {
    static async getAllUserPastReservations(req, res){
        try {
            const clientId = Number(req.params.clientId);

            if(isNaN(clientId)){
                return res.status(400).json({
                    status: "BAD REQUEST",
                    message: "L'id du client n'est pas valide."
                })
            }

            const pastReservations = await Reservation.findAllPastReservations(clientId);
            if(!pastReservations){
                return res.status(404).json({
                    status: "NOT FOUND",
                    message: "Aucune réservation passée n'a été trouvé"})
            }

            res.status(200).json({
                status: "OK",
                data : {
                    pastReservations
                }
            })


        } catch (error){
            console.error("Une erreur est survenue : " + error);
            res.status(500).json({
                status: "INTERNAL SERVER ERROR",
                message: "Une erreur interne est survenue."
            })
        }
    }

    static async getAllUserPresentReservations(req, res){
        try {
            const clientId = Number(req.params.clientId);

            if(isNaN(clientId)){
                return res.status(400).json({
                    status: "BAD REQUEST",
                    message: "L'id du client n'est pas valide."
                })
            }

            const presentReservations = await Reservation.findAllPresentReservations(clientId);
            if(!presentReservations){
                return res.status(404).json({
                    status: "NOT FOUND",
                    message: "Aucune réservation actuelle n'a été trouvé"})
            }

            res.status(200).json({
                status: "OK",
                data : {
                    presentReservations
                }
            })

        } catch (error){
            console.error("Une erreur est survenue : " + error);
            res.status(500).json({
                status: "INTERNAL SERVER ERROR",
                message: "Une erreur interne est survenue."
            })
        }
    }
}

export default ReservationController;