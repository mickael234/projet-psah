class ValidationService {
    /**
     * Valide une période de dates à partir des paramètres de requête
     * @param {Object} queryParams - Paramètres de requête contenant dateDebut et dateFin
     * @returns {Object} - Résultat de la validation avec les dates parsées ou une erreur
     */
    static validateDatePeriod(queryParams) {
        const { dateDebut, dateFin } = queryParams;
        
        // Validation des paramètres obligatoires
        if (!dateDebut || !dateFin) {
            return {
                error: true,
                message: 'Les paramètres dateDebut et dateFin sont obligatoires.'
            };
        }
        
        // Conversion des dates
        const dateDebutObj = new Date(dateDebut);
        const dateFinObj = new Date(dateFin);
        
        // Validation du format des dates
        if (isNaN(dateDebutObj.getTime()) || isNaN(dateFinObj.getTime())) {
            return {
                error: true,
                message: 'Les dates doivent être au format YYYY-MM-DD.'
            };
        }
        
        // Validation de l'ordre des dates
        if (dateDebutObj > dateFinObj) {
            return {
                error: true,
                message: 'La date de début doit être antérieure à la date de fin.'
            };
        }
        
        // Validation de la durée maximale (1 an)
        const unAn = 365 * 24 * 60 * 60 * 1000;
        if (dateFinObj - dateDebutObj > unAn) {
            return {
                error: true,
                message: 'La période ne peut pas dépasser 1 an.'
            };
        }
        
        // Retourne les objets Date pour utilisation
        return {
            error: false,
            dateDebutObj,
            dateFinObj
        };
    }
    
    /**
     * Formate les informations de période pour l'affichage
     * @param {Object} periode - Objet contenant les informations de période
     * @returns {Object} - Informations de période formatées
     */
    static formatPeriode(periode) {
        const debutFormate = new Date(periode.dateDebut).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        const finFormate = new Date(periode.dateFin).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        return {
            texte: `Du ${debutFormate} au ${finFormate}`,
            debut: debutFormate,
            fin: finFormate,
            nbJours: periode.nbJours
        };
    }
}

export default ValidationService;