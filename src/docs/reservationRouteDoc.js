// src/docs/reservationRouteDoc.js
const reservationRouteDoc = {
    '/api/reservations': {
      get: {
        summary: 'Récupérer toutes les réservations',
        tags: ['Réservations'],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Numéro de page'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Nombre d\'éléments par page'
          },
          {
            in: 'query',
            name: 'etat',
            schema: { type: 'string', enum: ['en_attente', 'confirmee', 'annulee', 'enregistree', 'depart'] },
            description: 'État de la réservation'
          },
          {
            in: 'query',
            name: 'clientId',
            schema: { type: 'integer' },
            description: 'ID du client'
          },
          {
            in: 'query',
            name: 'dateDebut',
            schema: { type: 'string', format: 'date' },
            description: 'Date de début de la période'
          },
          {
            in: 'query',
            name: 'dateFin',
            schema: { type: 'string', format: 'date' },
            description: 'Date de fin de la période'
          }
        ],
        responses: {
          200: {
            description: 'Liste des réservations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservations récupérées avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id_reservation: { type: 'integer' },
                              id_client: { type: 'integer' },
                              date_reservation: { type: 'string', format: 'date-time' },
                              etat: { type: 'string' },
                              prix_total: { type: 'number' },
                              etat_paiement: { type: 'string' }
                            }
                          }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer' },
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            pages: { type: 'integer' }
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
      post: {
        summary: 'Créer une nouvelle réservation',
        tags: ['Réservations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_client', 'chambres'],
                properties: {
                  id_client: { type: 'integer' },
                  chambres: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id_chambre', 'date_arrivee', 'date_depart'],
                      properties: {
                        id_chambre: { type: 'integer' },
                        date_arrivee: { type: 'string', format: 'date' },
                        date_depart: { type: 'string', format: 'date' }
                      }
                    }
                  },
                  services: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id_service'],
                      properties: {
                        id_service: { type: 'integer' },
                        quantite: { type: 'integer', default: 1 }
                      }
                    }
                  },
                  prix_total: { type: 'number' },
                  etat: { 
                    type: 'string', 
                    enum: ['en_attente', 'confirmee', 'annulee', 'enregistree', 'depart'],
                    default: 'en_attente'
                  },
                  source_reservation: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Réservation créée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservation créée avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_reservation: { type: 'integer' },
                        id_client: { type: 'integer' },
                        date_reservation: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        prix_total: { type: 'number' },
                        etat_paiement: { type: 'string' }
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
    '/api/reservations/{id}': {
      get: {
        summary: 'Récupérer une réservation par son ID',
        tags: ['Réservations'],
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
            description: 'Réservation récupérée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservation récupérée avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_reservation: { type: 'integer' },
                        id_client: { type: 'integer' },
                        date_reservation: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        prix_total: { type: 'number' },
                        etat_paiement: { type: 'string' },
                        client: {
                          type: 'object',
                          properties: {
                            id_client: { type: 'integer' },
                            prenom: { type: 'string' },
                            nom: { type: 'string' }
                          }
                        },
                        chambres: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id_chambre: { type: 'integer' },
                              date_arrivee: { type: 'string', format: 'date' },
                              date_depart: { type: 'string', format: 'date' },
                              chambre: {
                                type: 'object',
                                properties: {
                                  id_chambre: { type: 'integer' },
                                  numero_chambre: { type: 'string' },
                                  type_chambre: { type: 'string' },
                                  prix_par_nuit: { type: 'number' }
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
            }
          }
        }
      },
      put: {
        summary: 'Mettre à jour une réservation',
        tags: ['Réservations'],
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
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  etat: { 
                    type: 'string', 
                    enum: ['en_attente', 'confirmee', 'annulee', 'enregistree', 'depart']
                  },
                  prix_total: { type: 'number' },
                  etat_paiement: { 
                    type: 'string', 
                    enum: ['en_attente', 'complete', 'echoue', 'rembourse']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Réservation mise à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservation mise à jour avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_reservation: { type: 'integer' },
                        id_client: { type: 'integer' },
                        date_reservation: { type: 'string', format: 'date-time' },
                        etat: { type: 'string' },
                        prix_total: { type: 'number' },
                        etat_paiement: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Supprimer une réservation',
        tags: ['Réservations'],
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
            description: 'Réservation supprimée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservation supprimée avec succès' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reservations/{id}/cancel': {
      post: {
        summary: 'Annuler une réservation',
        tags: ['Réservations'],
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
            description: 'Réservation annulée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Réservation annulée avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id_reservation: { type: 'integer' },
                        etat: { type: 'string', example: 'annulee' }
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
  
  export default reservationRouteDoc;