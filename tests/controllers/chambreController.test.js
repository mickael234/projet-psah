import ChambreController from '../../src/controllers/chambreController.js';
import ChambreModel from '../../src/models/chambre.model.js';

// Mock du modèle pour éviter les appels réels à la base de données
jest.mock('../../src/models/chambre.model.js');

describe('Chambre Controller', () => {
    /**
     * Test : Retourne une chambre valide avec un statut 200 OK
     */
    it('should return a room with a status of 200 OK', async () => {
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
                    equipement: { id_equipement: 1, nom: 'WiFi' }
                },
                {
                    id_chambre: 1,
                    id_equipement: 2,
                    equipement: { id_equipement: 2, nom: 'TV' }
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

        ChambreModel.getWithRelations.mockResolvedValue(mockRoom);

        const req = { params: { id: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ChambreController.getRoomDetails(req, res);

        expect(ChambreModel.getWithRelations).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'OK',
            data: { chambre: mockRoom }
        });
    });

    /**
     * Test : Retourne 404 NOT FOUND si aucune chambre n'est trouvée
     */
    it('should return a status of 404 NOT FOUND if no room is found', async () => {
        ChambreModel.getWithRelations.mockResolvedValue(null);

        const req = { params: { id: '22' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ChambreController.getRoomDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: 'NOT FOUND',
            message: "Aucune chambre n'a été trouvé"
        });
    });

    /**
     * Test : Retourne 400 BAD REQUEST si l'identifiant de la chambre est invalide
     */
    it('should return a status of 400 BAD REQUEST if the room id is invalid', async () => {
        const req = { params: { id: 'example' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ChambreController.getRoomDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 'BAD REQUEST',
            message: "L'id de la chambre n'est valide."
        });
    });

    /**
     * Test : Retourne 500 INTERNAL SERVER ERROR en cas d’erreur de la base de données
     */
    it('should return 500 INTERNAL SERVER ERROR when database throws an error', async () => {
        ChambreModel.getWithRelations.mockRejectedValue(
            new Error('Database connection failed')
        );

        const req = { params: { id: '1' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await ChambreController.getRoomDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'INTERNAL SERVER ERROR',
            message: 'Une erreur interne est survenue.'
        });
    });
});
