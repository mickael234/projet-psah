import { authenticateJWT } from '../middleware/auth.js';
import ReservationModel from '../models/reservation.model.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ReservationController {
    /**
     * Récupère toutes les réservations passées d'un client.
     *
     * @param {Express.Request} req - Requête contenant `clientId` dans les paramètres.
     * @param {Express.Response} res - Réponse pour renvoyer les données ou les erreurs.
     * @returns {Promise<void>}
     */
    static async getAllUserPastReservations(req, res) {
        try {
            const clientId = Number(req.params.clientId);

            const reservations =
                await ReservationModel.findAllPastReservations(clientId);
            if (!reservations) {
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucune réservation passée n'a été trouvé"
                });
            }

            res.status(200).json({
                status: 'OK',
                data: {
                    reservations
                }
            });
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }

    /**
     * Récupère toutes les réservations actuelles d'un client.
     * @param {Express.Request} req - Requête contenant `clientId` dans les paramètres.
     * @param {Express.Response} res - Réponse pour renvoyer les données ou les erreurs.
     * @returns {Promise<void>}
     */
    static async getAllUserPresentReservations(req, res) {
        try {
            const clientId = Number(req.params.clientId);

            const reservations =
                await ReservationModel.findAllPresentReservations(clientId);
            if (!reservations) {
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucune réservation actuelle n'a été trouvé"
                });
            }

            res.status(200).json({
                status: 'OK',
                data: {
                    reservations
                }
            });
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }
}

/**
 * Vérifie que le clientId est un nombre valide et que l'utilisateur authentifié correspond bien au client ciblé.
 *
 * @type {Express.RequestHandler[]}
 */
export const clientAuth = [
    authenticateJWT,

    /**
     * Vérifie l'identité du client et l'association avec l'utilisateur authentifié.
     *
     * @param {Express.Request} req - Requête contenant `clientId` dans les paramètres.
     * @param {Express.Response} res - Réponse pour envoyer les erreurs le cas échéant.
     * @param {Express.NextFunction} next - Fonction suivante dans la chaîne de middleware.
     * @returns {Promise<void>}
     */
    async (req, res, next) => {
        const clientId = Number(req.params.clientId);

        if (isNaN(clientId)) {
            return res.status(400).json({
                status: 'BAD REQUEST',
                message: "L'id du client n'est pas valide."
            });
        }

        try {
            const client = await prisma.client.findUnique({
                where: { id_client: clientId },
                select: { id_utilisateur: true }
            });

            if (!client || client.id_utilisateur !== req.user.id) {
                return res.status(403).json({
                    status: 'FORBIDDEN',
                    message: 'Accès non autorisé.'
                });
            }

            next();
        } catch (error) {
            console.error('Une erreur interne est survenue: ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }
];

export default ReservationController;
