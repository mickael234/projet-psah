const rapportFinancierRouteDoc = {
    '/api/paiements/financiers': {
      get: {
        summary: 'Générer un rapport financier',
        description: 'Génère un rapport financier selon la période demandée',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'debut',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de début de la période (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'fin',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de fin de la période (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Rapport financier généré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
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
                          total_echeances: { type: 'integer' },
                          notes: { type: 'string' }
                        }
                      }
                    },
                    totalMontant: { type: 'number' }
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
                    message: { type: 'string', example: 'Les dates pour déterminer la période sont requises.' }
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
                    status: { type: 'string', example: 'FORBIDDEN' },
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour consulter les paiements' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Aucune transaction trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune transaction n\'a été trouvée pour la période spécifiée' }
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
                    status: { type: 'string', example: 'ERREUR INTERNE' },
                    message: { type: 'string', example: 'Une erreur est survenue lors de la génération du rapport financier.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/paiements/financiers/export': {
      get: {
        summary: 'Exporter un rapport financier en PDF',
        description: 'Génère et télécharge un rapport financier au format PDF selon la période demandée',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'debut',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de début de la période (YYYY-MM-DD)'
          },
          {
            in: 'query',
            name: 'fin',
            required: true,
            schema: { type: 'string', format: 'date' },
            description: 'Date de fin de la période (YYYY-MM-DD)'
          }
        ],
        responses: {
          200: {
            description: 'Rapport financier en PDF généré avec succès',
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
                    message: { type: 'string', example: 'Les dates de début et de fin sont requises.' }
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
                    status: { type: 'string', example: 'FORBIDDEN' },
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour consulter les paiements' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Aucune transaction trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                    message: { type: 'string', example: 'Aucune transaction n\'a été trouvée pour la période spécifiée' }
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
                    status: { type: 'string', example: 'ERREUR INTERNE' },
                    message: { type: 'string', example: 'Une erreur est survenue lors de la génération du rapport financier au format PDF.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/paiements/revenus': {
      get: {
        summary: 'Obtenir le revenu total',
        description: 'Récupère le montant total des revenus générés',
        tags: ['Paiements'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Revenu total récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    data: {
                      type: 'object',
                      properties: {
                        revenuTotal: { type: 'number', example: 12500.50 }
                      }
                    }
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
                    status: { type: 'string', example: 'FORBIDDEN' },
                    message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires pour consulter les paiements' }
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
                    status: { type: 'string', example: 'ERREUR INTERNE' },
                    message: { type: 'string', example: 'Une erreur est survenue lors du calcul du revenu total.' }
                  }
                }
              }
            }
          }
        }
      }
    }
};
  
export default rapportFinancierRouteDoc;