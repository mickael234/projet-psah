// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import hebergementRoutes from './routes/hebergementRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import paiementRoutes from './routes/paiementRoutes.js';
import authRouteDoc from './docs/swagger.js';
import profileRouteDoc from './docs/profileRouteDoc.js';
import hebergementRouteDoc from './docs/hebergementRouteDoc.js';
import reservationRouteDoc from './docs/reservationRouteDoc.js';
import paiementRouteDoc from './docs/paiementRouteDoc.js';
import clientRoutes from './routes/clientRoutes.js';
import chambreRoutes from './routes/chambreRoutes.js';
import chambreRouteDoc from './docs/chambreRouteDoc.js';
import avisRoutes from './routes/avisRoutes.js';

dotenv.config();

const app = express();

// Obtenir le répertoire actuel avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestion Hôtelière',
            version: '1.0.0',
            description: 'API pour le système de gestion hôtelière'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`
            }
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
    apis: ['./src/docs/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
swaggerSpec.paths = {
    ...swaggerSpec.paths,
    ...authRouteDoc,
    ...profileRouteDoc,
    ...hebergementRouteDoc,
    ...reservationRouteDoc,
    ...paiementRouteDoc,
    ...chambreRouteDoc
};

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (pour les photos de profil et les médias)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/hebergements', hebergementRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/chambres', chambreRoutes);
// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/avis', avisRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

export default app;
