import { ApiError } from "../errors/apiError.js"

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // Si l'erreur est une instance de ApiError, on envoie la réponse appropriée
        return res.status(err.statusCode).json({
            status: err.errorCode,  // Utilisation du code d'erreur spécifique
            message: err.message,    // Message d'erreur détaillé
        });
    }

    // Sinon, c'est une erreur interne du serveur
    console.error(err);  // Log de l'erreur 

    return res.status(500).json({
        status: 'ERREUR_INTERNE',  // Code d'erreur générique pour erreur serveur
        message: 'Une erreur interne du serveur est survenue',
    });
};

export default errorHandler;
