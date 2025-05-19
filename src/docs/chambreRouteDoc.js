const chambreRouteDoc = {
    'api/chambres/{id}': {
        get: {
            summary: "Voir les détails d'une chambre",
            tags: ['Chambres'],
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

export default chambreRouteDoc;
