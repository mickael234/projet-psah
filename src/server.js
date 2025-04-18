import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

//  Corriger __dirname avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Import des routes
import chambreRoutes from './routes/chambre.js';
import authRoutes from './routes/authRoutes.js';
import favorisRoutes from './routes/favorisRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//  Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Déclaration des routes
app.use('/api/auth', authRoutes);
app.use('/api/chambres', chambreRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reservations', reservationRoutes);

//  Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Hôtel',
      version: '1.0.0',
      description: 'Documentation de l’API pour le projet PSAH',
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//  Route test
app.get('/', (req, res) => res.send('API Hôtel en ligne '));

// Lancer le serveur
app.listen(PORT, () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
});
