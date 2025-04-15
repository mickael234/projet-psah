import AvisController from "../../src/controllers/avisController.js";
import ReservationModel from "../../src/models/reservation.model.js";
import AvisModel from "../../src/models/avis.model.js";

jest.mock("../../src/models/avis.model.js");
jest.mock("../../src/models/reservation.model.js");

describe("Avis Controller", () => {

    describe("getAllAvis", () => {

        /**
         * Test : Retourne tous les avis existants avec un statut 200 OK
         */
        it("devrait retourner tous les avis existants avec un status 200 OK", async () => {
            const mockAvis = [
                {
                    id_avis: 1,
                    id_reservation: 12,
                    note: 5,
                    commentaire: "Séjour parfait, chambre propre et calme.",
                    date_avis: new Date("2024-10-15T10:24:00Z")
                },
                {
                    id_avis: 2,
                    id_reservation: 18,
                    note: 3,
                    commentaire: "Correct, mais un peu bruyant le soir.",
                    date_avis: new Date("2025-01-08T17:45:00Z")
                }
            ];
    
            AvisModel.findAll.mockResolvedValue(mockAvis);
    
            const req = {}
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            await AvisController.getAllAvis(req, res);
    
            expect(AvisModel.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'OK',
                data: mockAvis
            });
        }),
    
         /**
         * Test : Retourne 404 NOT FOUND si aucun avis n'est trouvé
         */

        it("devrait retourner une erreur 404 si aucun avis a été trouvé", async () =>  {
            AvisModel.findAll.mockResolvedValue([]);

            const req = {}
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            await AvisController.getAllAvis(req, res);

            expect(AvisModel.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucun avis n'a été trouvé"
            });
    
        }),

        /**
         * Test : Retourne 500 INTERNAL SERVER ERROR en cas d'erreur serveur
         */
        it("devrait retourner une erreur 500 en cas d'erreur serveur", async () => {
            AvisModel.findAll.mockRejectedValue(new Error("Erreur serveur"));

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getAllAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        });
    }),

    describe("getByReservation", () => {

        /**
         * Test : Retourne 400 BAD REQUEST si l'id de réservation est invalide
         */
        it("devrait retourner une erreur 400 si l'id de réservation est invalide", async () => {
            const req = {params :{ idReservation: "abc" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getByReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "L'id de la réservation est invalide"
            });
        });

         /**
         * Test : Retourne un avis avec un statut 200 OK
         */

        it("devrait retourner l'avis d'une réservation avec un status 200", async () => {
            const req = {params :{ idReservation: "42" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const mockAvis = {
                id_avis: 3,
                id_reservation: 42,
                note: 4,
                commentaire: "Très bon accueil.",
                date_avis: new Date("2024-11-01T15:00:00Z")
            };

            await AvisModel.findByReservation.mockResolvedValue(mockAvis);

            await ReservationModel.getWithRelations.mockResolvedValue({
                id_reservation: 42,
                id_client: 1,
                date_reservation: new Date("2023-04-09T10:46:15.295Z"),
                etat: "confirmee",
                prix_total: 100,
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
                    date_arrivee: new Date("2025-05-01T00:00:00.000Z"),
                    date_depart: new Date("2025-05-07T00:00:00.000Z"),
                    chambre: {
                      id_chambre: 1,
                      numero_chambre: "101",
                      type_chambre: "Simple",
                      prix_par_nuit: 75,
                      etat: "disponible",
                      description: "Chambre simple avec un lit simple et vue sur le jardin."
                    }
                  }
                ]
              });

            await AvisController.getByReservation(req, res);

            expect(ReservationModel.getWithRelations).toHaveBeenCalledWith(42);
            expect(AvisModel.findByReservation).toHaveBeenCalledWith(42);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: mockAvis
            });
        });

        /**
         * Test : Retourne 404 NOT FOUND si aucun avis pour cette réservation
         */
      

        it("devrait retourner une erreur 404 si aucun avis pour cette réservation", async () => {
            AvisModel.findByReservation.mockResolvedValue(null);

            const req = {params: { idReservation: "1000" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getByReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucun avis n'a été trouvé pour cette réservation"
            });
        });

        /**
         * Test : Retourne 500 INTERNAL SERVER ERROR en cas d'erreur serveur
         */

        it("devrait retourner une erreur 500 en cas d'erreur serveur", async () => {

            const req = {params :{ idReservation: "42" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ReservationModel.getWithRelations.mockRejectedValue(new Error("Erreur DB"));
            await AvisController.getByReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        });
    });

    describe("getAvisByChambre", () => {
        /**
         * Test : Retourne 400 BAD REQUEST si l'id de chambre est invalide
         */
        it("devrait retourner une erreur 400 si l'id de la chambre est invalide", async () => {
            const req = {params :{ idChambre: "abc" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getAvisByChambre(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "L'id de la chambre est invalide"
            });
        });

        /**
         * Test : Retourne les avis liés à une chambre avec un statut 200 OK
         */

        it("devrait retourner les avis liés à une chambre", async () => {
            const mockAvis = [{ id_avis: 1, note: 5 }];
            AvisModel.findAllByChambre.mockResolvedValue(mockAvis);

            const req = {params : { idChambre: 12 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getAvisByChambre(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: mockAvis
            });
        });

        /**
         * Test : Retourne 404 NOT FOUND si aucun avis n'est trouvé
         */
        it("devrait retourner une erreur 404 si aucun avis trouvé", async () => {
            AvisModel.findAllByChambre.mockResolvedValue([]);

            const req = {params :{ idChambre: 99 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getAvisByChambre(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucun avis n'a été trouvé pour cette chambre"
            });
        });
    }),

    describe("getNoteMoyenneAvis", () => {
        /**
         * Test : Retourne la note moyenne avec un statut 200 OK
         */
        it("devrait retourner la note moyenne", async () => {
            const moyenne = 4.2;
            AvisModel.getAverageRating.mockResolvedValue(moyenne);

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getNoteMoyenneAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: moyenne
            });
        });

         /**
         * Test : Retourne 500 INTERNAL SERVER ERROR en cas d'erreur
         */
        it("devrait retourner une erreur 500 en cas d'erreur", async () => {
            AvisModel.getAverageRating.mockRejectedValue(new Error("Erreur"));

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getNoteMoyenneAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'ERREUR SERVEUR',
                message: 'Une erreur interne est survenue.'
            });
        });
    }),
    describe("getByNote", () => {

        /**
         * Test : Retourne 400 BAD REQUEST si la note est invalide
         */
        it("devrait retourner une erreur 400 si la note est invalide", async () => {
            const req = {params: { note: 6 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getByNote(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
            });
        });

        /**
         * Test : Retourne les avis filtrés par note avec un statut 200 OK
         */
        it("devrait retourner les avis filtrés par note", async () => {
            const avis = [
                { 
                    id_avis: 1,
                    id_reservation: 12,
                    note: 4,
                    commentaire: "Séjour parfait, chambre propre et calme.",
                    date_avis: new Date("2024-10-15T10:24:00Z")
                }
            ];

            AvisModel.findByRating.mockResolvedValue(avis);

            const req = {params : { note: 4 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getByNote(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: avis
            });
        });

        /**
         * Test : Retourne 404 NOT FOUND si aucun avis avec cette note
         */
        it("devrait retourner une erreur 404 si aucun avis avec cette note", async () => {
            AvisModel.findByRating.mockResolvedValue([]);

            const req = {params :{ note: 2 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.getByNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Aucun avis n'a été trouvé pour cette note"
            });
        });
    }),

    describe("createAvis", () => {
        /**
         * Test : Retourne 400 BAD REQUEST si l'avis est invalide
         */
        it("devrait retourner une erreur 400 si l'avis est invalide (note ou commentaire insuffisant)", async () => {
            const req = {
                body : {
                    id_avis: 1,
                    id_reservation: 12,
                    note: 6,
                    commentaire: "Séjour parfait, chambre propre et calme.",
                    date_avis: new Date("2024-10-15T10:24:00Z")
                } 
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.createAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "L'avis n'est pas valide (note ou commentaire insuffisant)."
            });
        });

        /**
         * Test : Retourne 409 CONFLICT si un avis existe déjà pour cette réservation
         */

        it("devrait retourner une erreur 409 si un avis existe déjà pour la réservation", async () => {
            const mockReservation = {
                id_reservation: 1,
                id_client: 1,
                date_reservation: new Date("2023-04-09T10:46:15.295Z"),
                etat: "confirmee",
                prix_total: 100,
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
                    date_arrivee: new Date("2023-05-01T00:00:00.000Z"),
                    date_depart: new Date("2023-05-07T00:00:00.000Z"),
                    chambre: {
                      id_chambre: 1,
                      numero_chambre: "101",
                      type_chambre: "Simple",
                      prix_par_nuit: 75,
                      etat: "disponible",
                      description: "Chambre simple avec un lit simple et vue sur le jardin."
                    }
                  }
                ]
              }

              ReservationModel.getWithRelations.mockResolvedValue(mockReservation);

            const mockAvis = {
                id_avis: 1,
                id_reservation: 12,
                note: 6,
                commentaire: "Séjour parfait, chambre propre et calme.",
                date_avis: new Date("2024-10-15T10:24:00Z")
            }
            AvisModel.findByReservation.mockResolvedValue(mockAvis);

            const req = {
                body : {
                    id_reservation: 12,
                    note: 4,
                    commentaire: "Séjour parfait, chambre propre et calme.",
                }
            };


            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.createAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                status: 'CONFLIT',
                message: "Vous ne pouvez pas laisser plusieurs avis sur cette réservation."
            });
        });

        /**
         * Test : Crée un avis et retourne un statut 201 CREATED
         */
        it("devrait créer un nouvel avis et retourner un status 201", async () => {

            const mockReservation = {
                id_reservation: 1,
                id_client: 1,
                date_reservation: new Date("2023-04-09T10:46:15.295Z"),
                etat: "confirmee",
                prix_total: 100,
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
                    date_arrivee: new Date("2023-05-01T00:00:00.000Z"),
                    date_depart: new Date("2023-05-07T00:00:00.000Z"),
                    chambre: {
                      id_chambre: 1,
                      numero_chambre: "101",
                      type_chambre: "Simple",
                      prix_par_nuit: 75,
                      etat: "disponible",
                      description: "Chambre simple avec un lit simple et vue sur le jardin."
                    }
                  }
                ]
              }

              ReservationModel.getWithRelations.mockResolvedValue(mockReservation);
              AvisModel.findByReservation.mockResolvedValue(null);


            const nouvelAvis = {
                id_reservation: 42,
                note: 4,
                commentaire: "Séjour parfait, chambre propre et calme.",
                date_avis: new Date("2024-10-15T10:24:00Z")
            };
            const avisCree = { ...nouvelAvis, id_avis: 99, date_avis: new Date("2024-10-15T10:24:00Z") };
           
            AvisModel.create.mockResolvedValue(avisCree);

            const req = {body :  nouvelAvis };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.createAvis(req, res);

            expect(AvisModel.create).toHaveBeenCalledWith(nouvelAvis);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: avisCree
            });
        });
    }),
    describe("answerToAvis", () => {

         /**
         * Test : Retourne 404 NOT FOUND si l'avis n'existe pas
         */
        it("devrait retourner 404 si l'avis n'existe pas", async () => {
            AvisModel.findById.mockResolvedValue(null);

            const req =  {
                params: { idAvis: 1 },
                body: { reponse: "Merci à vous" },
                user: { role: "admin" }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.answerToAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'RESSOURCE NON TROUVEE',
                message: "Impossible de répondre à cet avis, aucun avis n'a été trouvé."
            });
        });

        /**
         * Test : Retourne 400 BAD REQUEST si la réponse est invalide
         */
        it("devrait retourner 400 si la réponse est trop courte", async () => {
            AvisModel.findById.mockResolvedValue({ id_avis: 1, commentaire: "Correct" });

            const req = {
                params: { idAvis: 1 }, 
                body: { reponse: "Ok" },
                user: { role: { name: "admin" } }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.answerToAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "La réponse est invalide (trop courte ou absente)."
            });
        });


        /**
         * Test : Répond à l'avis et retourne le commentaire mis à jour avec un statut 200 OK
         */

        it("devrait retourner 200 avec le commentaire mis à jour", async () => {
            const avis = {
                id_avis: 1,
                id_reservation: 42,
                note: 4,
                commentaire: "Bon séjour",
                date_avis: new Date("2024-10-15T10:24:00Z")
            };
            const reponse = "Merci pour votre retour";
            const rolePersonnel = "admin";

            const commentaireFinal = `Bon séjour\n\n---\nRéponse du personnel : ${reponse}\n(Répondu par ${rolePersonnel})`;
            const avisAvecReponse = { 
                ...avis, 
                commentaire: commentaireFinal 
            };

            AvisModel.findById.mockResolvedValue(avis);
            AvisModel.update.mockResolvedValue(avisAvecReponse);

            const req = {
                params: { idAvis: "1" }, 
                body: { reponse },
                user: { role: rolePersonnel }
            };
            
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.answerToAvis(req, res);

            expect(AvisModel.update).toHaveBeenCalledWith(1, commentaireFinal);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "OK",
                data: avisAvecReponse
            });
        });
    }),
    describe("deleteAvis", () => {
        /**
         * Test : Retourne 404 BAD REQUEST si l'id de l'avis est invalide
         */
        it("devrait retourner 404 si l'id de l'avis est invalide", async () => {
            const req = {params :{ idAvis: "abc" }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.deleteAvis(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'MAUVAISE DEMANDE',
                message: "L'id de l'avis est invalide"
            });
        });


        /**
         * Test : Supprime l'avis et retourne un statut 200 OK
         */

        it("devrait supprimer l'avis et retourner un status 200", async () => {
            const avisSupprime = { 
                id_avis: 1,
                id_reservation: 42,
                note: 4,
                commentaire: "Séjour parfait, chambre propre et calme.",
                date_avis: new Date("2024-10-15T10:24:00Z") 
            };
            AvisModel.delete.mockResolvedValue(avisSupprime);

            const req = {params : { idAvis: 1 }};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AvisController.deleteAvis(req, res);

            expect(AvisModel.delete).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "SUPPRIME",
                data: avisSupprime
            });
        });
    });
    
})