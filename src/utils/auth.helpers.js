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
 * Vérifie qu’un utilisateur est bien un membre du personnel autorisé à conduire.
 * 
 * Cette fonction lève une exception si :
 * - l'utilisateur n'est pas rattaché à un personnel ;
 * - le compte est désactivé (`est_actif = false`) ;
 * - les documents ne sont pas validés (`documents_verifies = false`) ;
 * - le permis est expiré (`date_expiration_permis < today`).
 * 
 * @param {string} userEmail - Email de l'utilisateur connecté
 * @returns {Promise<number>} - L'ID du personnel si toutes les conditions sont respectées
 * @throws {PermissionError} - Si une des conditions de sécurité n'est pas remplie
 */

export async function assertChauffeurAutorise(userEmail) {
    const utilisateur = await prisma.utilisateur.findUnique({
        where: { email: userEmail },
        include: { personnel: true }
    });

    const personnel = utilisateur?.personnel;

    if (!personnel) {
        throw new PermissionError("Accès refusé : vous n'êtes pas un membre du personnel.");
    }

    if (!personnel.est_actif) {
        throw new PermissionError("Votre compte est désactivé.");
    }

    if (!personnel.documents_verifies) {
        throw new PermissionError("Vos documents ne sont pas encore validés.");
    }

    if (new Date(personnel.date_expiration_permis) < new Date()) {
        throw new PermissionError("Votre permis est expiré.");
    }

    return personnel.id_personnel;
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
