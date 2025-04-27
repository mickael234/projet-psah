const authRouteDoc = {
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

export default authRouteDoc;