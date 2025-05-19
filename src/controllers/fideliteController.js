import { PrismaClient } from '@prisma/client';
import FideliteModel from '../models/fidelite.model.js';

const prisma = new PrismaClient();
const fideliteModel = new FideliteModel();

/**
 * ✅ Voir le compte fidélité (solde + transactions + échanges) d'un client
 */
export const getFideliteClient = async (req, res) => {
    try {
        const clientId = Number(req.params.clientId);

        const fidelite = await FideliteModel.findByClient(clientId);
        if (!fidelite) {
            return res.status(404).json({ message: 'Compte fidélité non trouvé' });
        }

        const fullFidelite = await FideliteModel.getWithRelations(fidelite.id_fidelite);
        res.json(fullFidelite);

    } catch (error) {
        console.error('Erreur getFideliteClient :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

/**
 * ✅ Voir l'historique des transactions fidélité d'un client
 */
export const historiqueFidelite = async (req, res) => {
    try {
        const clientId = Number(req.params.clientId);

        const historique = await fideliteModel.getTransactions(clientId);
        res.json(historique);

    } catch (error) {
        console.error('Erreur historiqueFidelite :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

/**
 * ✅ Ajouter des points à un client (réservé admin)
 */
export const attribuerPoints = async (req, res) => {
    try {
        const { id_client, points, raison } = req.body;

        if (!id_client || !points || !raison) {
            return res.status(400).json({ message: 'id_client, points et raison requis' });
        }

        const updatedFidelite = await fideliteModel.addPoints(id_client, points, raison);
        res.json({ message: `${points} points ajoutés`, fidelite: updatedFidelite });

    } catch (error) {
        console.error('Erreur attribuerPoints :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

/**
 * ✅ Voir le classement des meilleurs clients fidélité (top 10)
 */
export const classementFidelite = async (req, res) => {
    try {
        const classement = await prisma.fidelite.findMany({
            orderBy: { solde_points: 'desc' },
            take: 10,
            include: {
                client: { select: { prenom: true, nom: true } }
            }
        });

        res.json(classement);

    } catch (error) {
        console.error('Erreur classementFidelite :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

/**
 * ✅ Attribution automatique de points lors d'une réservation confirmée
 * (Appelée depuis reservationController)
 */
export const attributionAutoReservation = async (id_client, date_arrivee, date_depart) => {
    try {
        const dateA = new Date(date_arrivee);
        const dateD = new Date(date_depart);
        const nbNuits = Math.ceil((dateD - dateA) / (1000 * 60 * 60 * 24));
        const pointsGagnes = nbNuits * 10;

        await fideliteModel.addPoints(id_client, pointsGagnes, 'Réservation confirmée');

    } catch (error) {
        console.error('Erreur attributionAutoReservation :', error);
        throw new Error('Erreur attribution des points fidélité');
    }
};
