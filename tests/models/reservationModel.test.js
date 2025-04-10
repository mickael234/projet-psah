import ReservationModel from '../../src/models/reservation.model';
import { Reservation } from '../../__mocks__/prisma.mock.js';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        reservation: {
            findMany: jest.fn()
        }
    };
    return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('Reservation Model', () => {
    let prismaMock;

    beforeAll(() => {
        const mockDate = new Date('2025-04-10T00:00:00.000Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
        prismaMock = new PrismaClient();
    });
    
    afterAll(() => {
        jest.restoreAllMocks();
    });

    const today = new Date('2025-04-10T00:00:00.000Z');

    it("devrait récupérer toutes les réservations actuelles d'un client", async () => {
        const mockReservations = [
            {
                id_reservation: 1,
                id_client: 1,
                date_reservation: '2025-04-11T10:46:15.295Z',
                etat: 'confirmee',
                prix_total: '100',
                etat_paiement: 'en_attente',
                source_reservation: 'site_web',
                id_reservation_externe: null,
                supprime_le: null,
                client: {
                    id_client: 1,
                    id_utilisateur: 1,
                    prenom: 'John',
                    nom: 'Doe',
                    telephone: '1234567890',
                    statut_membre: 'membre',
                    consentement_marketing: false,
                    supprime_le: null
                },
                chambres: [
                    {
                        id_reservation: 1,
                        id_chambre: 1,
                        date_arrivee: '2025-05-01T00:00:00.000Z',
                        date_depart: '2025-05-07T00:00:00.000Z',
                        chambre: {
                            id_chambre: 1,
                            numero_chambre: '101',
                            type_chambre: 'Simple',
                            prix_par_nuit: '75',
                            etat: 'disponible',
                            description:
                                'Chambre simple avec un lit simple et vue sur le jardin.'
                        }
                    }
                ]
            }
        ];

        prismaMock.reservation.findMany.mockResolvedValue(mockReservations);

        const result = await ReservationModel.findAllPresentReservations(1);

        expect(result).toEqual(mockReservations);

        expect(PrismaClient().reservation.findMany).toHaveBeenCalledWith({
            where: {
                id_client: 1,
                OR: [
                    {
                        etat: {
                            in: ['en_attente', 'confirmee', 'enregistree']
                        },
                        chambres: {
                            some: { date_depart: { gte: today } }
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
                ]
            },
            include: {
                client: true,
                chambres: { include: { chambre: true } }
            }
        });
    });

    it("devrait récupérer toutes les réservations passées d'un client", async () => {
        const mockReservations = [
            {
                id_reservation: 1,
                id_client: 1,
                date_reservation: '2025-04-01T10:46:15.295Z',
                etat: 'annulee',
                prix_total: '100',
                etat_paiement: 'en_attente',
                source_reservation: 'site_web',
                id_reservation_externe: null,
                supprime_le: null,
                client: {
                    id_client: 1,
                    id_utilisateur: 1,
                    prenom: 'John',
                    nom: 'Doe',
                    telephone: '1234567890',
                    statut_membre: 'membre',
                    consentement_marketing: false,
                    supprime_le: null
                },
                chambres: [
                    {
                        id_reservation: 1,
                        id_chambre: 1,
                        date_arrivee: '2025-05-01T00:00:00.000Z',
                        date_depart: '2025-05-07T00:00:00.000Z',
                        chambre: {
                            id_chambre: 1,
                            numero_chambre: '101',
                            type_chambre: 'Simple',
                            prix_par_nuit: '75',
                            etat: 'disponible',
                            description:
                                'Chambre simple avec un lit simple et vue sur le jardin.'
                        }
                    }
                ]
            }
        ];

        prismaMock.reservation.findMany.mockResolvedValue(mockReservations);

        const result = await ReservationModel.findAllPastReservations(1);

        expect(result).toEqual(mockReservations);
        expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
            where: {
                id_client: 1,
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
    });
});
