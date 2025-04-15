import request from 'supertest'
import app from "../../src/server.js";
import prisma from '../../src/config/prisma.js';

describe("Avis Routes Publiques & Middleware", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    })

    it("devrait retourner la liste des avis existants avec un statut 200 OK", async ()=>{
        const mockAvis = [
            { id_avis: 1, note: 5, commentaire: 'Top !', date_avis: new Date() },
        ];
      
        prisma.avis.findMany.mockResolvedValue(mockAvis);
    
        const res = await request(app).get('/api/avis/');
    
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.data).toEqual(mockAvis); 
    })
})