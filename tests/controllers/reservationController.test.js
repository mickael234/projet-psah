import ReservationController from "../../src/controllers/reservationController";
import ReservationModel from "../../src/models/reservation.model";
import { clientAuth } from "../../src/controllers/reservationController";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient

// Mock du modèle pour éviter les appels réels à la base de données
jest.mock('../../src/models/reservation.model.js');

describe("Reservation Controller - Réservations Actuelles", () => {
    /**
     * Test : Retourne les reservations actuelles valides avec un statut 200 OK
     */
    it("devrait retourner une liste de réservations actuelles avec un statut de 200 OK", async () => {
        const mockReservations =  [
            {
              id_reservation: 1,
              id_client: 1,
              date_reservation: "2025-04-09T10:46:15.295Z",
              etat: "confirmee",
              prix_total: "100",
              etat_paiement: "en_attente",
              source_reservation: "site_web",
              id_reservation_externe: null,
              supprime_le: null,
              client: {
                id_client: 1,
                id_utilisateur: 1,
                prenom: "John",
                nom: "Doe",
                telephone: "1234567890",
                statut_membre: "membre",
                consentement_marketing: false,
                supprime_le: null
              },
              chambres: [
                {
                  id_reservation: 1,
                  id_chambre: 1,
                  date_arrivee: "2025-05-01T00:00:00.000Z",
                  date_depart: "2025-05-07T00:00:00.000Z",
                  chambre: {
                    id_chambre: 1,
                    numero_chambre: "101",
                    type_chambre: "Simple",
                    prix_par_nuit: "75",
                    etat: "disponible",
                    description: "Chambre simple avec un lit simple et vue sur le jardin."
                  }
                },
                {
                  id_reservation: 1,
                  id_chambre: 2,
                  date_arrivee: "2025-04-10T11:25:32.459Z",
                  date_depart: "2025-04-12T11:25:32.459Z",
                  chambre: {
                    id_chambre: 2,
                    numero_chambre: "102",
                    type_chambre: "Double",
                    prix_par_nuit: "100",
                    etat: "disponible",
                    description: "Chambre double avec lit king-size et vue sur la mer."
                  }
                }
              ]
            }
          ];

        ReservationModel.findAllPresentReservations.mockResolvedValue(mockReservations);

        const req = { params: { clientId: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ReservationController.getAllUserPresentReservations(req, res)
        expect(ReservationModel.findAllPresentReservations).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({status: 'OK', data: { reservations: mockReservations }})
    })

    /**
     * Test : Retourne 404 NOT FOUND si aucune réservation actuelle n'est trouvée
     */
    it("devrait retourner une erreur 404 si aucune réservation actuelle n\'est trouvée", async ()=> {
        ReservationModel.findAllPresentReservations.mockResolvedValue(null);
        const req = { params: { clientId: '15' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };


        await ReservationController.getAllUserPresentReservations(req, res)
        expect(ReservationModel.findAllPresentReservations).toHaveBeenCalledWith(15);
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({status: 'NOT FOUND', message: "Aucune réservation actuelle n'a été trouvé"})

    })
     /**
     * Test : Retourne 500 INTERNAL SERVER ERROR en cas d’erreur de la base de données
     */

    it("devrait retourner une erreur 500 en cas d'erreur interne", async ()=> {
        ReservationModel.findAllPresentReservations.mockRejectedValue(new Error('Database connection failed'));

        const req = { params: { clientId: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ReservationController.getAllUserPresentReservations(req, res)

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'INTERNAL SERVER ERROR',
            message: 'Une erreur interne est survenue.'
        });


    })
})

describe("ReservationController - Réservations Passées", () => {

    /**
     * Test : Retourne les réservations passées valides avec un statut 200 OK
     */
    it("devrait retourner une liste de réservations passées avec un statut de 200 OK", async () => {
        const mockReservations = [
            {
                id_reservation: 1,
                id_client: 1,
                date_reservation: "2025-04-09T10:46:15.295Z",
                etat: "confirmee",
                prix_total: "100",
                etat_paiement: "en_attente",
                source_reservation: "site_web",
                client: {
                    id_client: 1,
                    prenom: "John",
                    nom: "Doe"
                },
                chambres: []
            }
        ];

        ReservationModel.findAllPastReservations.mockResolvedValue(mockReservations);

        const req = { params: { clientId: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ReservationController.getAllUserPastReservations(req, res);

        expect(ReservationModel.findAllPastReservations).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ status: 'OK', data: { reservations: mockReservations } });
    });

    /**
     * Test : Retourne 404 NOT FOUND si aucune réservation passée n'est trouvée
     */
    it("devrait retourner une erreur 404 si aucune réservation passée n'est trouvée", async () => {
        ReservationModel.findAllPastReservations.mockResolvedValue([]);

        const req = { params: { clientId: '15' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ReservationController.getAllUserPastReservations(req, res);

        expect(ReservationModel.findAllPastReservations).toHaveBeenCalledWith(15);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ status: 'NOT FOUND', message: "Aucune réservation passée n'a été trouvé" });
    });
    /**
     * Test : Retourne 500 INTERNAL SERVER ERROR en cas d'erreur de la base de données
     */
    it("devrait retourner une erreur 500 en cas d'erreur interne", async () => {
        ReservationModel.findAllPastReservations.mockRejectedValue(new Error('Database connection failed'));

        const req = { params: { clientId: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ReservationController.getAllUserPastReservations(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'INTERNAL SERVER ERROR',
            message: 'Une erreur interne est survenue.'
        });
    });
});

describe("Vérification de l'authentification", ()=> {
    /**
     * Test : Vérification de l'authentification du client avec un clientId valide
     */
    it("devrait autoriser l'accès si le clientId est valide et correspond à l'utilisateur authentifié", async () => {
        const mockClient = { id_utilisateur: 1 };

        prisma.client.findUnique = jest.fn().mockResolvedValue(mockClient);

        const req = { params: { clientId: '1' }, user: { id: 1 } }; // Simule un utilisateur authentifié
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await clientAuth[1](req, res, next);

        expect(next).toHaveBeenCalled();
    });

    /**
     * Test : Retourne 400 si clientId n'est pas un nombre
     */
    it("devrait retourner une erreur 400 si clientId n'est pas un nombre", async () => {
        const req = { params: { clientId: 'not_a_number' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await clientAuth[1](req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ status: 'BAD REQUEST', message: "L'id du client n'est pas valide." });
    });

    /**
     * Test : Retourne 403 si l'utilisateur authentifié ne correspond pas au clientId
     */
    it("devrait retourner une erreur 403 si l\'utilisateur authentifié ne correspond pas au clientId", async () => {
        const mockClient = { id_utilisateur: 2 };

        prisma.client.findUnique = jest.fn().mockResolvedValue(mockClient);

        const req = { params: { clientId: '1' }, user: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await clientAuth[1](req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ status: 'FORBIDDEN', message: 'Accès non autorisé.' });
    });

    /**
     * Test : Retourne 500 INTERNAL SERVER ERROR si l'authentification échoue
     */
    it("devrait retourner une erreur 500 en cas d\'erreur interne", async () => {
        prisma.client.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

        const req = { params: { clientId: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await clientAuth[1](req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'INTERNAL SERVER ERROR',
            message: 'Une erreur interne est survenue.'
        });
    });
})