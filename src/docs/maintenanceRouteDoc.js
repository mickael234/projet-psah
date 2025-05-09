// src/docs/maintenanceRouteDoc.js
const maintenanceRouteDoc = {
    "/api/find-personnel/{userId}": {
      get: {
        summary: "Trouver l'ID du personnel par l'ID utilisateur",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "integer" },
            description: "ID de l'utilisateur",
          },
        ],
        responses: {
          200: {
            description: "ID du personnel trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "ID du personnel trouvé" },
                    data: {
                      type: "object",
                      properties: {
                        id_personnel: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Personnel non trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Personnel non trouvé pour cet utilisateur" },
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
                    message: { type: "string", example: "Erreur lors de la recherche du personnel" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/hebergements/{id}/maintenance": {
      post: {
        summary: "Créer une maintenance pour un hébergement",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "ID de l'hébergement",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["description"],
                properties: {
                  description: { type: "string" },
                  priorite: { type: "string", enum: ["BASSE", "NORMALE", "HAUTE", "URGENTE"] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Maintenance créée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Maintenance créée avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_maintenance: { type: "integer" },
                        id_chambre: { type: "integer" },
                        description: { type: "string" },
                        date: { type: "string", format: "date-time" },
                        statut: { type: "string" },
                        priorite: { type: "string" },
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
                    message: { type: "string", example: "Description requise" },
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
                    message: { type: "string", example: "Erreur lors de la création de la maintenance" },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "Lister les maintenances d'un hébergement",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "ID de l'hébergement",
          },
        ],
        responses: {
          200: {
            description: "Liste des maintenances",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Maintenances récupérées avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_maintenance: { type: "integer" },
                          id_chambre: { type: "integer" },
                          description: { type: "string" },
                          date: { type: "string", format: "date-time" },
                          statut: { type: "string" },
                          priorite: { type: "string" },
                          date_fin: { type: "string", format: "date-time" },
                          notes: { type: "string" },
                        },
                      },
                    },
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
                    message: { type: "string", example: "Erreur lors de la récupération des maintenances" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/notifications": {
      get: {
        summary: "Obtenir les notifications de maintenance",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Liste des notifications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Notifications récupérées avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_notification: { type: "integer" },
                          id_utilisateur: { type: "integer" },
                          type: { type: "string" },
                          contenu: { type: "string" },
                          etat: { type: "string" },
                          priorite: { type: "string" },
                          envoye_le: { type: "string", format: "date-time" },
                          lu_le: { type: "string", format: "date-time" },
                        },
                      },
                    },
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
                    message: { type: "string", example: "Erreur lors de la récupération des notifications" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/notifications/marquer-comme-lues": {
      put: {
        summary: "Marquer des notifications comme lues",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "integer" },
                    description: "IDs des notifications à marquer comme lues",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Notifications marquées comme lues",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Notifications marquées comme lues" },
                    data: {
                      type: "object",
                      properties: {
                        count: { type: "integer" },
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
                    message: { type: "string", example: "IDs des notifications requis" },
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
                    message: { type: "string", example: "Erreur lors de la mise à jour des notifications" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/{idMaintenance}/statut": {
      put: {
        summary: "Mettre à jour le statut d'une maintenance",
        tags: ["Maintenance"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "idMaintenance",
            required: true,
            schema: { type: "integer" },
            description: "ID de la maintenance",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["statut"],
                properties: {
                  statut: {
                    type: "string",
                    enum: ["EN_ATTENTE", "EN_COURS", "TERMINEE", "ANNULEE"],
                  },
                  notes: { type: "string" },
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
                    message: { type: "string", example: "Statut de la maintenance mis à jour avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_maintenance: { type: "integer" },
                        statut: { type: "string" },
                        notes: { type: "string" },
                        date_fin: { type: "string", format: "date-time" },
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
                    message: { type: "string", example: "Statut requis" },
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
            description: "Maintenance non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Maintenance non trouvée" },
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
                    message: { type: "string", example: "Erreur lors de la mise à jour du statut" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default maintenanceRouteDoc
  
  