import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock AvisController
const mockAvisController = {
  getAllAvis: jest.fn(),
  getAvisByChambre: jest.fn(),
  getNoteMoyenneAvis: jest.fn(),
  getByNote: jest.fn(),
  getByReservation: jest.fn(),
  createAvis: jest.fn(),
  answerToAvis: jest.fn(),
  deleteAvis: jest.fn()
};

jest.unstable_mockModule('../../src/controllers/avisController.js', () => ({
  __esModule: true,
  default: mockAvisController
}));

let app;

// Création d'une nouvelle app express
beforeEach(async () => {
  jest.resetModules(); 
  jest.clearAllMocks();

  app = express();
  app.use(express.json());
});

describe("Avis Routes Publiques", () => {
  it('devrait retourner la liste des avis existants avec un statut 200 OK', async () => {
    const mockAvis = [
      {
        id_avis: 3,
        id_reservation: 3,
        note: 1,
        commentaire: "Très déçu, service client inexistant.",
        date_avis: "2025-03-03T08:50:00.000Z"
      }
    ];

    mockAvisController.getAllAvis.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: mockAvis
      });
    });

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.data).toHaveLength(1);
  });

  it("devrait retourner une erreur 404 si aucun avis n'est trouvé", async () => {
    mockAvisController.getAllAvis.mockImplementation((req, res) => {
      res.status(404).json({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé"
      });
    });

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('RESSOURCE NON TROUVEE');
    expect(res.body.message).toBe("Aucun avis n'a été trouvé");
  });

  it("devrait retourner des avis par chambre (ou hébergement)", async ()=> {
    const mockAvis = [
      {
        id_avis: 3,
        id_reservation: 3,
        note: 1,
        commentaire: "Très déçu, service client inexistant.",
        date_avis: "2025-03-03T08:50:00.000Z",
        reservation: {
          id_reservation: 3,
          id_client: 1,
          date_reservation: "2025-04-09T11:35:02.281Z",
          etat: "depart",
          prix_total: "280",
          etat_paiement: "complete",
          source_reservation: "site_web",
          id_reservation_externe: null,
          supprime_le: null,
          chambres: [
            {
              id_chambre: 3
            }
          ],
          client: {
            prenom: "John",
            nom: "Doe",
            utilisateur: {
              id_utilisateur: 1,
              nom_utilisateur: "user1",
              role: "client"
            }
          }
        }
      }
    ];
    mockAvisController.getAvisByChambre.mockImplementation((req, res)=> {
      res.status(200).json({
        status: "OK",
        data : mockAvis
    })
    })

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/chambre/3');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.data).toEqual(mockAvis);
  })

  it("devrait retourner une 400 si l'ID de la chambre n'est pas valide", async ()=> {
    mockAvisController.getAvisByChambre.mockImplementation((req, res) => {
      res.status(400).json({
        status: 'MAUVAISE DEMANDE',
        message: "L'id de la chambre est invalide"
      })
    })

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/chambre/n');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('MAUVAISE DEMANDE');
    expect(res.body.message).toBe("L'id de la chambre est invalide");

  })

  it("devrait retourner 404 si aucun avis a été trouvé pour la chambre demandée", async () => {
    mockAvisController.getAvisByChambre.mockImplementation((req, res) => {
      res.status(404).json({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé pour cette chambre"
      })
    })

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/chambre/1888');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('RESSOURCE NON TROUVEE');
    expect(res.body.message).toBe("Aucun avis n'a été trouvé pour cette chambre");

  })

  it("devrait retourner la moyenne des avis existants", async ()=> {
    const mockMoyenne = 4;

    mockAvisController.getNoteMoyenneAvis.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'OK',
        data: mockMoyenne
      });
    });

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/moyenne');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.data).toBe(4);

  })

  it("devrait retourner les avis par note", async () => {
    const mockAvis = [
      {
        id_avis: 3,
        id_reservation: 3,
        note: 1,
        commentaire: "Très déçu, service client inexistant.",
        date_avis: "2025-03-03T08:50:00.000Z"
      }
    ];

    mockAvisController.getByNote.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'OK',
          data: mockAvis
        });
      }
    );

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/note/1');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.data).toEqual(mockAvis);
  })

  it("devrait retourner 404 si aucun avis a été trouvé avec cette note", async () => {
    mockAvisController.getByNote.mockImplementation((req, res) => {
      res.status(404).json({
        status: 'RESSOURCE NON TROUVEE',
        message: "Aucun avis n'a été trouvé pour cette note"
      })
    })

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/note/2');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('RESSOURCE NON TROUVEE');
    expect(res.body.message).toBe("Aucun avis n'a été trouvé pour cette note");

  })

  it("devrait retourner 400 si la note n'est pas valide", async () => {
    mockAvisController.getByNote.mockImplementation((req, res) => {
      res.status(400).json({
        status: 'MAUVAISE DEMANDE',
        message: "La note n'est pas valide. Elle doit être comprise entre 1 et 5."
      })
    })

    const avisRoutes = (await import('../../src/routes/avisRoutes.js')).default;
    app.use('/api/avis', avisRoutes);

    const res = await request(app).get('/api/avis/note/10');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('MAUVAISE DEMANDE');
    expect(res.body.message).toBe("La note n'est pas valide. Elle doit être comprise entre 1 et 5.");


  })

});
