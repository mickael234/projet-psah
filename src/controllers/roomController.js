import Room from "../models/roomModel.js"

class RoomController {
    static async getRoomDetails(req, res){
        try {
            const id = Number(req.params.id);

            if(isNaN(id)){
                return res.status(400).json({
                    status: "BAD REQUEST",
                    message: "L'id de la chambre n'est valide."
                })
            }

            const room = await Room.findById(id);

            if(!room){
                return res.status(404).json({
                    status: "NOT FOUND",
                    message: "Aucune chambre n'a été trouvé"})
            } 

            room.pricePerNight = parseFloat(Number(room.pricePerNight).toFixed(2));

            res.status(200).json({
                status: "OK",
                data : {
                    room
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

export default RoomController;