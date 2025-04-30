const ReponseAvisController = require('../src/controllers/reponseAvisController.js');
const ReponseAvisModel = require('../src/models/reponseAvis.model.js');
const AvisModel = require('../src/models/avis.model.js');

jest.mock('../src/models/reponseAvis.model.js');
jest.mock('../src/models/avis.model.js');

describe('ReponseAvisController - createReponse', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { idAvis: '1' },
      body: { commentaire: 'Merci pour votre retour.' },
      user: { id_utilisateur: 10 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('crée une réponse avec succès', async () => {
    AvisModel.findById.mockResolvedValue({ id: 1 });
    ReponseAvisModel.create.mockResolvedValue({
      id_reponse_avis: 5,
      commentaire: 'Merci pour votre retour.'
    });

    await ReponseAvisController.createReponse(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "OK",
      data: {
        id_reponse_avis: 5,
        commentaire: 'Merci pour votre retour.'
      }
    });
  });

  it("retourne 404 si l'avis n'existe pas", async () => {
    AvisModel.findById.mockResolvedValue(null);

    await ReponseAvisController.createReponse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'RESSOURCE NON TROUVEE',
      message: "L'avis n'existe pas."
    });
  });
});
