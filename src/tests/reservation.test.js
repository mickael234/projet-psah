import { jest } from '@jest/globals';
import { enregistrerArrivee } from '../controllers/reservationController.js';
import * as reservationModel from '../models/reservation.model.js';

jest.mock('../models/reservation.model.js');

describe('Réservation - Check-in', () => {
  it('effectue un check-in correctement', async () => {
    const req = { params: { id: 1 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    reservationModel.updateEtat.mockResolvedValue({
      id_reservation: 1,
      etat: 'enregistree'
    });

    await enregistrerArrivee(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Check-in effectué')
    }));
  });
});
