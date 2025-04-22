import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ReservationModel {
  static getWithRelations(id) {
    return prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: true,
        chambres: {
          include: {
            chambre: true
          }
        },
        services: {
          include: {
            service: true
          }
        },
        paiements: true,
        avis: true
      }
    });
  }

  static checkAvailability(dateArrivee, dateDepart, capacite = null) {
    return prisma.$transaction(async (tx) => {
      const reservedRooms = await tx.reservationsChambre.findMany({
        where: {
          OR: [
            {
              AND: [
                { date_arrivee: { lte: dateArrivee } },
                { date_depart: { gt: dateArrivee } }
              ]
            },
            {
              AND: [
                { date_arrivee: { lt: dateDepart } },
                { date_depart: { gte: dateDepart } }
              ]
            },
            {
              AND: [
                { date_arrivee: { gte: dateArrivee } },
                { date_depart: { lte: dateDepart } }
              ]
            }
          ],
          reservation: {
            etat: {
              notIn: ['annulee']
            }
          }
        },
        select: {
          id_chambre: true
        }
      });

      const reservedRoomIds = reservedRooms.map(room => room.id_chambre);

      return tx.chambre.findMany({
        where: {
          id_chambre: { notIn: reservedRoomIds },
          etat: 'disponible',
          ...(capacite ? { capacite: { gte: capacite } } : {})
        },
        include: {
          medias: true
        }
      });
    });
  }

  static findByPeriod(debut, fin) {
    return prisma.reservation.findMany({
      where: {
        chambres: {
          some: {
            OR: [
              {
                AND: [
                  { date_arrivee: { lte: debut } },
                  { date_depart: { gt: debut } }
                ]
              },
              {
                AND: [
                  { date_arrivee: { lt: fin } },
                  { date_depart: { gte: fin } }
                ]
              },
              {
                AND: [
                  { date_arrivee: { gte: debut } },
                  { date_depart: { lte: fin } }
                ]
              }
            ]
          }
        },
        supprime_le: null
      },
      include: {
        client: true,
        chambres: {
          include: {
            chambre: true
          }
        }
      }
    });
  }

  static findById(id) {
    return prisma.reservation.findUnique({
      where: { id_reservation: id }
    });
  }

  static updateEtat(id, nouvelEtat) {
    return prisma.reservation.update({
      where: { id_reservation: id },
      data: { etat: nouvelEtat }
    });
  }

  static getFullReservation(id) {
    return prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: {
          include: {
            utilisateur: true
          }
        },
        chambres: {
          include: {
            chambre: true
          }
        },
        services: {
          include: {
            service: true
          }
        },
        services_locaux: {
          include: {
            service_local: true
          }
        },
        paiements: true
      }
    });
  }
  static async getFullReservation(id) {
    return prisma.reservation.findUnique({
      where: { id_reservation: id },
      include: {
        client: {
          include: {
            utilisateur: true
          }
        },
        chambres: {
          include: { chambre: true }
        },
        paiements: true,
        services: {
          include: { service: true }
        },
        services_locaux: {
          include: { service_local: true }
        }
      }
    });
  }
  
}

export default ReservationModel;
