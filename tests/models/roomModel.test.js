import ChambreModel from '../../src/models/chambre.model.js';
import { chambre as _room } from '../../__mocks__/prisma.mock.js';

describe('Room Model', () => {
  it('should return room by ID with media and amenities', async () => {
    const mockRoom = {
        id_chambre: 1,
        numero_chambre: "101",
        type_chambre: "Simple",
        prix_par_nuit: "75",
        etat: "disponible",
        description: "Chambre simple avec un lit simple et vue sur le jardin.",
        equipements: [
            {
                id_chambre: 1,
                id_equipement: 1,
                equipement: {
                    id_equipement: 1,
                    nom: "WiFi"
                }
            },
            {
                id_chambre: 1,
                id_equipement: 2,
                equipement: {
                    id_equipement: 2,
                    nom: "TV"
                }
            }
        ],
        medias: [
            {
                id_media: 1,
                id_chambre: 1,
                type_media: "image",
                url: "http://example.com/chambre1_image.jpg",
                titre: "Vue de la chambre",
                description: "Une belle vue de la chambre 1"
            }
        ]
    };


    _room.findUnique.mockResolvedValue(mockRoom);

    const room = await ChambreModel.getWithRelations(1);

    expect(room).toEqual(mockRoom);

    expect(_room.findUnique).toHaveBeenCalledWith({
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