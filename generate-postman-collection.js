import fs from "fs"
import path from "path"

// Configuration
const config = {
  baseUrl: "http://localhost:3000",
  authToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM1LCJyb2xlIjoiU1VQRVJfQURNSU4iLCJlbWFpbCI6InN1cGVyYWRtaW5AZ21haWwuY29tIiwiY2xpZW50SWQiOm51bGwsInBlcm1pc3Npb25zIjpbIk1BTkFHRV9VU0VSUyIsIk1BTkFHRV9ST0xFUyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIk1BTkFHRV9SRVNFUlZBVElPTlMiLCJNQU5BR0VfUk9PTVMiLCJNQU5BR0VfU0VSVklDRVMiLCJNQU5BR0VfQklMTElORyIsIk1BTkFHRV9DT01NVU5JQ0FUSU9OUyIsIlZJRVdfUkVQT1JUUyIsIk1BTkFHRV9NQUlOVEVOQU5DRSJdLCJpYXQiOjE3NDY1NzYxMzQsImV4cCI6MTc0NjU3OTczNH0.unplFersLgnv13B4yqpEUp7KE_7cPPMHcJjMV0WKGKc",
  outputDir: "./postman",
  routesDir: "./src/routes",
  defaultVariables: {
    chambreId: "1",
    clientId: "1",
    reservationId: "1",
    fournitureId: "1",
    communicationId: "1",
    tacheId: "1",
  },
}

// Création de la structure de base de la collection
const collection = {
  info: {
    name: "API Gestion Hôtelière",
    description: "Collection pour tester l'API de gestion hôtelière",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [],
}

// Création de l'environnement
const environment = {
  name: "Environnement Hôtel",
  values: [
    { key: "baseUrl", value: config.baseUrl, enabled: true },
    { key: "authToken", value: config.authToken, enabled: true },
  ],
}

// Ajouter les variables par défaut à l'environnement
Object.entries(config.defaultVariables).forEach(([key, value]) => {
  environment.values.push({ key, value, enabled: true })
})

// Fonction pour extraire les routes à partir des commentaires Swagger
function extractRoutesFromSwagger(fileContent, fileName) {
  const moduleName = fileName.replace("Routes.js", "").replace(/^./, (match) => match.toUpperCase())
  const folder = { name: moduleName, item: [] }

  // Recherche des blocs Swagger
  const swaggerBlocks = fileContent.match(/@swagger\s*\n([^@]*)/g) || []

  for (const block of swaggerBlocks) {
    // Extraire le chemin et la méthode
    const pathMatch = block.match(/\/api\/([^\n]*)/)
    if (!pathMatch) continue

    const path = pathMatch[0]

    // Extraire les méthodes HTTP
    const methods = []
    if (block.includes("get:")) methods.push("GET")
    if (block.includes("post:")) methods.push("POST")
    if (block.includes("put:")) methods.push("PUT")
    if (block.includes("delete:")) methods.push("DELETE")

    // Extraire le résumé
    const summaryMatch = block.match(/summary:\s*([^\n]*)/)
    const summary = summaryMatch ? summaryMatch[1].trim() : path

    // Extraire les paramètres de chemin
    const pathParams = []
    const pathParamMatches = path.match(/\{([^}]+)\}/g) || []
    pathParamMatches.forEach((param) => {
      const paramName = param.replace(/[{}]/g, "")
      pathParams.push(paramName)
    })

    // Créer une requête pour chaque méthode
    for (const method of methods) {
      const requestName = `${summary} [${method}]`

      // Construire l'URL avec les variables
      let url = path
      pathParams.forEach((param) => {
        url = url.replace(`{${param}}`, `{{${param}}}`)
      })

      // Créer la requête
      const request = {
        name: requestName,
        request: {
          method,
          header: [
            {
              key: "Content-Type",
              value: "application/json",
            },
            {
              key: "Authorization",
              value: "Bearer {{authToken}}",
            },
          ],
          url: {
            raw: `{{baseUrl}}${url}`,
            host: ["{{baseUrl}}"],
            path: url
              .split("/")
              .filter((p) => p !== "")
              .map((p) => {
                // Remplacer les paramètres de chemin par des variables Postman
                if (p.startsWith("{") && p.endsWith("}")) {
                  return `{{${p.substring(1, p.length - 1)}}}`
                }
                return p
              }),
          },
        },
      }

      // Ajouter un corps de requête pour POST et PUT
      if (method === "POST" || method === "PUT") {
        // Extraire le schéma du corps de la requête
        const schemaMatch = block.match(/schema:\s*\n\s*type:\s*object([\s\S]*?)responses:/)
        if (schemaMatch) {
          const schemaBlock = schemaMatch[1]

          // Créer un exemple de corps de requête
          const requestBody = {}

          // Extraire les propriétés requises
          const requiredMatch = schemaBlock.match(/required:\s*\n\s*-\s*([^]*?)properties:/)
          const requiredProps = requiredMatch
            ? requiredMatch[1].match(/-\s*([^\n]*)/g).map((p) => p.replace(/[-\s]/g, ""))
            : []

          // Extraire les propriétés
          const propertiesMatch = schemaBlock.match(/properties:\s*\n([^]*?)(?:\n\s*responses:|$)/)
          if (propertiesMatch) {
            const propertiesBlock = propertiesMatch[1]
            const propertyMatches = propertiesBlock.match(/([a-zA-Z_]+):\s*\n\s*type:\s*([^\n]*)/g) || []

            for (const propMatch of propertyMatches) {
              const [propName, propType] = propMatch.match(/([a-zA-Z_]+):\s*\n\s*type:\s*([^\n]*)/)

              // Générer une valeur d'exemple en fonction du type
              let exampleValue
              if (propType.includes("string")) {
                if (propName.includes("date")) {
                  exampleValue = new Date().toISOString()
                } else if (propName.includes("email")) {
                  exampleValue = "utilisateur@exemple.com"
                } else if (propName.includes("password") || propName.includes("mot_de_passe")) {
                  exampleValue = "MotDePasse123!"
                } else {
                  exampleValue = `Exemple de ${propName}`
                }
              } else if (propType.includes("integer") || propType.includes("number")) {
                exampleValue = 1
              } else if (propType.includes("boolean")) {
                exampleValue = true
              } else if (propType.includes("array")) {
                exampleValue = []
              } else if (propType.includes("object")) {
                exampleValue = {}
              }

              requestBody[propName] = exampleValue
            }
          }

          // Ajouter le corps de la requête
          request.request.body = {
            mode: "raw",
            raw: JSON.stringify(requestBody, null, 2),
            options: {
              raw: {
                language: "json",
              },
            },
          }
        }
      }

      // Ajouter des tests automatiques
      request.request.event = [
        {
          listen: "test",
          script: {
            exec: [
              'pm.test("Statut 2XX", function() {',
              "    pm.response.to.be.success;",
              "});",
              "",
              'pm.test("Temps de réponse acceptable", function() {',
              "    pm.expect(pm.response.responseTime).to.be.below(1000);",
              "});",
              "",
              'pm.test("Format de réponse valide", function() {',
              "    pm.response.to.be.json;",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.be.an('object');",
              "});",
            ],
            type: "text/javascript",
          },
        },
      ]

      folder.item.push(request)
    }
  }

  return folder
}

// Fonction principale pour générer la collection
async function generateCollection() {
  try {
    // Créer le répertoire de sortie s'il n'existe pas
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true })
    }

    // Lire les fichiers de routes
    const routeFiles = fs.readdirSync(config.routesDir).filter((file) => file.endsWith("Routes.js"))

    // Traiter chaque fichier de routes
    for (const file of routeFiles) {
      const filePath = path.join(config.routesDir, file)
      const fileContent = fs.readFileSync(filePath, "utf8")

      // Extraire les routes et les ajouter à la collection
      const folder = extractRoutesFromSwagger(fileContent, file)
      if (folder.item.length > 0) {
        collection.item.push(folder)
      }
    }

    // Ajouter un dossier pour l'authentification
    collection.item.unshift({
      name: "Authentification",
      item: [
        {
          name: "Login",
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json",
              },
            ],
            url: {
              raw: "{{baseUrl}}/api/auth/login",
              host: ["{{baseUrl}}"],
              path: ["api", "auth", "login"],
            },
            body: {
              mode: "raw",
              raw: JSON.stringify(
                {
                  email: "superadmin@gmail.com",
                  mot_de_passe: "Admin123",
                },
                null,
                2,
              ),
              options: {
                raw: {
                  language: "json",
                },
              },
            },
          },
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  'pm.test("Statut 200", function() {',
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  'pm.test("Token reçu", function() {',
                  "    const jsonData = pm.response.json();",
                  "    pm.expect(jsonData.token).to.exist;",
                  '    pm.environment.set("authToken", jsonData.token);',
                  "});",
                ],
                type: "text/javascript",
              },
            },
          ],
        },
      ],
    })

    // Écrire la collection dans un fichier
    fs.writeFileSync(path.join(config.outputDir, "hotel-api-collection.json"), JSON.stringify(collection, null, 2))

    // Écrire l'environnement dans un fichier
    fs.writeFileSync(path.join(config.outputDir, "hotel-api-environment.json"), JSON.stringify(environment, null, 2))

    console.log("Collection et environnement Postman générés avec succès !")
    console.log(`Fichiers créés dans le répertoire: ${config.outputDir}`)
    console.log("\nInstructions :")
    console.log("1. Ouvrez Postman")
    console.log("2. Importez les fichiers hotel-api-collection.json et hotel-api-environment.json")
    console.log('3. Sélectionnez l\'environnement "Environnement Hôtel"')
    console.log("4. Exécutez la collection complète ou des dossiers spécifiques")
  } catch (error) {
    console.error("Erreur lors de la génération de la collection :", error)
  }
}

// Exécuter la fonction principale
generateCollection()
