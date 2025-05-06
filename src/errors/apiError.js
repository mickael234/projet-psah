class ApiError extends Error {
    constructor(statusCode, message, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errorCode = errorCode; // Un code d'erreur spécifique (ex: "RESSOURCE_NON_TROUVEE", "MAUVAISE_DEMANDE", etc.)
        this.isOperational = true; // Cette propriété est utilisée pour savoir si l'erreur est gérée ou non
    }
}

class NotFoundError extends ApiError {
    constructor(message = 'Ressource non trouvée') {
        super(404, message, 'RESSOURCE NON TROUVEE');
    }
}

class ValidationError extends ApiError {
    constructor(message = 'Données invalides') {
        super(400, message, 'MAUVAISE DEMANDE');
    }
}

class PermissionError extends ApiError {
    constructor(message = 'Permission refusée') {
        super(403, message, 'PERMISSION REFUSEE');
    }
}

class ConflictError extends ApiError {
    constructor(message = 'Conflit') {
        super(409, message, 'CONFLIT');
    }
}

class InternalServerError extends ApiError {
    constructor(message = 'Erreur interne du serveur') {
        super(500, message, 'ERREUR INTERNE');
    }
}

export { ApiError, NotFoundError, ValidationError, PermissionError, ConflictError, InternalServerError };