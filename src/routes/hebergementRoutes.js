<<<<<<< HEAD
import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/chambres/recherche:
 *   get:
 *     summary: Recherche des chambres disponibles selon les critères
 *     tags: [Chambres]
 *     parameters:
 *       - in: query
 *         name: date_arrivee
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2025-05-01"
 *       - in: query
 *         name: date_depart
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2025-05-05"
 *       - in: query
 *         name: prix_max
 *         schema:
 *           type: number
 *         required: true
 *         example: 150
 *       - in: query
 *         name: nb_personnes
 *         schema:
 *           type: integer
 *         required: false
 *         example: 2
 *       - in: query
 *         name: equipements
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: false
 *         example: ["Wi-Fi", "Télévision"]
 *     responses:
 *       200:
 *         description: Liste des chambres disponibles
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur serveur
 */
router.get('/recherche', async (req, res) => {
  try {
    const {
      date_arrivee,
      date_depart,
      prix_max,
      nb_personnes,
      equipements,
    } = req.query;

    if (!date_arrivee || !date_depart || !prix_max) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    const parsedEquipements = equipements
      ? Array.isArray(equipements)
        ? equipements
        : [equipements]
      : [];

    let chambres = await prisma.chambre.findMany({
      where: {
        prix_par_nuit: { lte: parseFloat(prix_max) },
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
        equipements: parsedEquipements.length > 0
          ? {
              some: {
                equipement: {
                  nom: { in: parsedEquipements },
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

    if (nb_personnes) {
      chambres = chambres.filter(chambre =>
        chambre.description?.toLowerCase().includes(`${nb_personnes} personne`)
      );
    }

    res.status(200).json(chambres);
  } catch (error) {
    console.error('Erreur GET /chambres/recherche :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
=======
// src/routes/hebergementRoutes.js
import express from 'express';
import HebergementController from '../controllers/hebergementController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Routes publiques
router.get('/', HebergementController.getAllHebergements);
router.get('/search', HebergementController.searchAvailableHebergements);
router.get('/:id', HebergementController.getHebergementById);
router.get('/:id/availability', HebergementController.checkAvailability);

// Routes protégées (nécessitent une authentification)
router.post('/', authenticateJWT, HebergementController.createHebergement);
router.post('/:id/equipements', authenticateJWT, HebergementController.addEquipementToChambre);
router.put('/:id', authenticateJWT, HebergementController.updateHebergement);
router.delete('/:id', authenticateJWT, HebergementController.deleteHebergement);
router.delete('/:id/equipements/:equipementId', authenticateJWT, HebergementController.removeEquipementFromChambre)
router.put('/:id/tarifs', authenticateJWT, HebergementController.updatePriceHebergement);
router.put('/:id/disponibilite', authenticateJWT, HebergementController.updateAvailabilityHebergement)


// Routes pour les médias
router.post(
    '/:id/media',
    authenticateJWT,
    upload.single('media'),
    HebergementController.addMedia
);
router.delete(
    '/:id/media/:mediaId',
    authenticateJWT,
    HebergementController.removeMedia
);
>>>>>>> origin/hassan

export default router;
