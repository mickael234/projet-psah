// src/server.js

import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"
import { fileURLToPath } from "url"
import { authenticateJWT } from "./middleware/auth.js"

// Obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import des routes
import authRoutes from "./routes/authRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import hebergementRoutes from "./routes/hebergementRoutes.js"
import reservationRoutes from "./routes/reservationRoutes.js"
import paiementRoutes from "./routes/paiementRoutes.js"
import clientRoutes from "./routes/clientRoutes.js"
import avisRoutes from "./routes/avisRoutes.js"
import rapportRoutes from "./routes/rapportFinancierRoutes.js"
import factureRoutes from "./routes/factureRoutes.js"
import statusRoutes from "./routes/statusRoutes.js"
import nettoyageRoutes from "./routes/nettoyageRoutes.js"
import fournitureRoutes from "./routes/fournitureRoutes.js"
//  Importer aussi tes routes à toi (ton travail)
import favorisRoutes from "./routes/favorisRoutes.js"
import maintenanceRoutes from "./routes/maintenanceRoutes.js"
import serviceRoutes from "./routes/serviceRoutes.js"
import communicationRoutes from "./routes/communicationRoutes.js"
import planningRoutes from "./routes/planningRoutes.js"
import permissionRoutes from "./routes/permissionRoutes.js"
import testRoutes from "./routes/testRoutes.js"

// Import des fichiers Swagger séparés (de Hassan)
import authRouteDoc from "./docs/swagger.js"
import profileRouteDoc from "./docs/profileRouteDoc.js"
import hebergementRouteDoc from "./docs/hebergementRouteDoc.js"
import reservationRouteDoc from "./docs/reservationRouteDoc.js"
import paiementRouteDoc from "./docs/paiementRouteDoc.js"
import statusRouteDoc from "./docs/statusRouteDoc.js"
import permissionRouteDoc from "./docs/permissionRouteDoc.js"
import favorisRouteDoc from "./docs/favorisRouteDoc.js"
import serviceRouteDoc from "./docs/serviceRouteDoc.js"
import nettoyageRouteDoc from "./docs/nettoyageRouteDoc.js"
import maintenanceRouteDoc from "./docs/maintenanceRouteDoc.js"
import planningRouteDoc from "./docs/planningRouteDoc.js"
import fournitureRouteDoc from "./docs/fournitureRouteDoc.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gestion Hôtelière",
      version: "1.0.0",
      description: "API pour le système de gestion hôtelière",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/docs/*.js"],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
swaggerSpec.paths = {
  ...swaggerSpec.paths,
  ...authRouteDoc,
  ...profileRouteDoc,
  ...hebergementRouteDoc,
  ...reservationRouteDoc,
  ...paiementRouteDoc,
  ...statusRouteDoc,
  ...permissionRouteDoc,
  ...favorisRouteDoc,
  ...serviceRouteDoc,
  ...nettoyageRouteDoc,
  ...maintenanceRouteDoc,
  ...planningRouteDoc,
  ...fournitureRouteDoc,
}

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Route de diagnostic
app.get("/api/diagnostic", authenticateJWT, (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Diagnostic réussi",
    user: req.user
      ? {
          id: req.user.userId,
          role: req.user.role,
          permissions: req.user.permissions,
        }
      : null,
    routes: {
      registered: [
        "/api/auth",
        "/api/profile",
        "/api/hebergements",
        "/api/reservations",
        "/api/paiements",
        "/api/clients",
        "/api/avis",
        "/api/rapports",
        "/api/factures",
        "/api/nettoyage",
        "/api/fournitures",
        "/api/communications",
        "/api/maintenance/planning",
        "/api/favoris",
        "/api/services",
        "/api/permissions",
        "/api/test",
      ],
    },
  })
})

// IMPORTANT: Monter statusRoutes AVANT hebergementRoutes
app.use("/api", statusRoutes)

// Routes API
app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/hebergements", hebergementRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/paiements", paiementRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/avis", avisRoutes)
app.use("/api/rapports", rapportRoutes)
app.use("/api/factures", factureRoutes)
app.use("/api/nettoyage", nettoyageRoutes)
app.use("/api/fournitures", fournitureRoutes)
app.use("/api/communications", communicationRoutes)
app.use("/api/maintenance/planning", planningRoutes)
app.use("/api/favoris", favorisRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api", maintenanceRoutes) // /api/hebergements/:id/maintenance
app.use("/api/permissions", permissionRoutes)
app.use("/api/test", testRoutes)

// Route test
app.get("/", (req, res) => res.send("Bienvenue sur l'API Hôtel - PSAH"))

// Dans server.js, ajoutez cette route de test
app.get("/api/test-auth", authenticateJWT, (req, res) => {
  res.json({
    status: "OK",
    message: "Authentification réussie",
    user: req.user,
  })
})

// Lancer le serveur
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))
}

export default app
