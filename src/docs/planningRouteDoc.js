// src/docs/planningRouteDoc.js
const planningRouteDoc = {
    "/api/maintenance/planning": {
      post: {
        summary: "Créer une nouvelle tâche planifiée",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["titre", "date_debut", "id_chambre", "id_responsable", "type_tache"],
                properties: {
                  titre: { type: "string" },
                  description: { type: "string" },
                  date_debut: { type: "string", format: "date-time" },
                  date_fin: { type: "string", format: "date-time" },
                  id_chambre: { type: "integer" },
                  id_responsable: { type: "integer" },
                  type_tache: {
                    type: "string",
                    enum: ["MAINTENANCE", "NETTOYAGE", "INSPECTION"],
                  },
                  priorite: {
                    type: "string",
                    enum: ["BASSE", "NORMALE", "HAUTE", "URGENTE"],
                  },
                  recurrence: {
                    type: "string",
                    enum: ["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE", "AUCUNE"],
                  },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Tâche créée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâche planifiée créée avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_tache: { type: "integer" },
                        titre: { type: "string" },
                        description: { type: "string" },
                        date_debut: { type: "string", format: "date-time" },
                        date_fin: { type: "string", format: "date-time" },
                        id_chambre: { type: "integer" },
                        id_responsable: { type: "integer" },
                        type_tache: { type: "string" },
                        priorite: { type: "string" },
                        statut: { type: "string" },
                        recurrence: { type: "string" },
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
                    message: { type: "string", example: "Erreur lors de la création de la tâche" },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "Récupérer toutes les tâches planifiées",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer" },
            description: "Numéro de page",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer" },
            description: "Nombre d'éléments par page",
          },
          {
            in: "query",
            name: "statut",
            schema: {
              type: "string",
              enum: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"],
            },
            description: "Filtrer par statut",
          },
          {
            in: "query",
            name: "type_tache",
            schema: {
              type: "string",
              enum: ["MAINTENANCE", "NETTOYAGE", "INSPECTION"],
            },
            description: "Filtrer par type de tâche",
          },
          {
            in: "query",
            name: "priorite",
            schema: {
              type: "string",
              enum: ["BASSE", "NORMALE", "HAUTE", "URGENTE"],
            },
            description: "Filtrer par priorité",
          },
          {
            in: "query",
            name: "date_debut",
            schema: { type: "string", format: "date" },
            description: "Date de début minimum",
          },
          {
            in: "query",
            name: "date_fin",
            schema: { type: "string", format: "date" },
            description: "Date de début maximum",
          },
          {
            in: "query",
            name: "id_chambre",
            schema: { type: "integer" },
            description: "Filtrer par chambre",
          },
          {
            in: "query",
            name: "id_responsable",
            schema: { type: "integer" },
            description: "Filtrer par responsable",
          },
        ],
        responses: {
          200: {
            description: "Liste des tâches planifiées",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâches planifiées récupérées avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        taches: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id_tache: { type: "integer" },
                              titre: { type: "string" },
                              description: { type: "string" },
                              date_debut: { type: "string", format: "date-time" },
                              date_fin: { type: "string", format: "date-time" },
                              id_chambre: { type: "integer" },
                              id_responsable: { type: "integer" },
                              type_tache: { type: "string" },
                              priorite: { type: "string" },
                              statut: { type: "string" },
                              recurrence: { type: "string" },
                              notes: { type: "string" },
                              chambre: {
                                type: "object",
                                properties: {
                                  numero_chambre: { type: "string" },
                                  type_chambre: { type: "string" },
                                },
                              },
                              responsable: {
                                type: "object",
                                properties: {
                                  nom: { type: "string" },
                                  prenom: { type: "string" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des tâches" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/maintenance/planning/responsable/{id_responsable}": {
      get: {
        summary: "Récupérer les tâches d'un responsable",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id_responsable",
            schema: { type: "integer" },
            required: true,
            description: "ID du responsable",
          },
          {
            in: "query",
            name: "statut",
            schema: {
              type: "string",
              enum: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"],
            },
            description: "Filtrer par statut",
          },
          {
            in: "query",
            name: "date_debut",
            schema: { type: "string", format: "date" },
            description: "Date de début minimum",
          },
          {
            in: "query",
            name: "date_fin",
            schema: { type: "string", format: "date" },
            description: "Date de début maximum",
          },
        ],
        responses: {
          200: {
            description: "Liste des tâches du responsable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâches récupérées avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_tache: { type: "integer" },
                          titre: { type: "string" },
                          description: { type: "string" },
                          date_debut: { type: "string", format: "date-time" },
                          date_fin: { type: "string", format: "date-time" },
                          id_chambre: { type: "integer" },
                          id_responsable: { type: "integer" },
                          type_tache: { type: "string" },
                          priorite: { type: "string" },
                          statut: { type: "string" },
                          recurrence: { type: "string" },
                          notes: { type: "string" },
                          chambre: {
                            type: "object",
                            properties: {
                              numero_chambre: { type: "string" },
                              type_chambre: { type: "string" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des tâches" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/maintenance/planning/chambre/{id_chambre}": {
      get: {
        summary: "Récupérer les tâches d'une chambre",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id_chambre",
            schema: { type: "integer" },
            required: true,
            description: "ID de la chambre",
          },
          {
            in: "query",
            name: "statut",
            schema: {
              type: "string",
              enum: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"],
            },
            description: "Filtrer par statut",
          },
          {
            in: "query",
            name: "type_tache",
            schema: {
              type: "string",
              enum: ["MAINTENANCE", "NETTOYAGE", "INSPECTION"],
            },
            description: "Filtrer par type de tâche",
          },
        ],
        responses: {
          200: {
            description: "Liste des tâches de la chambre",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâches récupérées avec succès" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id_tache: { type: "integer" },
                          titre: { type: "string" },
                          description: { type: "string" },
                          date_debut: { type: "string", format: "date-time" },
                          date_fin: { type: "string", format: "date-time" },
                          id_chambre: { type: "integer" },
                          id_responsable: { type: "integer" },
                          type_tache: { type: "string" },
                          priorite: { type: "string" },
                          statut: { type: "string" },
                          recurrence: { type: "string" },
                          notes: { type: "string" },
                          responsable: {
                            type: "object",
                            properties: {
                              nom: { type: "string" },
                              prenom: { type: "string" },
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
                    message: { type: "string", example: "Erreur lors de la récupération des tâches" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/maintenance/planning/{id}": {
      get: {
        summary: "Récupérer une tâche par son ID",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID de la tâche",
          },
        ],
        responses: {
          200: {
            description: "Tâche récupérée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâche récupérée avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_tache: { type: "integer" },
                        titre: { type: "string" },
                        description: { type: "string" },
                        date_debut: { type: "string", format: "date-time" },
                        date_fin: { type: "string", format: "date-time" },
                        id_chambre: { type: "integer" },
                        id_responsable: { type: "integer" },
                        type_tache: { type: "string" },
                        priorite: { type: "string" },
                        statut: { type: "string" },
                        recurrence: { type: "string" },
                        notes: { type: "string" },
                        chambre: {
                          type: "object",
                          properties: {
                            numero_chambre: { type: "string" },
                            type_chambre: { type: "string" },
                          },
                        },
                        responsable: {
                          type: "object",
                          properties: {
                            nom: { type: "string" },
                            prenom: { type: "string" },
                          },
                        },
                        commentaires: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id_commentaire: { type: "integer" },
                              contenu: { type: "string" },
                              date_creation: { type: "string", format: "date-time" },
                              utilisateur: {
                                type: "object",
                                properties: {
                                  nom: { type: "string" },
                                  prenom: { type: "string" },
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
            description: "Tâche non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Tâche non trouvée" },
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
                    message: { type: "string", example: "Erreur lors de la récupération de la tâche" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Mettre à jour une tâche",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID de la tâche",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titre: { type: "string" },
                  description: { type: "string" },
                  date_debut: { type: "string", format: "date-time" },
                  date_fin: { type: "string", format: "date-time" },
                  id_chambre: { type: "integer" },
                  id_responsable: { type: "integer" },
                  type_tache: {
                    type: "string",
                    enum: ["MAINTENANCE", "NETTOYAGE", "INSPECTION"],
                  },
                  priorite: {
                    type: "string",
                    enum: ["BASSE", "NORMALE", "HAUTE", "URGENTE"],
                  },
                  statut: {
                    type: "string",
                    enum: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"],
                  },
                  recurrence: {
                    type: "string",
                    enum: ["QUOTIDIENNE", "HEBDOMADAIRE", "MENSUELLE", "AUCUNE"],
                  },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tâche mise à jour avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Tâche mise à jour avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_tache: { type: "integer" },
                        titre: { type: "string" },
                        description: { type: "string" },
                        date_debut: { type: "string", format: "date-time" },
                        date_fin: { type: "string", format: "date-time" },
                        id_chambre: { type: "integer" },
                        id_responsable: { type: "integer" },
                        type_tache: { type: "string" },
                        priorite: { type: "string" },
                        statut: { type: "string" },
                        recurrence: { type: "string" },
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
            description: "Tâche non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Tâche non trouvée" },
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
                    message: { type: "string", example: "Erreur lors de la mise à jour de la tâche" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/maintenance/planning/{id}/statut": {
      put: {
        summary: "Mettre à jour le statut d'une tâche",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID de la tâche",
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
                    enum: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"],
                  },
                  commentaire: { type: "string" },
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
                    message: { type: "string", example: "Statut mis à jour avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_tache: { type: "integer" },
                        statut: { type: "string" },
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
            description: "Tâche non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Tâche non trouvée" },
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
    "/api/maintenance/planning/{id}/commentaire": {
      post: {
        summary: "Ajouter un commentaire à une tâche",
        tags: ["Planning"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "integer" },
            required: true,
            description: "ID de la tâche",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["contenu"],
                properties: {
                  contenu: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Commentaire ajouté avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "OK" },
                    message: { type: "string", example: "Commentaire ajouté avec succès" },
                    data: {
                      type: "object",
                      properties: {
                        id_commentaire: { type: "integer" },
                        id_tache: { type: "integer" },
                        id_utilisateur: { type: "integer" },
                        contenu: { type: "string" },
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
                    message: { type: "string", example: "Contenu requis" },
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
            description: "Tâche non trouvée",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ERROR" },
                    message: { type: "string", example: "Tâche non trouvée" },
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
                    message: { type: "string", example: "Erreur lors de l'ajout du commentaire" },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  
  export default planningRouteDoc
  