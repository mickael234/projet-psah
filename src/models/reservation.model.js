<<<<<<< HEAD
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
=======
import prisma from '../config/prisma.js';

class ReservationModel {
    /**
     * Récupère une réservation par son ID
     * @param {number} id - ID de la réservation
     * @returns {Promise<Object>} - La réservation trouvée
     */

    static async findById(id){
        return prisma.reservation.findUnique({
            where : {id_reservation : id}
        })
    }
    /**
     * Récupère une réservation avec ses relations
     * @param {number} id - ID de la réservation
     * @returns {Promise<Object>} - La réservation avec ses relations
     */
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

    /**
     * Vérifie la disponibilité des chambres pour une période donnée
     * @param {Date} dateArrivee - Date d'arrivée
     * @param {Date} dateDepart - Date de départ
     * @param {number} capacite - Capacité minimale requise
     * @returns {Promise<Array>} - Liste des chambres disponibles
     */
    static checkAvailability(dateArrivee, dateDepart, capacite = null) {
        // Récupérer les IDs des chambres déjà réservées pour cette période
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

            const reservedRoomIds = reservedRooms.map(
                (room) => room.id_chambre
            );

            // Trouver les chambres disponibles
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

    /**
     * Récupère les réservations pour une période donnée
     * @param {Date} debut - Date de début
     * @param {Date} fin - Date de fin
     * @returns {Promise<Array>} - Liste des réservations
     */
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

    /**
     * Récupère toutes les réservations actuelles d'un client.
     * @param {number} clientId - L'identifiant du client.
     * @returns {Promise<Array>} - Promesse contenant la liste des réservations actuelles avec les informations du client et des chambres.
     */

    static async findAllPresentReservations(clientId) {
        const today = new Date();
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                OR: [
                    {
                        etat: {
                            in: ['en_attente', 'confirmee', 'enregistree']
                        },
                        chambres: {
                            some: {
                                date_depart: { gte: today }
                            }
                        }
                    },
                    {
                        etat: 'enregistree',
                        chambres: {
                            some: {
                                date_arrivee: { lte: today },
                                date_depart: { gte: today }
                            }
                        }
                    }
>>>>>>> origin/hassan
                ]
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

    /**
     * Récupère toutes les réservations passées d'un client.
     *
     * @param {number} clientId - L'identifiant du client.
     * @returns {Promise<Array>} - Promesse contenant la liste des réservations passées avec les informations du client et des chambres.
     */

    static async findAllPastReservations(clientId) {
        const today = new Date();
        return prisma.reservation.findMany({
            where: {
                id_client: clientId,
                OR: [
                    { etat: { in: ['depart', 'annulee'] } },
                    {
                        etat: {
                            in: ['en_attente', 'confirmee', 'enregistree']
                        },
                        chambres: {
                            every: {
                                date_depart: { lt: today }
                            }
                        }
                    }
                ]
<<<<<<< HEAD
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
  
=======
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
>>>>>>> origin/hassan
}

export default ReservationModel;
