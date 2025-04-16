import { jest, describe, it, expect, beforeAll } from '@jest/globals';

// Créer un mock de chambre
const prismaMock = {
  chambre: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock du module prisma 
jest.mock('../../src/config/prisma.js', () => ({
  __esModule: true,
  default: prismaMock
}));


let ChambreModel;
beforeAll(async () => {
  ChambreModel = (await import("../../src/models/chambre.model.js")).default;
});

describe('Room Model', () => {
    afterEach(() => jest.clearAllMocks());

    /**
     * Test : Récupération d'une chambre par ID avec médias et équipements
     */
    it('should return room by ID with media and amenities', async () => {
        const mockRoom = {
            id_chambre: 1,
            numero_chambre: '101',
            type_chambre: 'Simple',
            prix_par_nuit: '75',
            etat: 'disponible',
            description:
                'Chambre simple avec un lit simple et vue sur le jardin.',
            equipements: [
                {
                    id_chambre: 1,
                    id_equipement: 1,
                    equipement: {
                        id_equipement: 1,
                        nom: 'WiFi'
                    }
                },
                {
                    id_chambre: 1,
                    id_equipement: 2,
                    equipement: {
                        id_equipement: 2,
                        nom: 'TV'
                    }
                }
            ],
            medias: [
                {
                    id_media: 1,
                    id_chambre: 1,
                    type_media: 'image',
                    url: 'http://example.com/chambre1_image.jpg',
                    titre: 'Vue de la chambre',
                    description: 'Une belle vue de la chambre 1'
                }
            ]
        };

        prismaMock.chambre.findUnique.mockResolvedValue(mockRoom);

        const room = await ChambreModel.getWithRelations(1);
        
      
        expect(room.id_chambre).toEqual(mockRoom.id_chambre);
        expect(room.numero_chambre).toEqual(mockRoom.numero_chambre);
        expect(room.type_chambre).toEqual(mockRoom.type_chambre);
        expect(room.prix_par_nuit.toString()).toEqual(mockRoom.prix_par_nuit);
        expect(room.etat).toEqual(mockRoom.etat);
        expect(room.description).toEqual(mockRoom.description);
        expect(room.equipements).toEqual(mockRoom.equipements);
        expect(room.medias).toEqual(mockRoom.medias);

        expect(prismaMock.chambre.findUnique).toHaveBeenCalledWith({
            where: { id_chambre: 1 },
            include: {
                equipements: {
                    include: {
                        equipement: true
                    }
                },
                medias: true
            }
        });
    });
});