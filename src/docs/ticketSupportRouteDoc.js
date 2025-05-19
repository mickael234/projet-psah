const ticketSupportRouteDoc = {
    'api/tickets/my': {
        get: {
            summary: "Récupérer les tickets du client connecté",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Liste des tickets du client connecté',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Tickets récupérés avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer', example: 1 },
                                                type: { type: 'string', example: 'technique' },
                                                statut: { type: 'string', example: 'ouvert' },
                                                date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                                clientId: { type: 'integer', example: 42 },
                                                personnelId: { type: 'integer', example: 5, nullable: true }
                                            }
                                        }
                                    }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé, rôle client requis",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé: vous n'êtes pas un client." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Aucun ticket trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun ticket n'a été trouvé pour ce client." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/tickets/{id}': {
        get: {
            summary: "Récupérer un ticket par son ID",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du ticket'
                }
            ],
            responses: {
                200: {
                    description: 'Ticket récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Ticket récupéré avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'technique' },
                                            statut: { type: 'string', example: 'ouvert' },
                                            date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                            clientId: { type: 'integer', example: 42 },
                                            personnelId: { type: 'integer', example: 5, nullable: true }
                                        }
                                    }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Vous n'avez pas accès à ce ticket." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Ticket non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Le ticket demandé n'existe pas." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/tickets': {
        get: {
            summary: "Lister tous les tickets (avec filtres optionnels)",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'type',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['technique', 'commercial', 'autre']
                    },
                    description: 'Filtrer par type de ticket'
                },
                {
                    in: 'query',
                    name: 'statut',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['ouvert', 'en_cours', 'résolu', 'fermé']
                    },
                    description: 'Filtrer par statut de ticket'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des tickets',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Tickets récupérés avec succès' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer', example: 1 },
                                                type: { type: 'string', example: 'technique' },
                                                statut: { type: 'string', example: 'ouvert' },
                                                date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                                clientId: { type: 'integer', example: 42 },
                                                personnelId: { type: 'integer', example: 5, nullable: true }
                                            }
                                        }
                                    }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé, rôle insuffisant",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé: rôle insuffisant." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Aucun ticket trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun ticket n'a été trouvé." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/tickets/{id}/assign': {
        patch: {
            summary: "S'assigner un ticket (pour les réceptionnistes)",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du ticket à s\'assigner'
                }
            ],
            responses: {
                200: {
                    description: 'Ticket assigné avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Ticket assigné avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'technique' },
                                            statut: { type: 'string', example: 'en_cours' },
                                            date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                            clientId: { type: 'integer', example: 42 },
                                            personnelId: { type: 'integer', example: 5 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'ID de ticket invalide',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'ID du ticket est invalide." }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé, rôle insuffisant",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé: vous n'êtes pas autorisé à assigner des tickets." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Ticket non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Le ticket spécifié n'existe pas." }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: 'Ticket déjà assigné',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CONFLIT' },
                                    message: { type: 'string', example: "Ce ticket est déjà assigné à un membre du personnel." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/tickets/{id}/status': {
        patch: {
            summary: "Modifier le statut d'un ticket",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du ticket'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['statut'],
                            properties: {
                                statut: { 
                                    type: 'string', 
                                    enum: ['ouvert', 'en_cours', 'résolu', 'fermé'],
                                    example: 'résolu' 
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Statut du ticket mis à jour avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Ticket mis à jour avec le statut : résolu' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'technique' },
                                            statut: { type: 'string', example: 'résolu' },
                                            date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                            clientId: { type: 'integer', example: 42 },
                                            personnelId: { type: 'integer', example: 5 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "Le statut fourni n'est pas valide." }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé, rôle insuffisant",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé: vous n'êtes pas autorisé à modifier le statut des tickets." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Ticket non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Le ticket spécifié n'existe pas." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/tickets/{id}/reassign': {
        patch: {
            summary: "Réassigner un ticket à un autre réceptionniste",
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du ticket'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['personnelId'],
                            properties: {
                                personnelId: { type: 'integer', example: 7 }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Ticket réassigné avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Ticket réassigné avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 1 },
                                            type: { type: 'string', example: 'technique' },
                                            statut: { type: 'string', example: 'en_cours' },
                                            date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                            clientId: { type: 'integer', example: 42 },
                                            personnelId: { type: 'integer', example: 7 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'ID du personnel est invalide." }
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
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description: "Accès refusé, rôle insuffisant",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé: vous n'êtes pas autorisé à réassigner des tickets." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Ticket ou personnel non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Le ticket ou le membre du personnel spécifié n'existe pas." }
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

export default ticketSupportRouteDoc;