// src/docs/favorisRouteDoc.js
const favorisRouteDoc = {
    "/api/favoris": {
      post: {
        summary: "Ajouter une chambre aux favoris",
        tags: ["Favoris"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id_utilisateur", "id_chambre"],
                properties: {
                  id_utilisateur: { type: "integer", example: 1 },
                  id_chambre: { type: "integer", example: 2 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Favori ajouté avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Favori ajouté avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_utilisateur: { type: "integer" },
                        id_chambre: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Données manquantes ou favori existant",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: {
                      type: "string",
                      example: "ID utilisateur et ID chambre sont requis ou ce favori existe déjà",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur interne serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de l'ajout du favori" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Supprimer un favori",
        tags: ["Favoris"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id_utilisateur", "id_chambre"],
                properties: {
                  id_utilisateur: { type: "integer", example: 1 },
                  id_chambre: { type: "integer", example: 2 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Favori supprimé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Favori supprimé avec succès" },
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
                    message: { type: "string", example: "ID utilisateur et ID chambre sont requis" },
                  },
                },
              },
            },
          },
          404: {
            description: "Favori non trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Favori non trouvé" },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur interne serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la suppression du favori" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/favoris/{id_utilisateur}": {
      get: {
        summary: "Récupérer les favoris d'un utilisateur",
        tags: ["Favoris"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id_utilisateur",
            required: true,
            schema: { type: "integer" },
            description: "ID de l'utilisateur",
          },
        ],
        responses: {
          200: {
            description: "Liste des favoris",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Favoris récupérés avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_chambre: { type: "integer" },
                          numero_chambre: { type: "string" },
                          type_chambre: { type: "string" },
                          prix_par_nuit: { type: "number" },
                          description: { type: "string" },
                          etat: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur interne serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la récupération des favoris" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default favorisRouteDoc
  