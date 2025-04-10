/**
 * Service utilitaire pour gérer le mapping des rôles
 */
class RoleMapper {
    /**
     * Table de correspondance entre les rôles spécifiques et les rôles de base
     * @private
     */
    static roleMapping = {
        SUPER_ADMIN: 'administrateur',
        ADMIN_GENERAL: 'administrateur',
        RESPONSABLE_HEBERGEMENT: 'personnel',
        RECEPTIONNISTE: 'personnel',
        PROPRIETAIRE: 'personnel',
        MAINTENANCE: 'personnel',
        CLIENT: 'client',
        CHAUFFEUR: 'personnel',
        COMPTABILITE: 'personnel'
    };

    /**
     * Convertit un rôle spécifique en rôle de base
     * @param {string} role - Rôle spécifique (ex: 'SUPER_ADMIN')
     * @returns {string} - Rôle de base correspondant (ex: 'administrateur')
     */
    static toBaseRole(role) {
        return this.roleMapping[role] || 'client'; // Par défaut, retourne 'client'
    }

    /**
     * Vérifie si un utilisateur a un rôle autorisé
     * @param {Object} user - Utilisateur avec un attribut role
     * @param {Array<string>} authorizedRoles - Liste des rôles autorisés
     * @returns {boolean} - True si l'utilisateur a un rôle autorisé
     */
    static hasAuthorizedRole(user, authorizedRoles) {
        if (!user || !user.role) return false;

        // Vérifier si le rôle spécifique est directement autorisé
        if (authorizedRoles.includes(user.role)) return true;

        // Vérifier si le rôle de base est autorisé
        const baseRole = this.toBaseRole(user.role);
        return authorizedRoles.includes(baseRole);
    }

    /**
     * Obtient tous les rôles spécifiques correspondant à un rôle de base
     * @param {string} baseRole - Rôle de base (ex: 'administrateur')
     * @returns {Array<string>} - Liste des rôles spécifiques correspondants
     */
    static getSpecificRoles(baseRole) {
        return Object.entries(this.roleMapping)
            .filter(([_, value]) => value === baseRole)
            .map(([key, _]) => key);
    }

    /**
     * Vérifie si un rôle spécifique correspond à un rôle de base
     * @param {string} specificRole - Rôle spécifique (ex: 'SUPER_ADMIN')
     * @param {string} baseRole - Rôle de base (ex: 'administrateur')
     * @returns {boolean} - True si le rôle spécifique correspond au rôle de base
     */
    static matchesBaseRole(specificRole, baseRole) {
        return this.toBaseRole(specificRole) === baseRole;
    }
}

// Exporter la classe RoleMapper
export { RoleMapper };
