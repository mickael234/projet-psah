const demandeCourseRouteDoc = {
    'api/demandes-course/me': {
        get: {
            summary: "Récupérer les demandes de course du client connecté",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'statut',
                    schema: {
                        type: 'string',
                        enum: ['en_attente', 'acceptee', 'refusee', 'annulee']
                    },
                    description: 'Filtrer par statut de la demande'
                },
                {
                    in: 'query',
                    name: 'dateMin',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date minimum de demande (format ISO)'
                },
                {
                    in: 'query',
                    name: 'dateMax',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date maximum de demande (format ISO)'
                }
            ],
            responses: {
                200: {
                    description: 'Demandes récupérées avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Demandes du client récupérées avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_demande_course: { type: 'integer', example: 1 },
                                                id_client: { type: 'integer', example: 3 },
                                                lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                                lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                                date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                                statut: { 
                                                    type: 'string', 
                                                    enum: ['en_attente', 'acceptee', 'refusee', 'annulee'], 
                                                    example: 'en_attente' 
                                                },
                                                trajet: {
                                                    type: 'object',
                                                    nullable: true,
                                                    properties: {
                                                        id_trajet: { type: 'integer', example: 5 },
                                                        id_personnel: { type: 'integer', example: 2 },
                                                        date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                                        date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                                        statut: { type: 'string', example: 'en_attente' }
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
                403: {
                    description: "Accès refusé, rôle client requis",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Accès refusé : vous n'êtes pas un client." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Aucune demande trouvée",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucune demande n'a été trouvé concernant ce client." }
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
    'api/demandes-course/en-attente': {
        get: {
            summary: "Récupérer les demandes en attente (chauffeurs)",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'dateMin',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date minimum de demande (format ISO)'
                },
                {
                    in: 'query',
                    name: 'dateMax',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date maximum de demande (format ISO)'
                }
            ],
            responses: {
                200: {
                    description: 'Demandes en attente récupérées avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Demandes en attente récupérées avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_demande_course: { type: 'integer', example: 1 },
                                                id_client: { type: 'integer', example: 3 },
                                                lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                                lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                                date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                                statut: { type: 'string', example: 'en_attente' },
                                                client: {
                                                    type: 'object',
                                                    properties: {
                                                        prenom: { type: 'string', example: 'Jean' },
                                                        nom: { type: 'string', example: 'Dupont' }
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
                404: {
                    description: "Aucune demande en attente",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucune demande en attente n'a été trouvé." }
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
    'api/demandes-course/{id}': {
        get: {
            summary: "Récupérer une demande de course par ID",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de la demande de course'
                }
            ],
            responses: {
                200: {
                    description: 'Demande récupérée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Demande de course récupérée avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_demande_course: { type: 'integer', example: 1 },
                                            id_client: { type: 'integer', example: 3 },
                                            lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                            lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                            date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                            statut: { 
                                                type: 'string', 
                                                enum: ['en_attente', 'acceptee', 'refusee', 'annulee'], 
                                                example: 'en_attente' 
                                            },
                                            client: {
                                                type: 'object',
                                                properties: {
                                                    prenom: { type: 'string', example: 'Jean' },
                                                    nom: { type: 'string', example: 'Dupont' }
                                                }
                                            },
                                            trajet: {
                                                type: 'object',
                                                nullable: true,
                                                properties: {
                                                    id_trajet: { type: 'integer', example: 5 },
                                                    id_personnel: { type: 'integer', example: 2 },
                                                    date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                                    date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                                    statut: { type: 'string', example: 'en_attente' }
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
                    description: "ID invalide",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'identifiant de la demande n'est pas valide." }
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
                404: {
                    description: "Demande non trouvée",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Demande introuvable.' }
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
        patch: {
            summary: "Modifier une demande de course (lieu, horaire)",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de la demande de course'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                lieu_depart: { 
                                    type: 'string', 
                                    example: 'Place de la République, Paris',
                                    description: 'Nouveau lieu de départ'
                                },
                                lieu_arrivee: { 
                                    type: 'string', 
                                    example: 'Tour Eiffel, Paris',
                                    description: 'Nouveau lieu d\'arrivée'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Demande modifiée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Demande modifiée avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_demande_course: { type: 'integer', example: 1 },
                                            id_client: { type: 'integer', example: 3 },
                                            lieu_depart: { type: 'string', example: 'Place de la République, Paris' },
                                            lieu_arrivee: { type: 'string', example: 'Tour Eiffel, Paris' },
                                            date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                            statut: { type: 'string', example: 'en_attente' }
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
                                    message: { type: 'string', example: 'Seules les demandes en attente peuvent être modifiées.' }
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
                403: {
                    description: "Accès refusé, rôle client requis",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Accès refusé : vous n'êtes pas un client." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Demande non trouvée",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Demande non trouvée.' }
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
    'api/demandes-course/{id}/statut': {
        patch: {
            summary: "Modifier le statut d'une demande (chauffeur/admin)",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID de la demande de course'
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
                                    enum: ['acceptee', 'refusee', 'annulee'],
                                    example: 'acceptee',
                                    description: 'Nouveau statut de la demande'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Statut modifié avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Statut mis à jour : acceptee' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_demande_course: { type: 'integer', example: 1 },
                                            id_client: { type: 'integer', example: 3 },
                                            lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                            lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                            date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                            statut: { type: 'string', example: 'acceptee' }
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
                                    message: { type: 'string', example: 'Statut invalide.' }
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
                403: {
                    description: "Accès refusé, rôle insuffisant",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Accès refusé : rôle insuffisant." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Demande non trouvée",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Demande non trouvée.' }
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
    'api/demandes-course': {
        post: {
            summary: "Créer une nouvelle demande de course",
            tags: ['Demandes de course'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['lieu_depart', 'lieu_arrivee'],
                            properties: {
                                lieu_depart: { 
                                    type: 'string', 
                                    example: 'Gare de Lyon, Paris',
                                    description: 'Lieu de départ'
                                },
                                lieu_arrivee: { 
                                    type: 'string', 
                                    example: 'Aéroport Charles de Gaulle, Paris',
                                    description: 'Lieu d\'arrivée'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Demande créée avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CREATED' },
                                    message: { type: 'string', example: 'Demande de course créée avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_demande_course: { type: 'integer', example: 1 },
                                            id_client: { type: 'integer', example: 3 },
                                            lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                            lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                            date_demande: { type: 'string', format: 'date-time', example: '2025-05-15T09:00:00Z' },
                                            statut: { type: 'string', example: 'en_attente' }
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
                                    message: { type: 'string', example: 'Les champs valides id_client, lieu_depart et lieu_arrivee sont requis.' }
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
                403: {
                    description: "Accès refusé, rôle client requis",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Accès refusé : vous n'êtes pas un client." }
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

export default demandeCourseRouteDoc;