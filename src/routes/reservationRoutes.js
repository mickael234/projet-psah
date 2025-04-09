import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import { clientAuth } from '../controllers/reservationController.js';

const reservationRouter = express.Router();

/**
 * @route GET /actuelles/:clientId
 * @group Réservations - Récupération des réservations actuelles d'un client
 * @param {number} clientId.path.required - ID du client pour lequel récupérer les réservations
 * @returns {object} 200 - Liste des réservations actuelles
 * @returns {object} 400 - Requête invalide si l'ID est incorrect
 * @returns {object} 403 - Accès interdit si l'utilisateur n'est pas autorisé
 * @returns {object} 404 - Aucune réservation trouvée
 * @returns {object} 500 - Erreur serveur
 * @middleware clientAuth - Vérifie que l'utilisateur a le droit d'accéder aux données du client
 */
reservationRouter.get(
    '/actuelles/:clientId',
    clientAuth,
    ReservationController.getAllUserPresentReservations
);

/**
 * @route GET /passees/:clientId
 * @group Réservations - Récupération des réservations passées d'un client
 * @param {number} clientId.path.required - ID du client pour lequel récupérer les réservations
 * @returns {object} 200 - Liste des réservations passées
 * @returns {object} 400 - Requête invalide si l'ID est incorrect
 * @returns {object} 403 - Accès interdit si l'utilisateur n'est pas autorisé
 * @returns {object} 404 - Aucune réservation trouvée
 * @returns {object} 500 - Erreur serveur
 * @middleware clientAuth - Vérifie que l'utilisateur a le droit d'accéder aux données du client
 */
reservationRouter.get(
    '/passees/:clientId',
    clientAuth,
    ReservationController.getAllUserPastReservations
);

export default reservationRouter;
