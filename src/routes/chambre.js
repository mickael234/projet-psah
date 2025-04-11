import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/chambres/recherche:
 *   post:
 *     summary: Recherche des chambres disponibles selon les critères
 *     tags: [Chambres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date_arrivee
 *               - date_depart
 *               - prix_max
 *             properties:
 *               date_arrivee:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-01"
 *               date_depart:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-05"
 *               prix_max:
 *                 type: number
 *                 example: 150
 *               nb_personnes:
 *                 type: integer
 *                 example: 2
 *               equipements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wi-Fi", "Télévision"]
 *     responses:
 *       200:
 *         description: Liste des chambres disponibles
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur serveur
 */
router.post('/recherche', async (req, res) => {
  try {
    const { date_arrivee, date_depart, prix_max, nb_personnes, equipements = [] } = req.body;

    // Vérification des champs obligatoires
    if (!date_arrivee || !date_depart || !prix_max) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    // Requête principale avec Prisma
    let chambres = await prisma.chambre.findMany({
      where: {
        prix_par_nuit: { lte: prix_max },
        reservations: {
          none: {
            OR: [
              {
                date_arrivee: { lt: new Date(date_depart) },
                date_depart: { gt: new Date(date_arrivee) },
              },
            ],
          },
        },
        equipements: equipements.length > 0
          ? {
              some: {
                equipement: {
                  nom: { in: equipements },
                },
              },
            }
          : undefined,
      },
      include: {
        equipements: {
          include: {
            equipement: true,
          },
        },
      },
    });

    // Filtrage par nombre de personnes si demandé
    if (nb_personnes) {
      chambres = chambres.filter(chambre =>
        chambre.description?.toLowerCase().includes(`${nb_personnes} personne`)
      );
    }

    res.status(200).json(chambres);
  } catch (error) {
    console.error('Erreur POST /chambres/recherche :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
