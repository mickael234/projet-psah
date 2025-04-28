import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chambreRoutes from './routes/chambre.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route => attention au préfixe
app.use('/chambres', chambreRoutes);

// Test route
app.get('/', (req, res) => res.send('API Hôtel en ligne '));

// Start server
app.listen(PORT, () => {
  console.log(` Serveur lancé sur http://localhost:${PORT}`);
});
