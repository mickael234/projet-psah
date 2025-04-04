// src/docs/profileRouteDoc.js
const profileRouteDoc = {
    '/api/profile': {
      get: {
        summary: 'Récupérer le profil de l\'utilisateur connecté',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Profil récupéré avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        fullName: { type: 'string' },
                        email: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        profilePhoto: { type: 'string' },
                        role: { 
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' }
                          }
                        },
                        billingInfo: {
                          type: 'object',
                          properties: {
                            address: { type: 'string' },
                            city: { type: 'string' },
                            postalCode: { type: 'string' },
                            country: { type: 'string' },
                            billingName: { type: 'string' },
                            vatNumber: { type: 'string' }
                          }
                        },
                        twoFactorEnabled: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ERROR' },
                    message: { type: 'string', example: 'Authentification requise' }
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
                    message: { type: 'string', example: 'Erreur lors de la récupération du profil' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Mettre à jour le profil de l\'utilisateur connecté',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  phoneNumber: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profil mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Profil mis à jour avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        userId: { type: 'integer' },
                        fullName: { type: 'string' },
                        email: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        updatedAt: { type: 'string', format: 'date-time' }
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
    '/api/profile/photo': {
      post: {
        summary: 'Mettre à jour la photo de profil',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  photo: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Photo de profil mise à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Photo de profil mise à jour avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        profilePhoto: { type: 'string' }
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
    '/api/profile/billing': {
      put: {
        summary: 'Mettre à jour les informations de facturation',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['address', 'city', 'postalCode', 'country'],
                properties: {
                  address: { type: 'string' },
                  city: { type: 'string' },
                  postalCode: { type: 'string' },
                  country: { type: 'string' },
                  billingName: { type: 'string' },
                  vatNumber: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Informations de facturation mises à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Informations de facturation mises à jour avec succès' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        postalCode: { type: 'string' },
                        country: { type: 'string' },
                        billingName: { type: 'string' },
                        vatNumber: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
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
    '/api/profile/2fa/setup': {
      post: {
        summary: 'Configurer l\'authentification à deux facteurs',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Configuration de l\'authentification à deux facteurs initiée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Configuration de l\'authentification à deux facteurs initiée' },
                    data: {
                      type: 'object',
                      properties: {
                        qrCode: { type: 'string' },
                        secret: { type: 'string' }
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
    '/api/profile/2fa/verify': {
      post: {
        summary: 'Vérifier et activer l\'authentification à deux facteurs',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentification à deux facteurs activée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Authentification à deux facteurs activée avec succès' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/profile/2fa/disable': {
      post: {
        summary: 'Désactiver l\'authentification à deux facteurs',
        tags: ['Profil'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentification à deux facteurs désactivée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Authentification à deux facteurs désactivée avec succès' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  export default profileRouteDoc;