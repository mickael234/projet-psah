const documentChauffeurRouteDoc = {
    'api/documents': {
        post: {
            summary: "Téléverser ou mettre à jour les documents d'un chauffeur",
            tags: ['Documents Chauffeur'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['permis_url', 'piece_identite_url', 'date_expiration_permis'],
                            properties: {
                                permis_url: {
                                    type: 'string',
                                    example: 'https://example.com/permis.pdf',
                                    description: 'URL du permis de conduire'
                                },
                                piece_identite_url: {
                                    type: 'string',
                                    example: 'https://example.com/piece_identite.pdf',
                                    description: 'URL de la pièce d\'identité'
                                },
                                date_expiration_permis: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2025-12-31',
                                    description: 'Date d\'expiration du permis de conduire'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Documents téléversés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Documents téléversés avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            permis_url: { type: 'string', example: 'https://example.com/permis.pdf' },
                                            piece_identite_url: { type: 'string', example: 'https://example.com/piece_identite.pdf' },
                                            date_expiration_permis: { type: 'string', example: '2025-12-31' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Données invalides",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: 'Les documents sont incomplets ou invalides.' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Authentification requise",
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
                    description: "Erreur serveur",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERREUR INTERNE' },
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/documents/{id}/valider': {
        patch: {
            summary: "Valider ou rejeter les documents d'un chauffeur",
            tags: ['Documents Chauffeur'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du chauffeur'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['isValid'],
                            properties: {
                                isValid: {
                                    type: 'boolean',
                                    example: true,
                                    description: 'Statut de validation des documents'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Documents validés ou rejetés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Documents validés avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_personnel: { type: 'integer', example: 1 },
                                            permis_url: { type: 'string', example: 'https://example.com/permis.pdf' },
                                            piece_identite_url: { type: 'string', example: 'https://example.com/piece_identite.pdf' },
                                            date_expiration_permis: { type: 'string', example: '2025-12-31' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Données invalides",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: 'Statut de validation invalide.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Chauffeur non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Chauffeur introuvable.' }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erreur serveur",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERREUR INTERNE' },
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/documents/permis-expire': {
        get: {
            summary: "Récupérer les chauffeurs avec un permis expiré",
            tags: ['Documents Chauffeur'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Chauffeurs avec permis expiré récupérés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Chauffeurs avec permis expiré récupérés.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_personnel: { type: 'integer', example: 1 },
                                                nom: { type: 'string', example: 'Doe' },
                                                prenom: { type: 'string', example: 'John' },
                                                permis_expiration: { type: 'string', example: '2024-12-31' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Aucun chauffeur avec permis expiré trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Aucun chauffeur avec permis expiré trouvé.' }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erreur serveur",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERREUR INTERNE' },
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default documentChauffeurRouteDoc;
