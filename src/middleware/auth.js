import jwt from 'jsonwebtoken';
import { RoleMapper } from '../utils/roleMapper.js';
import prisma from '../config/prisma.js';

/**
 * Middleware d'authentification JWT
 */
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            status: 'ERROR',
            message: 'Authentification requise'
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Token invalide ou expiré'
            });
        }

        req.user = user;
        next();
    });
};

/**
 * Middleware pour vérifier si l'utilisateur est un client
 */
export const isClient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'ERROR',
            message: 'Authentification requise'
        });
    }

    // Vérifier si le rôle est CLIENT ou si le rôle de base est 'client'
    if (
        req.user.role === 'CLIENT' ||
        RoleMapper.toBaseRole(req.user.role) === 'client'
    ) {
        next();
    } else {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès refusé. Rôle client requis.'
        });
    }
};

/**
 * Middleware pour vérifier les rôles
 * @param {Array<string>} roles - Liste des rôles autorisés
 */
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentification requise'
            });
        }

        // Utiliser le service RoleMapper pour vérifier les rôles
        if (RoleMapper.hasAuthorizedRole(req.user, roles)) {
            next();
        } else {
            res.status(403).json({
                status: 'ERROR',
                message: 'Accès non autorisé'
            });
        }
    };
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'ERROR',
            message: 'Authentification requise'
        });
    }

    // Vérifier si le rôle de base est 'administrateur'
    if (RoleMapper.toBaseRole(req.user.role) === 'administrateur') {
        next();
    } else {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès refusé. Rôle administrateur requis.'
        });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur est un membre du personnel
 */
export const isPersonnel = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'ERROR',
            message: 'Authentification requise'
        });
    }

    // Vérifier si le rôle de base est 'personnel' ou 'administrateur'
    const baseRole = RoleMapper.toBaseRole(req.user.role);
    if (baseRole === 'personnel' || baseRole === 'administrateur') {
        next();
    } else {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès refusé. Rôle personnel ou administrateur requis.'
        });
    }
};

/**
 * Middleware pour vérifier l'accès d'un client à ses propres informations.
 * Vérifie si l'utilisateur connecté est le client demandé ou un administrateur ayant des privilèges suffisants.
 *
 * @param {Object} req - Requête contenant les informations de l'utilisateur connecté et les paramètres de la requête.
 * @param {Object} res -Réponse pour renvoyer les données ou les erreurs.
 * @param {Function} next - Fonction pour passer au middleware suivant si l'accès est autorisé.
 * @returns {void}
 */
export const checkClientAccess = async (req, res, next) => {
    try {
        const role = req.user.role;
        const clientId = Number(req.params.clientId);

        if (isNaN(clientId)) {
            return res.status(400).json({
                status: 'BAD REQUEST',
                message: "L'id du client n'est pas valide."
            });
        }

        // Si l'utilisateur est un super administrateur ou un administrateur général ou un réceptionniste, l'accès est autorisé
        if (RoleMapper.toBaseRole(role) === 'administrateur' || 
            RoleMapper.toBaseRole(role) === 'personnel') {
            return next();
        }

        // Trouver l'utilisateur correspondant à l'email de l'utilisateur connecté
        const utilisateur = await prisma.utilisateur.findUnique({
            where: { email: req.user.email },
            select: { id_utilisateur: true }
        });

        if (!utilisateur) {
            return res.status(404).json({
                status: 'NOT FOUND',
                message: 'Aucun utilisateur trouvé'
            });
        }

        // Trouver le client ayant l'ID spécifié dans la requête
        const client = await prisma.client.findUnique({
            where: { id_client: clientId },
            select: { id_utilisateur: true }
        });

        if (!client) {
            return res.status(404).json({
                status: 'NOT FOUND',
                message: 'Client non trouvé'
            });
        }

        // Si l'ID de l'utilisateur connecté ne correspond pas à l'ID du client, accès refusé
        if (client.id_utilisateur !== utilisateur.id_utilisateur) {
            return res.status(403).json({
                status: 'FORBIDDEN',
                message: 'Accès non autorisé'
            });
        }

        // Passer au endpoint si l'accès est autorisé
        next();
    } catch (error) {
        console.error('Erreur dans checkClientAccess : ', error);
        res.status(500).json({
            status: 'INTERNAL SERVER ERROR',
            message:
                "Une erreur interne est survenue lors de la vérification des droits d'accès."
        });
    }
};


/**
 * Middleware pour vérifier l'accès d'un client à ses propres avis.
 * Vérifie si l'utilisateur connecté est le client demandé ou un administrateur ayant des privilèges suffisants.
 *
 * @param {Object} req - Requête contenant les informations de l'utilisateur connecté et les paramètres de la requête.
 * @param {Object} res - Réponse pour renvoyer les données ou les erreurs.
 * @param {Function} next - Fonction pour passer au middleware suivant si l'accès est autorisé.
 * @returns {void}
 */

export const verifyClientAccessToReservation = async (req, res, next) => {
    const role = req.user.role;
    const userEmail = req.user?.email;
    const reservationId = parseInt(req.params.idReservation);

    // Si l'utilisateur est un super administrateur ou un administrateur général ou un réceptionniste, l'accès est autorisé
    if (RoleMapper.toBaseRole(role) === 'administrateur' || RoleMapper.toBaseRole(role) === 'personnel') {
        return next();
    }

    try {
        // Récupère l'utilisateur depuis la table `Utilisateur` avec la relation vers `Client`
        const utilisateur = await prisma.utilisateur.findUnique({
            where: { email: userEmail },
            include: { client: true },
        });

        // Vérifie que l'utilisateur est bien associé à un client
        if (!utilisateur?.client) {
            return res.status(403).json({
                status: "ACCÈS REFUSÉ",
                message: "Aucun client associé à cet utilisateur."
            });
        }

        // Récupère la réservation visée dans la requête
        const reservation = await prisma.reservation.findUnique({
            where: { id_reservation: reservationId },
            select: { id_client: true }
        });

        // Vérifie que la réservation existe
        if (!reservation) {
            return res.status(404).json({
                status: "RESSOURCE NON TROUVÉE",
                message: "Réservation introuvable."
            });
        }

        // Vérifie que la réservation appartient bien au client connecté
        if (reservation.id_client !== utilisateur.client.id_client) {
            return res.status(403).json({
                status: "ACCÈS REFUSÉ",
                message: "Vous n'avez pas accès à cette réservation."
            });
        }

        // Attache les infos du client à la requête pour usage ultérieur
        req.client = utilisateur.client;

        // Passer au endpoint si l'accès est autorisé
        next();
    } catch (error) {
        console.error('Erreur middleware accès client/réservation :', error);
        res.status(500).json({
            status: "ERREUR SERVEUR",
            message: "Erreur lors de la vérification de l'accès à la réservation."
        });
    }
};
