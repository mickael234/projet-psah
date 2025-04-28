import { jest } from '@jest/globals';
import { genererFacture } from '../controllers/factureController.js';

import * as reservationModel from '../models/reservation.model.js';
import * as utilisateurModel from '../models/utilisateur.model.js';

jest.mock('../models/reservation.model.js');
jest.mock('../models/utilisateur.model.js');

describe('Facture - JSON', () => {
  it('génère correctement la facture JSON', async () => {
    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const fakeReservation = {
      id_reservation: 1,
      etat: 'confirmee',
      etat_paiement: 'payé',
      client: {
        prenom: 'Lyna',
        nom: 'Chalal',
        utilisateur: { email: 'lyna.auto@example.com' }
      },
      chambres: [{
        chambre: {
          numero_chambre: '101',
          type_chambre: 'double',
          prix_par_nuit: 50
        },
        date_arrivee: '2025-04-01',
        date_depart: '2025-04-03'
      }],
      paiements: [{ montant: 100 }],
      services: [{ service: { nom: 'Massage', prix: 30 }, quantite: 1 }],
      services_locaux: [{ service_local: { nom: 'Transport', prix: 20 } }]
    };

    const fakeUser = {
      billingInfo: {
        address: '1 rue du code',
        city: 'Paris',
        postalCode: '75000',
        country: 'France'
      }
    };

    reservationModel.getFullReservation.mockResolvedValue(fakeReservation);
    utilisateurModel.findByEmail.mockResolvedValue(fakeUser);

    await genererFacture(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      client: expect.objectContaining({
        nom: 'Lyna Chalal'
      }),
      reservation: expect.objectContaining({
        nb_nuits: 2
      }),
      montant_total_general: 100 + 30 + 20
    }));
  });
});
