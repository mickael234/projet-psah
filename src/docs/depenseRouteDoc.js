const depenseRouteDoc = {
    '/api/depenses/': {
      get: {
        summary: 'Récupérer toutes les dépenses',
        description: 'Permet de récupérer la liste des dépenses avec options de filtrage, tri et pagination. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
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
            name: 'categorie',
            schema: { 
              type: 'string', 
              enum: ['maintenance', 'personnel', 'services', 'transport', 'communication', 'logiciel', 'marketing', 'admin', 'equipement', 'autre'] 
            },
            description: 'Catégorie de dépense'
          },
          {
            in: 'query',
            name: 'utilisateurId',
            schema: { type: 'integer' },
            description: 'ID de l\'utilisateur qui a créé la dépense'
          },
          {
            in: 'query',
            name: 'dateMin',
            schema: { type: 'string', format: 'date' },
            description: 'Date minimum de création (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'dateMax',
            schema: { type: 'string', format: 'date' },
            description: 'Date maximum de création (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'sortBy',
            schema: { 
              type: 'string', 
              enum: ['maintenance', 'personnel', 'services', 'transport', 'communication', 'logiciel', 'marketing', 'admin', 'equipement', 'autre'] 
            },
            description: 'Champ sur lequel trier'
          },
          {
            in: 'query',
            name: 'sortOrder',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Ordre de tri (ascendant ou descendant)'
          }
        ],
        responses: {
          200: {
            description: 'Liste des dépenses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        totalItems: { type: 'integer', example: 42 },
                        appliedFilters: {
                          type: 'object',
                          properties: {
                            categorie: { type: 'string', example: 'maintenance' },
                            utilisateurId: { type: 'integer', example: 1 },
                            dateMin: { type: 'string', example: '2023-01-01' },
                            dateMax: { type: 'string', example: '2023-12-31' },
                            sortBy: { type: 'string', example: 'date_creation' },
                            sortOrder: { type: 'string', example: 'desc' }
                          }
                        }
                      }
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id_depense: { type: 'integer' },
                          id_utilisateur: { type: 'integer' },
                          description: { type: 'string' },
                          montant: { type: 'number' },
                          categorie: { type: 'string' },
                          date_creation: { type: 'string', format: 'date-time' },
                          date_modification: { type: 'string', format: 'date-time' },
                          date_suppression: { type: 'string', format: 'date-time' },
                          utilisateur: {
                            type: 'object',
                            properties: {
                              nom_utilisateur: { type: 'string' }
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
            description: 'Requête invalide',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Le numéro de page est invalide. Il doit être un nombre positif.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour accéder aux dépenses' }
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
                    message: { type: 'string', example: 'Aucune dépense avec les filtres n\'a été trouvée.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la récupération des dépenses.' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Créer une nouvelle dépense',
        description: 'Permet de créer une nouvelle dépense dans le système. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_utilisateur', 'montant', 'categorie'],
                properties: {
                  id_utilisateur: { 
                    type: 'integer',
                    description: 'ID de l\'utilisateur qui a effectué la dépense'
                  },
                  description: { 
                    type: 'string',
                    description: 'Description détaillée de la dépense'
                  },
                  montant: { 
                    type: 'number',
                    format: 'decimal',
                    description: 'Montant de la dépense (valeur positive)'
                  },
                  categorie: { 
                    type: 'string', 
                    enum: ['maintenance', 'personnel', 'services', 'transport', 'communication', 'logiciel', 'marketing', 'admin', 'equipement', 'autre'],
                    description: 'Catégorie de la dépense'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Dépense créée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Les données de la requête ne sont pas valides.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour créer une dépense' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la création d\'une dépense' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Catégorie invalide ou manquante.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour modifier cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la mise à jour de la catégorie.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/restaurer/{id}': {
      patch: {
        summary: 'Restaurer une dépense supprimée',
        description: 'Permet de restaurer une dépense qui a été précédemment supprimée de façon logique (soft delete). Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la dépense'
          }
        ],
        responses: {
          200: {
            description: 'Dépense restaurée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'ID de dépense invalide.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour restaurer cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la restauration de la dépense.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/supprimer/{id}': {
      patch: {
        summary: 'Supprimer une dépense de façon logique (soft delete)',
        description: 'Permet de supprimer une dépense de façon logique en définissant sa date de suppression. La dépense n\'est pas physiquement supprimée de la base de données. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la dépense'
          }
        ],
        responses: {
          200: {
            description: 'Dépense supprimée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Dépense supprimée avec succès.' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'ID de dépense invalide.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour supprimer cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la suppression de la dépense.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/rapport': {
      get: {
        summary: 'Récupérer les données financières pour une période spécifique',
        description: 'Permet d\'obtenir un rapport financier complet incluant les revenus, dépenses et autres statistiques financières pour une période donnée. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'dateDebut',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de début de la période (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'dateFin',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de fin de la période (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Données financières récupérées avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    periode: {
                      type: 'object',
                      properties: {
                        debut: { type: 'string', format: 'date', example: '2023-01-01' },
                        fin: { type: 'string', format: 'date', example: '2023-12-31' },
                        duree: { type: 'string', example: '365 jours' }
                      }
                    },
                    data: {
                      type: 'object',
                      properties: {
                        resume: {
                          type: 'object',
                          properties: {
                            totalRevenus: { type: 'number', example: 10000 },
                            totalDepenses: { type: 'number', example: 5000 },
                            solde: { type: 'number', example: 5000 },
                            depensesParCategorie: {
                              type: 'object',
                              additionalProperties: { type: 'number' },
                              example: {
                                "maintenance": 1000,
                                "personnel": 2000,
                                "services": 1000,
                                "autre": 1000
                              }
                            },
                            paiementsParMethode: {
                              type: 'object',
                              additionalProperties: { type: 'number' },
                              example: {
                                "carte": 6000,
                                "virement": 4000
                              }
                            }
                          }
                        },
                        details: {
                          type: 'object',
                          properties: {
                            paiements: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id_paiement: { type: 'integer' },
                                  id_reservation: { type: 'integer' },
                                  montant: { type: 'number' },
                                  methode_paiement: { type: 'string' },
                                  etat: { type: 'string' },
                                  date_transaction: { type: 'string', format: 'date-time' },
                                  reservation: {
                                    type: 'object',
                                    properties: {
                                      id_reservation: { type: 'integer' },
                                      client: {
                                        type: 'object',
                                        properties: {
                                          nom: { type: 'string' },
                                          prenom: { type: 'string' }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            depenses: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id_depense: { type: 'integer' },
                                  id_utilisateur: { type: 'integer' },
                                  description: { type: 'string' },
                                  montant: { type: 'number' },
                                  categorie: { type: 'string' },
                                  date_creation: { type: 'string', format: 'date-time' },
                                  date_modification: { type: 'string', format: 'date-time' },
                                  utilisateur: {
                                    type: 'object',
                                    properties: {
                                      nom_utilisateur: { type: 'string' }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        periode: {
                          type: 'object',
                          properties: {
                            dateDebut: { type: 'string', format: 'date' },
                            dateFin: { type: 'string', format: 'date' },
                            nbJours: { type: 'integer' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Les dates de début et de fin sont requises et doivent être valides' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour accéder aux données financières' }
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
                    message: { type: 'string', example: 'Aucune transaction n\'a été trouvée pendant cette période.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la récupération des données financières.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/rapport/export': {
      get: {
        summary: 'Générer un rapport financier PDF pour une période spécifique',
        description: 'Génère et télécharge un rapport financier au format PDF pour une période spécifiée. Le rapport inclut les revenus, dépenses et autres indicateurs financiers. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'dateDebut',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de début de la période (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'dateFin',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de fin de la période (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Rapport PDF généré avec succès',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Les dates de début et de fin sont requises et doivent être valides' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour générer un rapport financier' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la génération du rapport financier.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/{id}': {
      get: {
        summary: 'Récupérer une dépense par son ID',
        description: 'Permet d\'obtenir les détails d\'une dépense spécifique à partir de son identifiant unique. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la dépense'
          }
        ],
        responses: {
          200: {
            description: 'Dépense récupérée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'L\'ID de la dépense est invalide.' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée.' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la récupération de la dépense.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/description/{id}': {
      patch: {
        summary: 'Mettre à jour la description d\'une dépense',
        description: 'Permet de modifier uniquement la description d\'une dépense existante. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la dépense'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description'],
                properties: {
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Description mise à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Description invalide ou manquante' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour modifier cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la mise à jour de la description de la dépense.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/prix/{id}': {
      patch: {
        summary: 'Mettre à jour le montant d\'une dépense',
        description: 'Permet de modifier uniquement le montant d\'une dépense existante. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
        tags: ['Dépenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la dépense'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['montant'],
                properties: {
                  montant: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Montant mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        id_depense: { type: 'integer' },
                        id_utilisateur: { type: 'integer' },
                        description: { type: 'string' },
                        montant: { type: 'number' },
                        categorie: { type: 'string' },
                        date_creation: { type: 'string', format: 'date-time' },
                        date_modification: { type: 'string', format: 'date-time' },
                        date_suppression: { type: 'string', format: 'date-time' }
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
                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                    message: { type: 'string', example: 'Montant invalide ou manquant' }
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
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour modifier cette dépense' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Dépense non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune dépense avec cet ID n\'a été trouvée' }
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
                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                    message: { type: 'string', example: 'Erreur lors de la mise à jour du montant' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/depenses/categorie/{id}': {
        patch: {
            summary: 'Mettre à jour la catégorie d\'une dépense',
            description: 'Permet de modifier uniquement la catégorie d\'une dépense existante. Accessible aux rôles COMPTABILITE, SUPER_ADMIN et ADMIN_GENERAL.',
            tags: ['Dépenses'],
            security: [{ bearerAuth: [] }],
            parameters: [
            {
                in: 'path',
                name: 'id',
                required: true,
                schema: { type: 'integer' },
                description: 'ID de la dépense'
            }
            ],
            requestBody: {
            required: true,
            content: {
                'application/json': {
                schema: {
                    type: 'object',
                    required: ['categorie'],
                    properties: {
                    categorie: { 
                        type: 'string', 
                        enum: ['maintenance', 'personnel', 'services', 'transport', 'communication', 'logiciel', 'marketing', 'admin', 'equipement', 'autre'] 
                    }
                    }
                }
                }
            }
            },
            responses: {
                200: {
                    description: 'Catégorie mise à jour avec succès',
                    content: {
                    'application/json': {
                        schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'OK' },
                            data: {
                            type: 'object',
                            properties: {
                                id_depense: { type: 'integer' },
                                id_utilisateur: { type: 'integer' },
                                description: { type: 'string' },
                                montant: { type: 'number' },
                                categorie: { type: 'string' },
                                date_creation: { type: 'string', format: 'date-time' },
                                date_modification: { type: 'string', format: 'date-time' },
                                date_suppression: { type: 'string', format: 'date-time' }
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
export default depenseRouteDoc;