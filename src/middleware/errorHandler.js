/**
 * Middleware global de gestion des erreurs
 * Capture toutes les erreurs levées via `next(error)`
 * et renvoie une réponse JSON standardisée
 */
export function errorHandler(err, req, res, next) {
    // Erreurs métier avec code (ex : ValidationError, NotFoundError, etc.)
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: err.errorCode || 'ERROR',
        message: err.message
      });
    }
  
    // Erreurs Prisma
    if (err.code && err.code.startsWith('Prisma')) {
      console.error('[Prisma Error]', err);
      return res.status(500).json({
        status: 'DATABASE_ERROR',
        message: 'Une erreur interne liée à la base de données est survenue.'
      });
    }
  
    // Erreurs non prévues
    console.error('[Unhandled Error]', err);
    return res.status(500).json({
      status: 'INTERNAL_SERVER_ERROR',
      message: 'Une erreur interne est survenue.'
    });
  }
  