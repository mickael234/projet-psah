// src/docs/nettoyageRouteDoc.js
const nettoyageRouteDoc = {
    "/api/nettoyage/hebergements/{id_chambre}": {
      post: {
        summary: "Enregistre une opération de nettoyage pour un hébergement",
        tags: ["Nettoyage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id_chambre",
            required: true,
            description: "ID de la chambre",
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
                properties: {
                  notes: {
                    type: "string",
                  },
                  fournitures_utilisees: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id_fourniture: {
                          type: "integer",
                        },
                        quantite: {
                          type: "integer",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Nettoyage enregistré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Nettoyage enregistré avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_nettoyage: { type: "integer" },
                        id_chambre: { type: "integer" },
                        date: { type: "string", format: "date-time" },
                        notes: { type: "string" },
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
                    message: { type: "string", example: "Données invalides" },
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
                    message: { type: "string", example: "Vous n'avez pas les permissions nécessaires" },
                  },
                },
              },
            },
          },
          404: {
            description: "Chambre non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Chambre non trouvée" },
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
                    message: { type: "string", example: "Erreur lors de l'enregistrement du nettoyage" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/nettoyage/hebergements/{id_chambre}/historique": {
      get: {
        summary: "Récupère l'historique des nettoyages pour un hébergement",
        tags: ["Nettoyage"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id_chambre",
            required: true,
            description: "ID de la chambre",
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Historique des nettoyages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Historique des nettoyages récupéré avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_nettoyage: { type: "integer" },
                          id_chambre: { type: "integer" },
                          date: { type: "string", format: "date-time" },
                          notes: { type: "string" },
                          personnel: {
                            type: "object",
                            properties: {
                              id_personnel: { type: "integer" },
                              nom: { type: "string" },
                              prenom: { type: "string" },
                            },
                          },
                          fournitures: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id_fourniture: { type: "integer" },
                                nom: { type: "string" },
                                quantite: { type: "integer" },
                              },
                            },
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
                    message: { type: "string", example: "Erreur lors de la récupération de l'historique des nettoyages" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default nettoyageRouteDoc
  
  