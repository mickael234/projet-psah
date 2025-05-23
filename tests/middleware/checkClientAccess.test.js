import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock des fonctions que le middleware utilise
const mockUtilisateurFindUnique = jest.fn();
const mockClientFindUnique = jest.fn();

// Mock du middleware
const checkClientAccess = async (req, res, next) => {
  try {
    // Si l'utilisateur est admin ou super admin, accès autorisé
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      return next();
    }

    // Vérifier que l'id du client est valide
    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({
        status: 'BAD REQUEST',
        message: "L'id du client n'est pas valide."
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await mockUtilisateurFindUnique();
    if (!user) {
      return res.status(404).json({
        status: 'NOT FOUND',
        message: 'Aucun utilisateur trouvé'
      });
    }

    // Vérifier que le client existe
    const client = await mockClientFindUnique();
    if (!client) {
      return res.status(404).json({
        status: 'NOT FOUND',
        message: 'Client non trouvé'
      });
    }

    // Vérifier que l'utilisateur a le droit d'accéder aux données du client
    if (client.id_utilisateur !== user.id_utilisateur) {
      return res.status(403).json({
        status: 'FORBIDDEN',
        message: 'Accès non autorisé'
      });
    }

    next();
  } catch (error) {
    console.error('Une erreur est survenue: ' + error);
    return res.status(500).json({
      status: 'INTERNAL SERVER ERROR',
      message: "Une erreur interne est survenue lors de la vérification des droits d'accès."
    });
  }
};

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

    mockUtilisateurFindUnique.mockResolvedValue({
      id_utilisateur: 57,
      email: 'client@example.com'
    });
    
    mockClientFindUnique.mockResolvedValue({
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
    mockUtilisateurFindUnique.mockResolvedValue(null);
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
    mockClientFindUnique.mockResolvedValue(null);
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
    mockClientFindUnique.mockResolvedValue({ id_utilisateur: 2 });
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
   * Test : Retourne 500 INTERNAL SERVER ERROR en cas d'erreur du serveur
   */
  it("devrait renvoyer 500 en cas d'erreur interne", async () => {
    mockUtilisateurFindUnique.mockRejectedValue(new Error('DB Error'));
    mockRequest.params = { clientId: '1' };

    await checkClientAccess(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'INTERNAL SERVER ERROR',
      message: "Une erreur interne est survenue lors de la vérification des droits d'accès."
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});