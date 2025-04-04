import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import authRouteDoc from './docs/swagger.js'
import profileRouteDoc from './docs/profileRouteDoc.js'

dotenv.config()

const app = express()

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion Hôtelière',
      version: '1.0.0',
      description: 'API pour le système de gestion hôtelière',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/docs/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
swaggerSpec.paths = { ...swaggerSpec.paths, ...authRouteDoc, ...profileRouteDoc }

app.use(cors())
app.use(express.json())

// Servir les fichiers statiques (pour les photos de profil)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`))