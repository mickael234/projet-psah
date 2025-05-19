const emailSupportRouteDoc = {
    'api/emails/send': {
        post: {
            summary: "Envoyer un email et créer un ticket de support",
            tags: ['Emails'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email_client', 'email_destinataire', 'sujet', 'message', 'type'],
                            properties: {
                                email_client: { type: 'string', format: 'email', example: 'client@example.com' },
                                email_destinataire: { type: 'string', format: 'email', example: 'support@hotel.com' },
                                sujet: { type: 'string', example: 'Problème avec ma réservation' },
                                message: { type: 'string', example: 'Je rencontre un problème avec ma réservation du 15 au 20 juillet...' },
                                type: { type: 'string', enum: ['technique', 'commercial', 'autre'], example: 'commercial' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Email envoyé et ticket créé avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Ticket et e-mail envoyés avec succès.' },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            ticket: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'integer', example: 1 },
                                                    type: { type: 'string', example: 'commercial' },
                                                    statut: { type: 'string', example: 'ouvert' },
                                                    date_creation: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                                    clientId: { type: 'integer', example: 42 },
                                                    personnelId: { type: 'integer', example: null }
                                                }
                                            },
                                            email: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'integer', example: 1 },
                                                    email_client: { type: 'string', example: 'client@example.com' },
                                                    email_destinataire: { type: 'string', example: 'support@hotel.com' },
                                                    sujet: { type: 'string', example: 'Problème avec ma réservation' },
                                                    contenu: { type: 'string', example: 'Je rencontre un problème avec ma réservation du 15 au 20 juillet...' },
                                                    date_envoi: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                                    ticket_id: { type: 'integer', example: 1 }
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
                    description: 'Données invalides',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'MAUVAISE DEMANDE' },
                                    message: { type: 'string', example: "Les informations fournies sont invalides ou incomplètes." }
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
                                    message: { type: 'string', example: "Accès refusé : vous n'êtes pas un client." }
                                }
                            }
                        }
                    }
                },
                422: {
                    description: 'Validation échouée',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ERREUR DE VALIDATION' },
                                    message: { type: 'string', example: "L'adresse email fournie n'est pas valide." }
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
                                    message: { type: 'string', example: "Une erreur interne est survenue lors de l'envoi de l'email ou de la création du ticket." }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'api/emails/{ticketId}': {
        get: {
            summary: "Récupérer les emails associés à un ticket",
            tags: ['Emails'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'ticketId',
                    required: true,
                    schema: {
                        type: 'integer'
                    },
                    description: 'ID du ticket'
                }
            ],
            responses: {
                200: {
                    description: 'Emails récupérés avec succès',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'OK' },
                                    message: { type: 'string', example: 'Emails récupérés avec succès.' },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer', example: 1 },
                                                email_client: { type: 'string', example: 'client@example.com' },
                                                email_destinataire: { type: 'string', example: 'support@hotel.com' },
                                                sujet: { type: 'string', example: 'Problème avec ma réservation' },
                                                contenu: { type: 'string', example: 'Je rencontre un problème avec ma réservation du 15 au 20 juillet...' },
                                                date_envoi: { type: 'string', format: 'date-time', example: '2023-07-15T14:30:00Z' },
                                                ticket_id: { type: 'integer', example: 1 }
                                            }
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
                                    message: { type: 'string', example: "Accès refusé: vous n'êtes pas autorisé à consulter ces emails." }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Ticket non trouvé ou aucun email associé',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'RESSOURCE NON TROUVEE' },
                                    message: { type: 'string', example: "Le ticket spécifié n'existe pas ou aucun email n'est associé à ce ticket." }
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
                                    message: { type: 'string', example: 'Une erreur interne est survenue lors de la récupération des emails.' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default emailSupportRouteDoc;