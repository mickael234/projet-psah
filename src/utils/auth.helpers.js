import prisma from '../config/prisma.js';
import { PermissionError, NotFoundError } from '../errors/apiError.js';
import TicketSupportService from '../services/ticketSupport.service.js';

/**
 * Récupère l’ID du client lié à un utilisateur connecté.
 *
 * @param {string} userEmail - Email du User connecté (JWT)
 * @returns {Promise<number>} - ID du client
 * @throws {ForbiddenError} - Si l’utilisateur n’est pas un client
 */
export async function getClientIdFromUser(userEmail) {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { email: userEmail },
        include: { client: true }
    });

    if (!utilisateur?.client) {
        throw new PermissionError("Accès refusé : vous n'êtes pas un client.");
    }

    return utilisateur.client.id_client;
}

/**
 * Récupère l’ID du personnel lié à un utilisateur connecté.
 *
 * @param {string} userEmail - Email du User connecté (JWT)
 * @returns {Promise<number>} - ID du personnel
 * @throws {ForbiddenError} - Si l’utilisateur n’est pas un personnel
 */
export async function getPersonnelIdFromUser(userEmail) {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { email: userEmail },
        include: { personnel: true }
    });

    if (!utilisateur?.personnel) {
        throw new PermissionError(
            "Accès refusé : vous n'êtes pas un membre du personnel."
        );
    }

    return utilisateur.personnel.id_personnel;
}

/**
 * Vérifie qu’un ticket appartient bien au client connecté.
 *
 * @param {number} ticketId - ID du ticket
 * @param {string} userEmail - Email du user connecté
 * @returns {Promise<Object>} - Le ticket autorisé
 * @throws {ForbiddenError | NotFoundError}
 */
export async function checkTicketBelongsToClient(ticketId, userEmail) {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { email: userEmail },
        include: { client: true }
    });

    if (!utilisateur?.client) {
        throw new PermissionError("Accès refusé : vous n'êtes pas un client.");
    }

    const clientId = utilisateur.client.id_client;

    const ticket = await TicketSupportService.getTicketById(ticketId);
    if (!ticket) {
        throw new NotFoundError("Le ticket n'existe pas.");
    }

    if (ticket.id_client !== clientId) {
        throw new PermissionError('Ce ticket ne vous appartient pas.');
    }

    return ticket;
}
