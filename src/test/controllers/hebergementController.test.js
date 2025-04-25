import {expect, vi,it,describe} from 'vitest'
import HebergementController from "../../controllers/hebergementController.js"
import HebergementModel from '../../models/hebergementModel.js'
import {prisma} from "../../libs/__moks__/prisma.js"

vi.mock('../../libs/prisma.js', async () => {
    const actual = await vi.importActual('../../libs/__mocks__/prisma.js')
    return actual
  })

  const chambre = {
    id_chambre : 2,
    numero_chambre: "102",
    type_chambre: "Standard",
    prix_par_nuit:100.90,
    etat: "maintenance",
    description: "Chambre standard confortable avec vue sur la ville",
    modifie_par: null,
    date_modification:null
  }
  const mockRequest = (params = {}, body = {}) => ({
    params,
    body,
    user: { roles: ["RESPONSABLE_HEBERGEMENT"] }
  });
  const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

describe("la mise à jour de l' etat hebergement  au niveau du controller",  ()=> {
    
    it("updated Etat Hberfement succes", async() => {
        const req = mockRequest({ id: "2" }, { etat: "maintenance" });
        const res = mockResponse();
        vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(true);
        vi.spyOn(HebergementModel, "findById").mockResolvedValue(chambre);
        vi.spyOn(HebergementModel, "updateAvailability").mockResolvedValue({
          ...chambre,
          etat: "maintenance",
        });
        
        await HebergementController.updateAvailabilityHebergement(req, res);
        expect(HebergementModel.findById).toHaveBeenCalledWith(2);
        expect(HebergementModel.updateAvailability).toHaveBeenCalledWith(2, "maintenance");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: "Requête réussie",
            message: expect.any(String),
            data: expect.objectContaining({ etat: "maintenance" }),
          }));
        })
        it("refuse l'accès si l'utilisateur n'a pas les permissions", async () => {
            vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(false);
            
            const req = mockRequest({ id: "2" }, { etat: "maintenance" });
            const res = mockResponse();
        
            await HebergementController.updateAvailabilityHebergement(req, res);
        
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              status: "Accès interdit"
            }));
          });
          it("renvoie 404 si l'hébergement n'existe pas", async () => {
            const req = mockRequest({ id: "999" }, { etat: "disponible" });
            const res = mockResponse();

            vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(true);
            vi.spyOn(HebergementModel, "findById").mockResolvedValue(null);
        
            
        
            await HebergementController.updateAvailabilityHebergement(req, res);
        
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              status: "Ressource non trouvée"
            }));
          });
          it("renvoie 400 si le champ 'etat' est manquant", async () => {
            const req = mockRequest({ id: "2" }, {}); // pas d'etat dans le body
            const res = mockResponse();

            vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(true);
            vi.spyOn(HebergementModel, "findById").mockResolvedValue(chambre);
        
            
        
            await HebergementController.updateAvailabilityHebergement(req, res);
        
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              status: "Requête mal formée"
            }));
          });
          it("renvoie 500 en cas d'erreur serveur", async () => {
            vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(true);
            vi.spyOn(HebergementModel, "findById").mockRejectedValue(new Error("Crash test"));
        
            const req = mockRequest({ id: "2" }, { etat: "occupé" });
            const res = mockResponse();
        
            await HebergementController.updateAvailabilityHebergement(req, res);
        
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              status: "Erreur interne du serveur"
            }));
          });
})

/*describe("mise à jour du prix par nuit d'un hébergement",()=> {
    it("updated Etat Hberfement succes", async() => {
        const req = mockRequest({ id: "2" }, { etat: "maintenance" });
        const res = mockResponse();
        vi.spyOn(HebergementController, "verifierPermissions").mockReturnValue(true);
        vi.spyOn(HebergementModel, "findById").mockResolvedValue(chambre);
        vi.spyOn(HebergementModel, "updatePrice").mockResolvedValue({
            ...chambre,
            prix_par_nuit:100.90,
          });
          await HebergementController.updatePriceHebergement(req, res);
          expect(HebergementModel.findById).toHaveBeenCalledWith(2);
        expect(HebergementModel.updatePrice).toHaveBeenCalledWith(2,100.09);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: "Requête réussie",
            message: expect.any(String),
            data: expect.objectContaining({ etat: "maintenance" }),
          }));
    })
})*/