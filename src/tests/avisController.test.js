const AvisController = require('../src/controllers/avisController.js');
const AvisModel = require('../src/models/avis.model.js');

jest.mock('../src/models/avis.model.js');

describe('AvisController - getAllAvis', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('doit retourner tous les avis avec succès', async () => {
    const avisFictifs = [{ id: 1, commentaire: 'Top' }];
    AvisModel.findAll.mockResolvedValue(avisFictifs);

    await AvisController.getAllAvis(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'OK',
      data: avisFictifs
    });
  });

  it("doit retourner 404 s'il n'y a pas d'avis", async () => {
    AvisModel.findAll.mockResolvedValue([]);

    await AvisController.getAllAvis(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'RESSOURCE NON TROUVEE',
      message: "Aucun avis n'a été trouvé"
    });
  });
});
