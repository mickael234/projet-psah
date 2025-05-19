// src/docs/serviceRouteDoc.js
const serviceRouteDoc = {
    "/api/services": {
      post: {
        summary: "Créer un service",
        tags: ["Services"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nom", "prix"],
                properties: {
                  nom: { type: "string" },
                  description: { type: "string" },
                  prix: { type: "number", format: "float" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Service créé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Service créé avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_service: { type: "integer" },
                        nom: { type: "string" },
                        description: { type: "string" },
                        prix: { type: "number" },
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
                    message: { type: "string", example: "Nom et prix sont requis" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
      get: {
        summary: "Obtenir tous les services",
        tags: ["Services"],
        responses: {
          200: {
            description: "Liste des services",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Services récupérés avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_service: { type: "integer" },
                          nom: { type: "string" },
                          description: { type: "string" },
                          prix: { type: "number" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des services" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/services/{id}": {
      put: {
        summary: "Modifier un service",
        tags: ["Services"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID du service",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nom: { type: "string" },
                  description: { type: "string" },
                  prix: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Service modifié avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Service modifié avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_service: { type: "integer" },
                        nom: { type: "string" },
                        description: { type: "string" },
                        prix: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Service non trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Service non trouvé" },
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
                    message: { type: "string", example: "Erreur lors de la modification du service" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Supprimer un service",
        tags: ["Services"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID du service",
          },
        ],
        responses: {
          200: {
            description: "Service supprimé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Service supprimé avec succès" },
                  },
                },
              },
            },
          },
          404: {
            description: "Service non trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Service non trouvé" },
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
                    message: { type: "string", example: "Erreur lors de la suppression du service" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default serviceRouteDoc
  