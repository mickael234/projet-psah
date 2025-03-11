import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import authRoutes from './routes/authRoutes.js'
import authRouteDoc from './docs/swagger.js'

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
  },
  apis: ['./src/docs/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
swaggerSpec.paths = { ...swaggerSpec.paths, ...authRouteDoc }

app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`))