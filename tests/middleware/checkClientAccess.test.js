import { checkClientAccess } from '../../src/middleware/auth.js';
import prisma from '../../src/config/prisma.js';

/**
 * Importation et mock de la même instance de Prisma utilisé par le middleware checkClientAcces
 */
jest.mock('../../src/config/prisma.js', () => ({
    __esModule: true,
    default: {
        utilisateur: {
            findUnique: jest.fn()
        },
        client: {
            findUnique: jest.fn()
        }
    }
}));

describe('CheckClientAccess Middleware', () => {
    /**
     * Simulation des arguments passés au middleware checkClientAcces (req, res, next)
     */

    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            params: {},
            user: {
                role: 'CLIENT',
                email: 'client@example.com'
            }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        prisma.utilisateur.findUnique.mockResolvedValue({
            id_utilisateur: 57,
            email: 'client@example.com'
        });
        prisma.client.findUnique.mockResolvedValue({
            id_utilisateur: 57
        });
    });

    /**
     * Test : Retourne 400 BAD REQUEST si l'id du client n'est pas valide
     */

    it("devrait renvoyer 400 si clientId n'est pas un nombre", async () => {
        mockRequest.params = { clientId: 'n' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'BAD REQUEST',
            message: "L'id du client n'est pas valide."
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    /**
     * Test : Retourne 404 NOT FOUND si l'utilisateur n'est pas trouvé
     */

    it('devrait renvoyer 404 si utilisateur non trouvé', async () => {
        prisma.utilisateur.findUnique.mockResolvedValue(null);
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'NOT FOUND',
            message: 'Aucun utilisateur trouvé'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    /**
     * Test : Retourne 404 NOT FOUND si le le client n'est pas trouvé
     */

    it('devrait renvoyer 404 si client non trouvé', async () => {
        prisma.client.findUnique.mockResolvedValue(null);
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'NOT FOUND',
            message: 'Client non trouvé'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    /**
     * Test : Retourne 403 FORBIDDEN si l'utilisateur n'a pas les droits d'accès
     */

    it('devrait renvoyer 403 si accès non autorisé', async () => {
        prisma.client.findUnique.mockResolvedValue({ id_utilisateur: 2 });
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'FORBIDDEN',
            message: 'Accès non autorisé'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    /**
     * Test : Accède au endpoint si l'utilisateur a les droits d'accès (role SUPER ADMIN)
     */

    it('devrait appeler next() pour SUPER_ADMIN', async () => {
        mockRequest.user = { role: 'SUPER_ADMIN', email: 'admin@example.com' };
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    /**
     * Test : Autorise l'accès si l'utilisateur est bien le client concerné
     */

    it('devrait appeler next() si accès autorisé', async () => {
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    /**
     * Test : Retourne 500 INTERNAL SERVER ERROR en cas d’erreur du serveur
     */

    it("devrait renvoyer 500 en cas d'erreur interne", async () => {
        prisma.utilisateur.findUnique.mockRejectedValue(new Error('DB Error'));
        mockRequest.params = { clientId: '1' };

        await checkClientAccess(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'INTERNAL SERVER ERROR',
            message:
                "Une erreur interne est survenue lors de la vérification des droits d'accès."
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
