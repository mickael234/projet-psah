// src/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import des routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import hebergementRoutes from './routes/hebergementRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import paiementRoutes from './routes/paiementRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import avisRoutes from './routes/avisRoutes.js';
import rapportRoutes from './routes/rapportFinancierRoutes.js';
import factureRoutes from './routes/factureRoutes.js';

//  Importer aussi tes routes à toi (ton travail)
import favorisRoutes from './routes/favorisRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

// Import des fichiers Swagger séparés (de Hassan)
import authRouteDoc from './docs/swagger.js';
import profileRouteDoc from './docs/profileRouteDoc.js';
import hebergementRouteDoc from './docs/hebergementRouteDoc.js';
import reservationRouteDoc from './docs/reservationRouteDoc.js';
import paiementRouteDoc from './docs/paiementRouteDoc.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestion Hôtelière',
            version: '1.0.0',
            description: 'API pour le système de gestion hôtelière',
        },
        servers: [
            { url: `http://localhost:${PORT}` }
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
};

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/hebergements', hebergementRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/factures', factureRoutes);


app.use('/api/favoris', favorisRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api', maintenanceRoutes); // /api/hebergements/:id/maintenance

// Route test
app.get('/', (req, res) => res.send('Bienvenue sur l’API Hôtel - PSAH'));

// Lancer le serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
}

export default app;
