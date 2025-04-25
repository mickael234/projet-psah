// src/docs/hebergementRouteDoc.js
const hebergementRouteDoc = {
  '/api/hebergements/': {
    get: {
      summary: 'Récupérer tous les hébergements',
      tags: ['Hébergements'],
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
          name: 'type_chambre',
          schema: { type: 'string' },
          description: 'Type de chambre'
        },
        {
          in: 'query',
          name: 'prix_min',
          schema: { type: 'number' },
          description: 'Prix minimum par nuit'
        },
        {
          in: 'query',
          name: 'prix_max',
          schema: { type: 'number' },
          description: 'Prix maximum par nuit'
        },
        {
          in: 'query',
          name: 'ville',
          schema: { type: 'string' },
          description: 'Ville'
        },
        {
          in: 'query',
          name: 'sort',
          schema: { type: 'string', enum: ['prix_asc', 'prix_desc'] },
          description: 'Tri par prix'
        }
      ],
      responses: {
        200: {
          description: 'Liste des hébergements',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergements récupérés avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id_chambre: { type: 'integer' },
                            numero_chambre: { type: 'string' },
                            type_chambre: { type: 'string' },
                            prix_par_nuit: { type: 'number' },
                            etat: { type: 'string' },
                            description: { type: 'string' }
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
        },
        500: {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la récupération des hébergements' }
                }
              }
            }
          }
        }
      }
    },
    post: {
      summary: 'Créer un nouvel hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['numero_chambre', 'type_chambre', 'prix_par_nuit'],
              properties: {
                numero_chambre: { type: 'string' },
                type_chambre: { type: 'string' },
                prix_par_nuit: { type: 'number' },
                etat: { type: 'string', enum: ['disponible', 'occupee', 'maintenance'] },
                description: { type: 'string' },
                equipements: { 
                  type: 'array',
                  items: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Hébergement créé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergement créé avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      id_chambre: { type: 'integer' },
                      numero_chambre: { type: 'string' },
                      type_chambre: { type: 'string' },
                      prix_par_nuit: { type: 'number' },
                      etat: { type: 'string' },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Numéro de chambre, type et prix par nuit sont requis' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour créer un hébergement' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la création de l\'hébergement' }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/hebergements/{id}/disponibilite": {
    put: {
      summary: "Mettre à jour le status d'un hebergement",
      tags: ["Hébergements"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID de l'hébergement",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["etat"],
              properties: {
                etat: {
                  type: "string",
                  enum: ["disponible", "occupee", "maintenance"],
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "mise à jour etat hébergement avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "Requête réussie" },
                  message: {
                    type: "string",
                    example: "Etat de l'Hébergement mis à jour avec succès",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/hebergements/{id}/tarifs": {
    put: {
      summary: "Mettre à jour le prix par nuit  d'un hébergment",
      tags: ["Hébergements"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "integer" },
          description: "ID de l'hébergement",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["prix_par_nuit"],
              properties: {
                prix_par_nuit: { type: "number" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description:
            "mise à jour du prix par nuit d 'un hébergement avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "Requête réussie" },
                  message: {
                    type: "string",
                    example:
                      "prix par nuit de l'Hébergement mis à jour avec succès",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/hebergements/search': {
    get: {
      summary: 'Rechercher des hébergements disponibles',
      tags: ['Hébergements'],
      parameters: [
        {
          in: 'query',
          name: 'dateArrivee',
          required: true,
          schema: { type: 'string', format: 'date' },
          description: 'Date d\'arrivée (YYYY-MM-DD)'
        },
        {
          in: 'query',
          name: 'dateDepart',
          required: true,
          schema: { type: 'string', format: 'date' },
          description: 'Date de départ (YYYY-MM-DD)'
        },
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
          name: 'type_chambre',
          schema: { type: 'string' },
          description: 'Type de chambre'
        },
        {
          in: 'query',
          name: 'prix_min',
          schema: { type: 'number' },
          description: 'Prix minimum par nuit'
        },
        {
          in: 'query',
          name: 'prix_max',
          schema: { type: 'number' },
          description: 'Prix maximum par nuit'
        },
        {
          in: 'query',
          name: 'ville',
          schema: { type: 'string' },
          description: 'Ville'
        },
        {
          in: 'query',
          name: 'sort',
          schema: { type: 'string', enum: ['prix_asc', 'prix_desc'] },
          description: 'Tri par prix'
        }
      ],
      responses: {
        200: {
          description: 'Liste des hébergements disponibles',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergements disponibles récupérés avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id_chambre: { type: 'integer' },
                            numero_chambre: { type: 'string' },
                            type_chambre: { type: 'string' },
                            prix_par_nuit: { type: 'number' },
                            etat: { type: 'string' },
                            description: { type: 'string' }
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
        },
        400: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Les dates d\'arrivée et de départ sont requises' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la recherche d\'hébergements disponibles' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/hebergements/{id}': {
    get: {
      summary: 'Récupérer un hébergement par son ID',
      tags: ['Hébergements'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        }
      ],
      responses: {
        200: {
          description: 'Hébergement récupéré avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergement récupéré avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      id_chambre: { type: 'integer' },
                      numero_chambre: { type: 'string' },
                      type_chambre: { type: 'string' },
                      prix_par_nuit: { type: 'number' },
                      etat: { type: 'string' },
                      description: { type: 'string' },
                      medias: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id_media: { type: 'integer' },
                            type_media: { type: 'string' },
                            url: { type: 'string' },
                            titre: { type: 'string' },
                            description: { type: 'string' }
                          }
                        }
                      },
                      equipements: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            equipement: {
                              type: 'object',
                              properties: {
                                id_equipement: { type: 'integer' },
                                nom: { type: 'string' }
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
        400: {
          description: 'ID invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'ID d\'hébergement invalide' }
                }
              }
            }
          }
        },
        404: {
          description: 'Hébergement non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Hébergement non trouvé' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la récupération de l\'hébergement' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      summary: 'Mettre à jour un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                numero_chambre: { type: 'string' },
                type_chambre: { type: 'string' },
                prix_par_nuit: { type: 'number' },
                etat: { type: 'string', enum: ['disponible', 'occupee', 'maintenance'] },
                description: { type: 'string' },
                equipements: { 
                  type: 'array',
                  items: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Hébergement mis à jour avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergement mis à jour avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      id_chambre: { type: 'integer' },
                      numero_chambre: { type: 'string' },
                      type_chambre: { type: 'string' },
                      prix_par_nuit: { type: 'number' },
                      etat: { type: 'string' },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'ID invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'ID d\'hébergement invalide' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour modifier un hébergement' }
                }
              }
            }
          }
        },
        404: {
          description: 'Hébergement non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Hébergement non trouvé' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la mise à jour de l\'hébergement' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      summary: 'Supprimer un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        }
      ],
      responses: {
        200: {
          description: 'Hébergement supprimé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Hébergement supprimé avec succès' }
                }
              }
            }
          }
        },
        400: {
          description: 'ID invalide ou hébergement avec réservations',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'ID d\'hébergement invalide ou impossible de supprimer un hébergement avec des réservations futures' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour supprimer un hébergement' }
                }
              }
            }
          }
        },
        404: {
          description: 'Hébergement non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Hébergement non trouvé' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la suppression de l\'hébergement' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/hebergements/{id}/availability': {
    get: {
      summary: 'Vérifier la disponibilité d\'un hébergement',
      tags: ['Hébergements'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        },
        {
          in: 'query',
          name: 'dateArrivee',
          required: true,
          schema: { type: 'string', format: 'date' },
          description: 'Date d\'arrivée (YYYY-MM-DD)'
        },
        {
          in: 'query',
          name: 'dateDepart',
          required: true,
          schema: { type: 'string', format: 'date' },
          description: 'Date de départ (YYYY-MM-DD)'
        }
      ],
      responses: {
        200: {
          description: 'Disponibilité vérifiée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Disponibilité vérifiée avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      isAvailable: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'ID d\'hébergement invalide ou dates manquantes' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la vérification de la disponibilité' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/hebergements/{id}/media': {
    post: {
      summary: 'Ajouter un média à un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['type_media', 'media'],
              properties: {
                type_media: { 
                  type: 'string',
                  enum: ['image', 'video', 'visite_360', 'apercu_ar']
                },
                media: { 
                  type: 'string',
                  format: 'binary'
                },
                titre: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Média ajouté avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Média ajouté avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      id_media: { type: 'integer' },
                      id_chambre: { type: 'integer' },
                      type_media: { type: 'string' },
                      url: { type: 'string' },
                      titre: { type: 'string' },
                      description: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'URL et type de média sont requis' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour ajouter un média' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de l\'ajout du média' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/hebergements/{id}/media/{mediaId}': {
    delete: {
      summary: 'Supprimer un média d\'un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        },
        {
          in: 'path',
          name: 'mediaId',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du média'
        }
      ],
      responses: {
        200: {
          description: 'Média supprimé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Média supprimé avec succès' }
                }
              }
            }
          }
        },
        400: {
          description: 'IDs invalides',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'IDs invalides' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour supprimer un média' }
                }
              }
            }
          }
        },
        404: {
          description: 'Média non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Média non trouvé' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la suppression du média' }
                }
              }
            }
          }
        }
      }
    }
  },
  // Nouvelles routes pour la gestion des équipements
  '/api/hebergements/{id}/equipements': {
    post: {
      summary: 'Ajouter un équipement à un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['idEquipement'],
              properties: {
                idEquipement: { type: 'integer', description: 'ID de l\'équipement à ajouter' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Équipement ajouté avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Équipement ajouté avec succès' },
                  data: {
                    type: 'object',
                    properties: {
                      id_chambre: { type: 'integer' },
                      id_equipement: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Requête invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'IDs invalides ou cet équipement est déjà associé à cette chambre' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour ajouter un équipement à un hébergement' }
                }
              }
            }
          }
        },
        404: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                  message: { type: 'string', example: 'Hébergement ou équipement non trouvé' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de l\'ajout de l\'équipement' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/hebergements/{id}/equipements/{equipementId}': {
    delete: {
      summary: 'Supprimer un équipement d\'un hébergement',
      tags: ['Hébergements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'hébergement'
        },
        {
          in: 'path',
          name: 'equipementId',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de l\'équipement'
        }
      ],
      responses: {
        200: {
          description: 'Équipement supprimé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Équipement supprimé avec succès' }
                }
              }
            }
          }
        },
        400: {
          description: 'IDs invalides',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'IDs invalides' }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour supprimer un équipement d\'un hébergement' }
                }
              }
            }
          }
        },
        404: {
          description: 'Relation non trouvée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Cet équipement n\'est pas associé à cette chambre' }
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
                  status: { type: 'string', example: 'ERROR' },
                  message: { type: 'string', example: 'Erreur lors de la suppression de l\'équipement' }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default hebergementRouteDoc;