// src/docs/paiementRouteDoc.js
const paiementRouteDoc = {
    '/api/paiements/reservation/{id}': {
      get: {
        summary: 'Récupérer tous les paiements d\'une réservation',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la réservation'
          }
        ],
        responses: {
          200: {
            description: 'Liste des paiements',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Paiements récupérés avec succès' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id_paiement: { type: 'integer' },
                          id_reservation: { type: 'integer' },
                          montant: { type: 'number' },
                          methode_paiement: { type: 'string' },
                          date_transaction: { type: 'string', format: 'date-time' },
                          etat: { type: 'string' },
                          reference_transaction: { type: 'string' },
                          numero_echeance: { type: 'integer' },
                          total_echeances: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/paiements/{id}': {
      get: {
        summary: 'Récupérer un paiement par son ID',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du paiement'
          }
        ],
        responses: {
          200: {
            description: 'Paiement récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Paiement récupéré avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_paiement: { type: 'integer' },
                        id_reservation: { type: 'integer' },
                        montant: { type: 'number' },
                        methode_paiement: { type: 'string' },
                        date_transaction: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        reference_transaction: { type: 'string' },
                        numero_echeance: { type: 'integer' },
                        total_echeances: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Mettre à jour un paiement',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du paiement'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  etat: { 
                    type: 'string', 
                    enum: ['en_attente', 'complete', 'echoue', 'rembourse']
                  },
                  reference_transaction: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Paiement mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Paiement mis à jour avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_paiement: { type: 'integer' },
                        id_reservation: { type: 'integer' },
                        montant: { type: 'number' },
                        methode_paiement: { type: 'string' },
                        date_transaction: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        reference_transaction: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/paiements': {
      post: {
        summary: 'Créer un nouveau paiement',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_reservation', 'montant', 'methode_paiement'],
                properties: {
                  id_reservation: { type: 'integer' },
                  montant: { type: 'number' },
                  methode_paiement: { type: 'string' },
                  reference_transaction: { type: 'string' },
                  etat: { 
                    type: 'string', 
                    enum: ['en_attente', 'complete', 'echoue', 'rembourse'],
                    default: 'en_attente'
                  },
                  numero_echeance: { type: 'integer' },
                  total_echeances: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Paiement créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Paiement créé avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_paiement: { type: 'integer' },
                        id_reservation: { type: 'integer' },
                        montant: { type: 'number' },
                        methode_paiement: { type: 'string' },
                        date_transaction: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        reference_transaction: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/paiements/{id}/refund': {
      post: {
        summary: 'Rembourser un paiement',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du paiement'
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  raison: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Paiement remboursé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Paiement remboursé avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_paiement: { type: 'integer' },
                        id_reservation: { type: 'integer' },
                        montant: { type: 'number' },
                        methode_paiement: { type: 'string' },
                        date_transaction: { type: 'string', format: 'date-time' },
                        etat: { type: 'string', example: 'rembourse' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  export default paiementRouteDoc;