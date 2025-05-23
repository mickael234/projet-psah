const formationRouteDoc = {
    'api/formations': {
        get: {
            summary: "Récupérer toutes les formations",
            tags: ['Formations'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Formations récupérées avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Liste des formations récupérée avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_formation: { type: 'integer', example: 1 },
                                                nom: { type: 'string', example: 'Formation de sécurité' },
                                                description: { type: 'string', example: 'Formation sur la sécurité en entreprise.' },
                                                statut: { type: 'string', enum: ['active', 'inactive'], example: 'active' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Aucune formation trouvée",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Aucune formation trouvée.' }
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
        },
        post: {
            summary: "Créer une nouvelle formation",
            tags: ['Formations'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['nom', 'description', 'obligatoire'],
                            properties: {
                                nom: { 
                                    type: 'string', 
                                    example: 'Formation sécurité', 
                                    description: 'Nom de la formation' 
                                },
                                description: { 
                                    type: 'string', 
                                    example: 'Formation sur la sécurité au travail.', 
                                    description: 'Description détaillée de la formation' 
                                },
                                obligatoire: { 
                                    type: 'boolean', 
                                    example: true, 
                                    description: 'Indique si la formation est obligatoire ou non' 
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Formation créée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CREATED' },
                                    message: { type: 'string', example: 'Formation créée avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_formation: { type: 'integer', example: 1 },
                                            nom: { type: 'string', example: 'Formation sécurité' },
                                            description: { type: 'string', example: 'Formation sur la sécurité en entreprise.' },
                                            statut: { type: 'string', enum: ['active', 'inactive'], example: 'active' }
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
                                    message: { type: 'string', example: 'Le titre et le champ obligatoire sont requis.' }
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
    'api/formations/{id}/assigner/{chauffeurId}': {
        post: {
            summary: "Assigner une formation à un chauffeur",
            tags: ['Formations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de la formation'
                },
                {
                    in: 'path',
                    name: 'chauffeurId',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du chauffeur'
                }
            ],
            responses: {
                200: {
                    description: 'Formation assignée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Formation assignée avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_formation: { type: 'integer', example: 1 },
                                            id_chauffeur: { type: 'integer', example: 2 },
                                            statut: { type: 'string', example: 'assigned' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "ID invalide",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: 'Les ID de la formation ou du chauffeur sont invalides.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Formation ou chauffeur non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Formation ou chauffeur introuvable.' }
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
    'api/formations/{id}/completer/{chauffeurId}': {
        patch: {
            summary: "Marquer une formation comme complétée pour un chauffeur",
            tags: ['Formations'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de la formation'
                },
                {
                    in: 'path',
                    name: 'chauffeurId',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du chauffeur'
                }
            ],
            responses: {
                200: {
                    description: 'Formation marquée comme complétée',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Formation marquée comme complétée.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_formation: { type: 'integer', example: 1 },
                                            id_chauffeur: { type: 'integer', example: 2 },
                                            statut: { type: 'string', example: 'completed' }
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
                                    message: { type: 'string', example: 'Les ID de la formation ou du chauffeur sont invalides.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Formation ou chauffeur non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Formation ou chauffeur introuvable.' }
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

export default formationRouteDoc;
