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
    },
    '/api/reservations/actuelles/{clientId}': {
  get: {
    summary: 'Récupérer les réservations actuelles d\'un client',
    tags: ['Réservations'],
    parameters: [
      {
        in: 'path',
        name: 'clientId',
        required: true,
        schema: { type: 'integer' },
        description: 'ID du client pour récupérer ses réservations actuelles',
      },
    ],
    responses: {
      200: {
        description: 'Réservations récupérées avec succès',
        content: {
          'application/json': {
            example: {
              status: 'OK',
              data: {
                reservations: [
                  {
                    id_reservation: 1,
                    id_client: 1,
                    date_reservation: '2025-04-09T10:46:15.295Z',
                    etat: 'confirmee',
                    prix_total: '100',
                    etat_paiement: 'en_attente',
                    source_reservation: 'site_web',
                    id_reservation_externe: null,
                    supprime_le: null,
                    client: {
                      id_client: 1,
                      id_utilisateur: 1,
                      prenom: 'John',
                      nom: 'Doe',
                      telephone: '1234567890',
                      statut_membre: 'membre',
                      consentement_marketing: false,
                      supprime_le: null
                    },
                    chambres: [
                      {
                        id_reservation: 1,
                        id_chambre: 1,
                        date_arrivee: '2025-05-01T00:00:00.000Z',
                        date_depart: '2025-05-07T00:00:00.000Z',
                        chambre: {
                          id_chambre: 1,
                          numero_chambre: '101',
                          type_chambre: 'Simple',
                          prix_par_nuit: '75',
                          etat: 'disponible',
                          description: 'Chambre simple avec un lit simple et vue sur le jardin.'
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      400: {
        description: 'Id invalide',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'BAD REQUEST'
                        },
                        message: {
                            type: 'string',
                            example:
                                "L'id du client n'est pas valide."
                        }
                    }
                }
            }
        }
      },
      403: {
        description: 'Accès non autorisé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'FORBIDDEN' },
                message: { type: 'string', example: "Accès non autorisé" }
              }
            }
          }
        }
      },
      404: {
        description: 'Aucune réservation actuelle ou client trouvé',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'NOT FOUND'
                        },
                        message: {
                            type: 'string',
                            example:
                                "Aucune réservation actuelle n'a été trouvée"
                        }
                    }
                }
            }
        }
      },

      500: {
        description: 'Erreur serveur',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'INTERNAL SERVER ERROR'
                        },
                        message: {
                            type: 'string',
                            example:
                                'Une erreur interne est survenue.'
                        }
                    }
                }
            }
        }
      },
    }
  },
  '/api/reservations/passees/{clientId}': {
  get: {
    summary: 'Récupérer les réservations passées d\'un client',
    tags: ['Réservations'],
    parameters: [
      {
        in: 'path',
        name: 'clientId',
        required: true,
        schema: { type: 'integer' },
        description: 'ID du client pour récupérer ses réservations passées',
      },
    ],
    responses: {
      200: {
        description: 'Réservations passées récupérées avec succès',
        content: {
          'application/json': {
            example: {
              status: 'OK',
              data: {
                reservations: [
                  {
                    id_reservation: 1,
                    id_client: 1,
                    date_reservation: '2025-01-01T10:46:15.295Z',
                    etat: 'depart',
                    prix_total: '100',
                    etat_paiement: 'depart',
                    source_reservation: 'site_web',
                    id_reservation_externe: null,
                    supprime_le: null,
                    client: {
                      id_client: 1,
                      id_utilisateur: 1,
                      prenom: 'John',
                      nom: 'Doe',
                      telephone: '1234567890',
                      statut_membre: 'membre',
                      consentement_marketing: false,
                      supprime_le: null
                    },
                    chambres: [
                      {
                        id_reservation: 1,
                        id_chambre: 1,
                        date_arrivee: '2025-04-01T00:00:00.000Z',
                        date_depart: '2025-04-05T00:00:00.000Z',
                        chambre: {
                          id_chambre: 1,
                          numero_chambre: '101',
                          type_chambre: 'Simple',
                          prix_par_nuit: '75',
                          etat: 'disponible',
                          description: 'Chambre simple avec un lit simple et vue sur le jardin.'
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      400: {
        description: 'Id invalide',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'BAD REQUEST' },
                message: { type: 'string', example: "L'id du client n'est pas valide." }
              }
            }
          }
        }
      },
      403: {
        description: 'Accès non autorisé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'FORBIDDEN' },
                message: { type: 'string', example: "Accès non autorisé" }
              }
            }
          }
        }
      },
      404: {
        description: 'Aucune réservation passée ou client trouvé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'NOT FOUND' },
                message: { type: 'string', example: "Aucune réservation passée n'a été trouvée" }
              }
            }
          }
        }
      },
      500: {
        description: 'Erreur serveur',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'INTERNAL SERVER ERROR' },
                message: { type: 'string', example: 'Une erreur interne est survenue.' }
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