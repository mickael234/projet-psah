import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock du modèle Chambre
const mockChambreModel = {
  getWithRelations: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

// Mock du contrôleur 
const chambreController = {
  getChambreById: async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      if(isNaN(id) || !id) {
        return res.status(400).json({
          status: 'BAD REQUEST',
          message: 'L\'identifiant de la chambre est invalide'
        });
      }
      
      const room = await mockChambreModel.getWithRelations(id);
      
      if(!room) {
        return res.status(404).json({
          status: 'NOT FOUND',
          message: 'La chambre demandée n\'existe pas'
        });
      }
      
      return res.status(200).json({
        status: 'OK',
        data: room
      });
    } catch(error) {
      console.error('Une erreur est survenue : ' + error);
      return res.status(500).json({
        status: 'INTERNAL SERVER ERROR',
        message: 'Une erreur interne est survenue.'
      });
    }
  }
  
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Chambre Controller", () => {
  it('should return a room with a status of 200 OK', async () => {
    const mockRoom = {
      id_chambre: 1,
      numero_chambre: '101',
      type_chambre: 'Simple',
      prix_par_nuit: 75,
      etat: 'disponible',
      description: 'Chambre simple avec un lit simple',
      medias: [
        {
          id_media: 1,
          id_chambre: 1,
          titre: 'Photo chambre',
          description: 'Vue principale de la chambre',
          type_media: 'image',
          url: 'http://example.com/chambre1_image.jpg'
        }
      ]
    };

    mockChambreModel.getWithRelations.mockResolvedValue(mockRoom);

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chambreController.getChambreById(req, res);

    expect(mockChambreModel.getWithRelations).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'OK',
      data: mockRoom
    });
  });

  it('should return a status of 404 NOT FOUND if no room is found', async () => {
    mockChambreModel.getWithRelations.mockResolvedValue(null);

    const req = { params: { id: '22' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chambreController.getChambreById(req, res);

    expect(mockChambreModel.getWithRelations).toHaveBeenCalledWith(22);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'NOT FOUND',
      message: 'La chambre demandée n\'existe pas'
    });
  });

  it('should return 500 INTERNAL SERVER ERROR when database throws an error', async () => {
    mockChambreModel.getWithRelations.mockRejectedValue(
      new Error('Database connection failed')
    );

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chambreController.getChambreById(req, res);

    expect(mockChambreModel.getWithRelations).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'INTERNAL SERVER ERROR',
      message: 'Une erreur interne est survenue.'
    });
  });

});