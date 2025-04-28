import { jest } from '@jest/globals';
import { creerMaintenance } from '../controllers/maintenanceController.js';
import * as maintenanceModel from '../models/maintenance.model.js';

jest.mock('../models/maintenance.model.js');

describe('Maintenance', () => {
  it('crée une maintenance correctement', async () => {
    const req = {
      params: { id: 1 },
      body: {
        description: 'Nettoyage filtre',
        date: '2025-04-22'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockMaintenance = {
      id_maintenance: 1,
      id_hebergement: 1,
      description: 'Nettoyage filtre',
      date: '2025-04-22'
    };

    maintenanceModel.creerMaintenance.mockResolvedValue(mockMaintenance);

    await creerMaintenance(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockMaintenance);
  });
});
