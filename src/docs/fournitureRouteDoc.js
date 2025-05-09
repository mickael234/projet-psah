/**
 * Documentation Swagger pour les routes de fournitures
 */
const fournitureRouteDoc = {
    "/api/fournitures": {
      get: {
        summary: "Récupère toutes les fournitures",
        tags: ["Fournitures"],
        parameters: [
          {
            in: "query",
            name: "categorie",
            schema: {
              type: "string",
            },
            required: false,
            description: "Filtre par catégorie",
          },
          {
            in: "query",
            name: "stock_bas",
            schema: {
              type: "boolean",
            },
            required: false,
            description: "Filtre pour les fournitures avec un stock bas",
          },
        ],
        responses: {
          200: {
            description: "Liste des fournitures",
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
      post: {
        summary: "Crée une nouvelle fourniture",
        tags: ["Fournitures"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nom", "categorie", "quantite_stock"],
                properties: {
                  nom: {
                    type: "string",
                  },
                  description: {
                    type: "string",
                  },
                  categorie: {
                    type: "string",
                  },
                  quantite_stock: {
                    type: "integer",
                  },
                  unite: {
                    type: "string",
                  },
                  prix_unitaire: {
                    type: "number",
                  },
                  seuil_alerte: {
                    type: "integer",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Fourniture créée avec succès",
          },
          400: {
            description: "Données invalides",
          },
          403: {
            description: "Non autorisé",
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
    },
    "/api/fournitures/{id_fourniture}/utilisation": {
      put: {
        summary: "Enregistre l'utilisation d'une fourniture",
        tags: ["Fournitures"],
        parameters: [
          {
            in: "path",
            name: "id_fourniture",
            required: true,
            description: "ID de la fourniture",
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
                required: ["quantite"],
                properties: {
                  quantite: {
                    type: "integer",
                  },
                  notes: {
                    type: "string",
                  },
                  id_chambre: {
                    type: "integer",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Utilisation enregistrée avec succès",
          },
          400: {
            description: "Données invalides",
          },
          403: {
            description: "Non autorisé",
          },
          404: {
            description: "Fourniture non trouvée",
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
    },
    "/api/fournitures/commande": {
      post: {
        summary: "Crée une commande de fournitures",
        tags: ["Fournitures"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["details"],
                properties: {
                  reference: {
                    type: "string",
                  },
                  fournisseur: {
                    type: "string",
                  },
                  date_livraison_prevue: {
                    type: "string",
                    format: "date",
                  },
                  notes: {
                    type: "string",
                  },
                  details: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["id_fourniture", "quantite"],
                      properties: {
                        id_fourniture: {
                          type: "integer",
                        },
                        quantite: {
                          type: "integer",
                        },
                        prix_unitaire: {
                          type: "number",
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
            description: "Commande créée avec succès",
          },
          400: {
            description: "Données invalides",
          },
          403: {
            description: "Non autorisé",
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
    },
    "/api/fournitures/commande/{id_commande}/statut": {
      put: {
        summary: "Met à jour le statut d'une commande",
        tags: ["Fournitures"],
        parameters: [
          {
            in: "path",
            name: "id_commande",
            required: true,
            description: "ID de la commande",
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
                required: ["statut"],
                properties: {
                  statut: {
                    type: "string",
                    enum: ["EN_ATTENTE", "CONFIRMEE", "EXPEDIEE", "LIVREE", "ANNULEE"],
                  },
                  notes: {
                    type: "string",
                  },
                  date_livraison: {
                    type: "string",
                    format: "date",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Statut mis à jour avec succès",
          },
          400: {
            description: "Données invalides",
          },
          403: {
            description: "Non autorisé",
          },
          404: {
            description: "Commande non trouvée",
          },
          500: {
            description: "Erreur serveur",
          },
        },
      },
    },
  }
  
  export default fournitureRouteDoc
  