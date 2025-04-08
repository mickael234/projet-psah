import Reservation from "../models/reservationModel.js";

class ReservationController {
    static async getAllUserBookings(req, res){
        try {
            const clientId = Number(req.params.clientId);

            if(isNaN(clientId)){
                return res.status(400).json({
                    status: "BAD REQUEST",
                    message: "L'id du client n'est pas valide."
                })
            }

            const reservations = await Reservation.findAllClientReservations(clientId);
            if(!reservations){
                return res.status(404).json({
                    status: "NOT FOUND",
                    message: "Aucune réservation n'a été trouvé"})
            }

            res.status(200).json({
                status: "OK",
                data : {
                    reservations
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
}

export default ReservationController;