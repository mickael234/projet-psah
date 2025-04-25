import { jest } from '@jest/globals';
import { creerService } from '../controllers/serviceController.js';
import * as serviceModel from '../models/service.model.js';

jest.mock('../models/service.model.js');

describe('Service', () => {
  it('crée un service correctement', async () => {
    const req = {
      body: {
        nom: 'Petit déjeuner',
        description: 'Buffet complet',
        prix: 12.5
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockService = {
      id_service: 1,
      nom: 'Petit déjeuner',
      description: 'Buffet complet',
      prix: 12.5
    };

    serviceModel.creerService.mockResolvedValue(mockService);

    await creerService(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockService);
  });
});
