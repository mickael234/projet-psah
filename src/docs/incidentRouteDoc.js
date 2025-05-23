const incidentRouteDoc = {
    'api/incidents': {
        post: {
            summary: "Signaler un incident",
            tags: ['Incidents'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['type'],
                            properties: {
                                type: { 
                                    type: 'string', 
                                    enum: ['accident', 'agression', 'panne', 'autre'],
                                    example: 'accident',
                                    description: 'Type de l\'incident'
                                },
                                description: { 
                                    type: 'string', 
                                    example: 'Incident survenu à l\'intersection.',
                                    description: 'Description de l\'incident'
                                },
                                id_trajet: { 
                                    type: 'integer',
                                    example: 1,
                                    description: 'ID du trajet concerné (facultatif)'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Incident signalé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CREATED' },
                                    message: { type: 'string', example: 'Incident signalé avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_incident: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'accident' },
                                            description: { type: 'string', example: 'Incident survenu à l\'intersection.' },
                                            id_trajet: { type: 'integer', example: 1 }
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
                                    message: { type: 'string', example: 'Les données sont incomplètes ou invalides.' }
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
    'api/incidents/trajet/{id}': {
        get: {
            summary: "Récupérer les incidents d'un trajet",
            tags: ['Incidents'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du trajet'
                }
            ],
            responses: {
                200: {
                    description: 'Incidents récupérés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Incidents récupérés avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_incident: { type: 'integer', example: 1 },
                                                type: { type: 'string', example: 'accident' },
                                                description: { type: 'string', example: 'Incident survenu à l\'intersection.' },
                                                id_trajet: { type: 'integer', example: 1 }
                                            }
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
                                    message: { type: 'string', example: 'L\'ID du trajet est invalide.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Aucun incident trouvé pour ce trajet",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Aucun incident trouvé pour ce trajet.' }
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
    'api/incidents/{id}': {
        get: {
            summary: "Récupérer un incident par son ID",
            tags: ['Incidents'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de l\'incident'
                }
            ],
            responses: {
                200: {
                    description: 'Incident récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Incident récupéré avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_incident: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'accident' },
                                            description: { type: 'string', example: 'Incident survenu à l\'intersection.' },
                                            id_trajet: { type: 'integer', example: 1 }
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
                                    message: { type: 'string', example: 'L\'ID de l\'incident est invalide.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Incident non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Incident introuvable.' }
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
    'api/incidents/{id}/traite': {
        patch: {
            summary: "Marquer un incident comme traité",
            tags: ['Incidents'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de l\'incident'
                }
            ],
            responses: {
                200: {
                    description: 'Incident marqué comme traité',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Incident marqué comme traité.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_incident: { type: 'integer', example: 1 },
                                            statut: { type: 'string', example: 'traite' }
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
                                    message: { type: 'string', example: 'L\'ID de l\'incident est invalide.' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Incident non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Incident introuvable.' }
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

export default incidentRouteDoc;
