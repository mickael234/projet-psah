const avisRouteDoc = {
    'api/avis': {
        get: {
            summary: "Récupérer tous les avis disponibles",
            tags: ['Avis'],
            responses: {
                200: {
                    description: 'Liste des avis trouvés',
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
                                                id_avis: { type: 'integer', example: 1 },
                                                id_reservation: { type: 'integer', example: 42 },
                                                note: { type: 'integer', example: 4 },
                                                commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                                date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Aucun avis trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun avis n'a été trouvé" }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la récupération des avis.' }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: "Créer un nouvel avis pour une réservation",
            tags: ['Avis'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['id_reservation', 'note', 'commentaire'],
                            properties: {
                                id_reservation: { type: 'integer', example: 42 },
                                note: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                                commentaire: { type: 'string', minLength: 5, example: 'Très bon séjour, personnel accueillant!' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Avis créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_avis: { type: 'integer', example: 1 },
                                            id_reservation: { type: 'integer', example: 42 },
                                            note: { type: 'integer', example: 4 },
                                            commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                            date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
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
                                    message: { type: 'string', example: "L'avis n'est pas valide (note ou commentaire insuffisant)." }
                                }
                            }
                        }
                    }
                },
                401 : {
                    description: "Authentification requise",
                    content : {
                        'application/json' : {
                            schema : {
                                type :'object',
                                properties : {
                                    status : { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description : "Token invalide ou accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé. Rôle client requis." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Réservation non trouvée',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "La réservation spécifiée n'existe pas." }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: 'Avis déjà existant pour cette réservation',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'CONFLIT' },
                                    message: { type: 'string', example: "Vous ne pouvez pas laisser plusieurs avis sur cette réservation." }
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
                                    message: { type: 'string', example: "Une erreur interne est survenue lors de la création d'avis." }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/avis/chambre/{idChambre}': {
        get: {
            summary: "Récupérer les avis d'une chambre spécifique",
            tags: ['Avis'],
            parameters: [
                {
                    in: 'path',
                    name: 'idChambre',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'Id de la chambre'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des avis pour une chambre',
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
                                                id_avis: { type: 'integer', example: 1 },
                                                id_reservation: { type: 'integer', example: 42 },
                                                note: { type: 'integer', example: 4 },
                                                commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                                date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Id de la chambre invalide',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'id de la chambre est invalide" }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Aucun avis trouvé pour cette chambre',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun avis n'a été trouvé pour cette chambre" }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la récupération des avis de cette chambre.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/avis/moyenne': {
        get: {
            summary: "Récupérer la note moyenne des avis existants",
            tags: ['Avis'],
            responses: {
                200: {
                    description: 'Note moyenne des avis existants',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    data: {
                                        type: 'number',
                                        format: 'float',
                                        example: 4.2
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
                                    status: { type: 'string', example: 'ERREUR SERVEUR' },
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la récupération de la moyenne des avis existants.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/avis/note/{note}': {
        get: {
            summary: "Récupérer les avis ayant une note spécifique",
            tags: ['Avis'],
            parameters: [
                {
                    in: 'path',
                    name: 'note',
                    required: true,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 5
                    },
                    description: 'Note (1-5)'
                }
            ],
            responses: {
                200: {
                    description: 'Liste des avis avec la note spécifiée',
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
                                                id_avis: { type: 'integer', example: 1 },
                                                id_reservation: { type: 'integer', example: 42 },
                                                note: { type: 'integer', example: 4 },
                                                commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                                date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Note invalide',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "La note n'est pas valide. Elle doit être comprise entre 1 et 5." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Aucun avis trouvé pour cette note',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun avis n'a été trouvé pour cette note" }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la récupération des avis par note.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/avis/reservation/{idReservation}': {
        get: {
            summary: "Récupérer un avis laissé sur une réservation",
            tags: ['Avis'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'idReservation',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'Id de la réservation'
                }
            ],
            responses: {
                200: {
                    description: 'Avis de la réservation',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_avis: { type: 'integer', example: 1 },
                                            id_reservation: { type: 'integer', example: 42 },
                                            note: { type: 'integer', example: 4 },
                                            commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                            date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
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
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'id de la réservation est invalide" }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Réservation ou avis non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Aucun avis n'a été trouvé pour cette réservation" }
                                }
                            }
                        }
                    }
                },
                401 : {
                    description: "Authentification requise",
                    content : {
                        'application/json' : {
                            schema : {
                                type :'object',
                                properties : {
                                    status : { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description : "Token invalide ou accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès refusé. Rôle client requis." }
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
    'api/avis/{idAvis}': {
        put: {
            summary: "Répondre à un avis existant",
            tags: ['Avis'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'idAvis',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'Id de l\'avis'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['reponse'],
                            properties: {
                                reponse: { type: 'string', minLength: 5, example: 'Nous vous remercions pour votre retour positif et sommes ravis que votre séjour vous ait plu.' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Réponse ajoutée à l\'avis avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_avis: { type: 'integer', example: 1 },
                                            id_reservation: { type: 'integer', example: 42 },
                                            note: { type: 'integer', example: 4 },
                                            commentaire: { 
                                                type: 'string', 
                                                example: 'Très bon séjour, personnel accueillant!\n\n---\nRéponse du personnel : Nous vous remercions pour votre retour positif et sommes ravis que votre séjour vous ait plu.\n(Répondu par RECEPTIONNISTE)' 
                                            },
                                            date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Réponse invalide',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "La réponse est invalide (trop courte ou absente)." }
                                }
                            }
                        }
                    }
                },
                401 : {
                    description: "Authentification requise",
                    content : {
                        'application/json' : {
                            schema : {
                                type :'object',
                                properties : {
                                    status : { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description : "Token invalide ou accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès non autorisé" }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Avis non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Impossible de répondre à cet avis, aucun avis n'a été trouvé." }
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
        },
        delete: {
            summary: "Supprimer un avis existant",
            tags: ['Avis'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'idAvis',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'Id de l\'avis à supprimer'
                }
            ],
            responses: {
                200: {
                    description: 'Avis supprimé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'SUPPRIME' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            id_avis: { type: 'integer', example: 1 },
                                            id_reservation: { type: 'integer', example: 42 },
                                            note: { type: 'integer', example: 4 },
                                            commentaire: { type: 'string', example: 'Très bon séjour, personnel accueillant!' },
                                            date_avis: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Id de l'avis invalide",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "L'id de l'avis est invalide" }
                                }
                            }
                        }
                    }
                },
                401 : {
                    description: "Authentification requise",
                    content : {
                        'application/json' : {
                            schema : {
                                type :'object',
                                properties : {
                                    status : { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Authentification requise" }
                                }
                            }
                        }
                    }
                },
                403: {
                    description : "Token invalide ou accès refusé",
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERROR' },
                                    message: { type: 'string', example: "Accès non autorisé" }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Avis non trouvé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Impossible de supprimer cet avis, aucun avis n'a été trouvé." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la suppression de cet avis.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default avisRouteDoc;