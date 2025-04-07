// src/routes/chambre.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/disponibles', async (req, res) => {
  const { date_arrivee, date_depart, nb_personnes, prix_max } = req.query;

  if (!date_arrivee || !date_depart || !nb_personnes || !prix_max) {
    return res.status(400).json({ error: 'Tous les paramètres sont requis.' });
  }

  try {
    const chambres = await prisma.chambre.findMany({
      where: {
        prix_par_nuit: {
          lte: parseFloat(prix_max),
        },
        etat: 'disponible',
        reservations: {
          none: {
            date_arrivee: {
              lte: new Date(date_depart),
            },
            date_depart: {
              gte: new Date(date_arrivee),
            }
          }
        }
      },
      include: {
        medias: true,
        equipements: {
          include: {
            equipement: true
          }
        }
      }
    });

    res.json(chambres);
  } catch (error) {
    console.error('❌ Erreur Prisma :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chambres.' });
  }
});

export default router;
