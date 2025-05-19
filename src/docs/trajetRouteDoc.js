const trajetRouteDoc = {
    'api/trajets/me': {
        get: {
            summary: "Récupérer les trajets du chauffeur connecté",
            tags: ['Trajets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'statut',
                    schema: {
                        type: 'string',
                        enum: ['en_attente', 'en_cours', 'termine']
                    },
                    description: 'Filtrer par statut du trajet'
                },
                {
                    in: 'query',
                    name: 'dateMin',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date minimum de prise en charge (format ISO)'
                },
                {
                    in: 'query',
                    name: 'dateMax',
                    schema: {
                        type: 'string',
                        format: 'date-time'
                    },
                    description: 'Date maximum de prise en charge (format ISO)'
                }
            ],
            responses: {
                200: {
                    description: 'Trajets récupérés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Trajets du chauffeur récupérés avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_trajet: { type: 'integer', example: 1 },
                                                id_personnel: { type: 'integer', example: 5 },
                                                id_demande_course: { type: 'integer', example: 10 },
                                                date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                                date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                                statut: { type: 'string', enum: ['en_attente', 'en_cours', 'termine'], example: 'en_attente' },
                                                demandeCourse: {
                                                    type: 'object',
                                                    properties: {
                                                        id_demande_course: { type: 'integer', example: 10 },
                                                        lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                                        lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' },
                                                        statut: { type: 'string', example: 'acceptee' },
                                                        id_client: { type: 'integer', example: 3 }
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
                    description: "Accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Vous n'êtes pas autorisé à accéder à cette ressource." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Aucun trajet trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Aucun trajet trouvé.' }
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
    'api/trajets/planning': {
        get: {
            summary: "Récupérer le planning des trajets par jour",
            tags: ['Trajets'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'dateMin',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'Date de début du planning (YYYY-MM-DD)'
                },
                {
                    in: 'query',
                    name: 'dateMax',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'date'
                    },
                    description: 'Date de fin du planning (YYYY-MM-DD)'
                }
            ],
            responses: {
                200: {
                    description: 'Planning récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Planning des trajets récupéré avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_trajet: { type: 'integer', example: 1 },
                                                id_personnel: { type: 'integer', example: 5 },
                                                id_demande_course: { type: 'integer', example: 10 },
                                                date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                                date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                                statut: { type: 'string', enum: ['en_attente', 'en_cours', 'termine'], example: 'en_attente' },
                                                demandeCourse: {
                                                    type: 'object',
                                                    properties: {
                                                        id_demande_course: { type: 'integer', example: 10 },
                                                        lieu_depart: { type: 'string', example: 'Gare de Lyon, Paris' },
                                                        lieu_arrivee: { type: 'string', example: 'Aéroport Charles de Gaulle, Paris' }
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
                    description: "Paramètres invalides",
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
                    description: "Aucun trajet planifié",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Aucun trajet trouvé pour cette période.' }
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
    'api/trajets/{id}': {
        get: {
            summary: "Récupérer un trajet par son ID",
            tags: ['Trajets'],
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
                    description: 'Trajet récupéré avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Trajet récupéré avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_trajet: { type: 'integer', example: 1 },
                                            id_personnel: { type: 'integer', example: 5 },
                                            id_demande_course: { type: 'integer', example: 10 },
                                            date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                            date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                            statut: { type: 'string', enum: ['en_attente', 'en_cours', 'termine'], example: 'en_attente' },
                                            personnel: {
                                                type: 'object',
                                                properties: {
                                                    id_personnel: { type: 'integer', example: 5 },
                                                    prenom: { type: 'string', example: 'Pierre' },
                                                    nom: { type: 'string', example: 'Leroy' },
                                                    poste: { type: 'string', example: 'Chauffeur VIP' }
                                                }
                                            },
                                            demandeCourse: {
                                                type: 'object',
                                                properties: {
                                                    id_client: { type: 'integer', example: 3 }
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
                                    message: { type: 'string', example: "L'ID du trajet est invalide." }
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
                    description: "Accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Accès refusé à ce trajet." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Trajet non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Trajet introuvable.' }
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
    'api/trajets/{id}/horaires': {
        patch: {
            summary: "Modifier les horaires d'un trajet (client)",
            tags: ['Trajets'],
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
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['date_prise_en_charge', 'date_depose'],
                            properties: {
                                date_prise_en_charge: { 
                                    type: 'string', 
                                    format: 'date-time', 
                                    example: '2025-05-16T10:00:00Z',
                                    description: 'Nouvelle date de prise en charge'
                                },
                                date_depose: { 
                                    type: 'string', 
                                    format: 'date-time', 
                                    example: '2025-05-16T11:30:00Z',
                                    description: 'Nouvelle date de dépose'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Horaires modifiés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Horaires du trajet mis à jour avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_trajet: { type: 'integer', example: 1 },
                                            id_personnel: { type: 'integer', example: 5 },
                                            id_demande_course: { type: 'integer', example: 10 },
                                            date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-16T10:00:00Z' },
                                            date_depose: { type: 'string', format: 'date-time', example: '2025-05-16T11:30:00Z' },
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
                                    message: { type: 'string', example: 'Les deux horaires sont requis.' }
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
                    description: "Accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Vous ne pouvez modifier que vos propres trajets." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Trajet non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Trajet introuvable.' }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: "Conflit",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CONFLIT' },
                                    message: { type: 'string', example: "Seuls les trajets en attente peuvent être reprogrammés." }
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
    'api/trajets/{id}/statut': {
        patch: {
            summary: "Modifier le statut d'un trajet (chauffeur)",
            tags: ['Trajets'],
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
                                    enum: ['en_attente', 'en_cours', 'termine'],
                                    example: 'en_cours',
                                    description: 'Nouveau statut du trajet'
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
                                    message: { type: 'string', example: 'Statut du trajet mis à jour : en_cours' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_trajet: { type: 'integer', example: 1 },
                                            id_personnel: { type: 'integer', example: 5 },
                                            id_demande_course: { type: 'integer', example: 10 },
                                            date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                            date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
                                            statut: { type: 'string', example: 'en_cours' }
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
                                    message: { type: 'string', example: 'Statut de trajet invalide.' }
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
                    description: "Accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'PERMISSION REFUSEE' },
                                    message: { type: 'string', example: "Vous ne pouvez modifier que vos propres trajets." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Trajet non trouvé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Trajet introuvable.' }
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
    'api/trajets': {
        post: {
            summary: "Créer un nouveau trajet",
            tags: ['Trajets'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['id_demande_course', 'date_prise_en_charge', 'date_depose'],
                            properties: {
                                id_demande_course: { 
                                    type: 'integer', 
                                    example: 10,
                                    description: 'ID de la demande de course associée'
                                },
                                date_prise_en_charge: { 
                                    type: 'string', 
                                    format: 'date-time', 
                                    example: '2025-05-15T10:00:00Z',
                                    description: 'Date et heure de prise en charge'
                                },
                                date_depose: { 
                                    type: 'string', 
                                    format: 'date-time', 
                                    example: '2025-05-15T11:30:00Z',
                                    description: 'Date et heure de dépose prévue'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Trajet créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CREATED' },
                                    message: { type: 'string', example: 'Trajet créé avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_trajet: { type: 'integer', example: 1 },
                                            id_personnel: { type: 'integer', example: 5 },
                                            id_demande_course: { type: 'integer', example: 10 },
                                            date_prise_en_charge: { type: 'string', format: 'date-time', example: '2025-05-15T10:00:00Z' },
                                            date_depose: { type: 'string', format: 'date-time', example: '2025-05-15T11:30:00Z' },
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
                                    message: { type: 'string', example: 'Champs requis : id_demande_course, date_prise_en_charge, date_depose.' }
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
                    description: "Demande de course introuvable",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: 'Demande de course introuvable.' }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: "Conflit",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CONFLIT' },
                                    message: { type: 'string', example: "Un trajet a déjà été créé pour cette demande." }
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

export default trajetRouteDoc;