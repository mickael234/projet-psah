import express from 'express';
import {
    getFideliteClient,
    attribuerPoints,
    historiqueFidelite,
    classementFidelite
} from '../controllers/fideliteController.js';

import {
    authenticateJWT,
    isClient,
    isAdmin,
    checkClientAccess
} from '../middleware/auth.js';

const router = express.Router();

// ✅ Client connecté peut voir son solde fidélité
router.get(
    '/clients/:clientId/fidelite',
    authenticateJWT,
    isClient,
    checkClientAccess,
    getFideliteClient
);

// ✅ Client connecté peut voir son historique fidélité
router.get(
    '/clients/:clientId/fidelite/historique',
    authenticateJWT,
    isClient,
    checkClientAccess,
    historiqueFidelite
);

// ✅ Admin uniquement : attribution manuelle de points
router.post(
    '/fidelite/points/attribution',
    authenticateJWT,
    isAdmin,
    attribuerPoints
);

// ✅ Classement public
router.get('/fidelite/classement', classementFidelite);

export default router;  
