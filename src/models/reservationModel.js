import prisma from "../config/prisma.js";

class Reservation {
    static async findAllClientReservations(clientId){
        return prisma.reservation.findMany({
            where : {
                id_client: clientId
            }
        })
    }

    static async findAllPresentReservations(clientId){
        const today = new Date();
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                etat: { in: ['EN_ATTENTE', 'CONFIRMEE', 'ENREGISTREE'] },
            },
        })
    }

    static async findAllPastReservations(clientId){
        const today = new Date();
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                OR: [
                  { etat: { in: ['DEPART', 'ANNULEE'] } },
                  {
                    AND: [
                      { etat: { in: ['CONFIRMEE', 'ENREGISTREE'] } },
                    ]
                  }
                ]
            },
        })
    }
}

export default Reservation;