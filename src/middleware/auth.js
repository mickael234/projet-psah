// src/middleware/auth.js
import jwt from 'jsonwebtoken';

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

export const isClient = (req, res, next) => {
    if (req.user.role !== 'CLIENT') {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Accès refusé. Rôle client requis.'
        });
    }

    next();
};
