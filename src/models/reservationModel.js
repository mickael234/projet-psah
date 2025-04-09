import prisma from "../config/prisma.js";

class Reservation {
    static async findAllPresentReservations(clientId){
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                etat: { in: ['EN_ATTENTE', 'CONFIRMEE', 'ENREGISTREE'] },
            },
        })
    }

    static async findAllPastReservations(clientId){
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                etat: { in: ['DEPART', 'ANNULEE'] },
            },
        })
    }
}

export default Reservation;