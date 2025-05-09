const statusRouteDoc = {
    "/api/hebergements/status": {
      get: {
        summary: "Récupère le statut de tous les hébergements",
        tags: ["Hébergements"],
        parameters: [
          {
            in: "query",
            name: "etat",
            schema: {
              type: "string",
              enum: ["disponible", "occupee", "maintenance"],
            },
            required: false,
            description: "Filtre par état",
          },
          {
            in: "query",
            name: "type_chambre",
            schema: {
              type: "string",
            },
            required: false,
            description: "Filtre par type de chambre",
          },
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
            required: false,
            description: "Numéro de page",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 20,
            },
            required: false,
            description: "Nombre d'éléments par page",
          },
        ],
        responses: {
          200: {
            description: "Liste des statuts des hébergements",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Statuts des hébergements récupérés avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        hebergements: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer" },
                              numero: { type: "string" },
                              type: { type: "string" },
                              etat: { type: "string", enum: ["disponible", "occupee", "maintenance"] },
                              description: { type: "string" },
                              maintenance_en_cours: {
                                type: "object",
                                nullable: true,
                                properties: {
                                  id: { type: "integer" },
                                  description: { type: "string" },
                                  statut: { type: "string" },
                                  date: { type: "string", format: "date-time" },
                                },
                              },
                            },
                          },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            total: { type: "integer" },
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            pages: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la récupération des statuts des hébergements" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/hebergements/status/{id}": {
      put: {
        summary: "Met à jour le statut d'un hébergement",
        tags: ["Hébergements"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            description: "ID de l'hébergement",
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["etat"],
                properties: {
                  etat: {
                    type: "string",
                    enum: ["disponible", "occupee", "maintenance"],
                  },
                  notes: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Statut mis à jour avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Statut de l'hébergement mis à jour avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_chambre: { type: "integer" },
                        numero_chambre: { type: "string" },
                        type_chambre: { type: "string" },
                        etat: { type: "string" },
                        description: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Données invalides",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Le statut est requis" },
                  },
                },
              },
            },
          },
          403: {
            description: "Non autorisé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: {
                      type: "string",
                      example: "Vous n'avez pas les permissions nécessaires pour modifier le statut d'un hébergement",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Hébergement non trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Hébergement non trouvé" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la mise à jour du statut de l'hébergement" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default statusRouteDoc
  