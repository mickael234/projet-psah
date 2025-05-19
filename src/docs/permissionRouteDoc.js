// src/docs/permissionRouteDoc.js
const permissionRouteDoc = {
    "/api/permissions": {
      get: {
        summary: "Récupérer toutes les permissions",
        tags: ["Permissions"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Liste des permissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Permissions récupérées avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_permission: { type: "integer" },
                          nom: { type: "string" },
                          description: { type: "string" },
                          code: { type: "string" },
                          date_creation: { type: "string", format: "date-time" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Non authentifié",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Authentification requise" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des permissions" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Créer une nouvelle permission",
        tags: ["Permissions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nom", "code"],
                properties: {
                  nom: { type: "string" },
                  description: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Permission créée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Permission créée avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_permission: { type: "integer" },
                        nom: { type: "string" },
                        description: { type: "string" },
                        code: { type: "string" },
                        date_creation: { type: "string", format: "date-time" },
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
                    message: { type: "string", example: "Nom et code sont requis" },
                  },
                },
              },
            },
          },
          401: {
            description: "Non authentifié",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Authentification requise" },
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
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la création de la permission" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/permissions/roles": {
      get: {
        summary: "Récupérer tous les rôles",
        tags: ["Permissions"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Liste des rôles",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Rôles récupérés avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_role: { type: "integer" },
                          nom: { type: "string" },
                          description: { type: "string" },
                          code: { type: "string" },
                          date_creation: { type: "string", format: "date-time" },
                          permissions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id_permission: { type: "integer" },
                                nom: { type: "string" },
                                code: { type: "string" },
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
          401: {
            description: "Non authentifié",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Authentification requise" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des rôles" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Créer un nouveau rôle",
        tags: ["Permissions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nom", "code"],
                properties: {
                  nom: { type: "string" },
                  description: { type: "string" },
                  code: { type: "string" },
                  permissions: {
                    type: "array",
                    items: { type: "integer" },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Rôle créé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Rôle créé avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_role: { type: "integer" },
                        nom: { type: "string" },
                        description: { type: "string" },
                        code: { type: "string" },
                        date_creation: { type: "string", format: "date-time" },
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
                    message: { type: "string", example: "Nom et code sont requis" },
                  },
                },
              },
            },
          },
          401: {
            description: "Non authentifié",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Authentification requise" },
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
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Erreur lors de la création du rôle" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/permissions/assign-role": {
      post: {
        summary: "Assigner un rôle à un utilisateur",
        tags: ["Permissions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "roleId"],
                properties: {
                  userId: { type: "integer" },
                  roleId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Rôle assigné avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Rôle assigné avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_utilisateur: { type: "integer" },
                        id_role: { type: "integer" },
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
                    message: { type: "string", example: "ID utilisateur et ID rôle sont requis" },
                  },
                },
              },
            },
          },
          401: {
            description: "Non authentifié",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Authentification requise" },
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
            description: "Ressource non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Utilisateur ou rôle non trouvé" },
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
                    message: { type: "string", example: "Erreur lors de l'assignation du rôle" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default permissionRouteDoc
  