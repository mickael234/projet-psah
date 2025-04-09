export const authRouteDoc = {
    '/api/auth/register': {
        post: {
            summary: 'Enregistrer un nouvel utilisateur',
            tags: ['Authentification'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['fullName', 'email', 'password', 'role'],
                            properties: {
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                                password: { type: 'string' },
                                role: {
                                    type: 'string',
                                    enum: [
                                        'SUPER_ADMIN',
                                        'ADMIN_GENERAL',
                                        'RESPONSABLE_HEBERGEMENT',
                                        'RECEPTIONNISTE',
                                        'PROPRIETAIRE',
                                        'MAINTENANCE',
                                        'CLIENT',
                                        'CHAUFFEUR',
                                        'COMPTABILITE'
                                    ]
                                },
                                phoneNumber: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Utilisateur créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: {
                                        type: 'string',
                                        example: 'Utilisateur créé avec succès'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            userId: { type: 'integer' },
                                            createdAt: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Données invalides ou rôle inexistant',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'ERROR'
                                    },
                                    message: {
                                        type: 'string',
                                        example:
                                            "Cet email est déjà utilisé ou le rôle spécifié n'existe pas"
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
                                        example: 'ERROR'
                                    },
                                    message: {
                                        type: 'string',
                                        example: "Erreur lors de l'inscription"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/login': {
        post: {
            summary: 'Connecter un utilisateur',
            tags: ['Authentification'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password'],
                            properties: {
                                email: { type: 'string' },
                                password: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Connexion réussie',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: {
                                        type: 'string',
                                        example: 'Connexion réussie'
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            token: { type: 'string' },
                                            userId: { type: 'integer' },
                                            lastLogin: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Email ou mot de passe incorrect',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'ERROR'
                                    },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Email ou mot de passe incorrect'
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
                                        example: 'ERROR'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Erreur lors de la connexion'
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

export const roomRouteDoc = {
    '/rooms/{id}': {
        get: {
            summary: "Voir les détails d'une chambre",
            tags: ['Rooms'],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'Id de la chambre'
                }
            ],
            responses: {
                200: {
                    description: 'Chambre trouvée',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    data: {
                                        type: 'object',
                                        example: {
                                            room: {
                                                id: 11,
                                                number: '102',
                                                type: 'Standard',
                                                pricePerNight: 99,
                                                status: 'available',
                                                description:
                                                    'Brief example description',
                                                media: [
                                                    {
                                                        id: 78,
                                                        roomId: 11,
                                                        type: 'image',
                                                        url: 'some url',
                                                        title: 'Image 1',
                                                        description:
                                                            'Description media 1'
                                                    }
                                                ],
                                                amenities: [
                                                    {
                                                        roomId: 11,
                                                        amenityId: 22,
                                                        amenity: {
                                                            id: 22,
                                                            name: 'Air conditioning'
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
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
                                            "L'id de la chambre n'est valide."
                                    }
                                }
                            }
                        }
                    }
                },

                404: {
                    description: 'Chambre non trouvée',
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
                                            "Aucune chambre n'a été trouvée."
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
                }
            }
        }
    }
};
