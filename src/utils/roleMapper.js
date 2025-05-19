/**
 * Service utilitaire pour gérer le mapping des rôles
 */
class RoleMapper {
    /**
     * Table de correspondance entre les rôles spécifiques et les rôles de base
     * @private
     */
    static roleMapping = {
      SUPER_ADMIN: "administrateur",
      ADMIN_GENERAL: "administrateur",
      RESPONSABLE_HEBERGEMENT: "personnel",
      RECEPTIONNISTE: "personnel",
      PROPRIETAIRE: "personnel",
      MAINTENANCE: "personnel",
      CLIENT: "client",
      CHAUFFEUR: "personnel",
      COMPTABILITE: "personnel",
    }
  
    /**
     * Convertit un rôle spécifique en rôle de base
     * @param {string} role - Rôle spécifique (ex: 'SUPER_ADMIN')
     * @returns {string} - Rôle de base correspondant (ex: 'administrateur')
     */
    static toBaseRole(role) {
      return this.roleMapping[role] || "client" // Par défaut, retourne 'client'
    }
  
    /**
     * Alias pour toBaseRole pour maintenir la compatibilité
     * @param {string} role - Rôle spécifique
     * @returns {string} - Rôle de base (RoleUtilisateur)
     */
    static toRoleUtilisateur(role) {
      return this.toBaseRole(role)
    }
  
    /**
     * Vérifie si un utilisateur a un rôle autorisé
     * @param {Object} user - Utilisateur avec un attribut role
     * @param {Array<string>} authorizedRoles - Liste des rôles autorisés
     * @returns {boolean} - True si l'utilisateur a un rôle autorisé
     */
    static hasAuthorizedRole(user, authorizedRoles) {
      // Vérifier si le rôle exact est dans la liste
      if (authorizedRoles.includes(user.role)) {
        return true;
      }
      
      // Vérifier si le code du rôle est dans la liste
      if (user.roleCode && authorizedRoles.includes(user.roleCode)) {
        return true;
      }
      
      // Vérifier les correspondances de base
      const baseRole = this.toBaseRole(user.role);
      
      for (const role of authorizedRoles) {
        // Convertir le rôle autorisé en rôle de base pour la comparaison
        const authorizedBaseRole = this.toBaseRole(role);
        
        // Log pour débogage
        console.log(`Comparaison: ${baseRole} avec ${authorizedBaseRole} (de ${role})`);
        
        if (baseRole === authorizedBaseRole) {
          return true;
        }
        
        // Vérification spéciale pour administrateur
        if (baseRole === "administrateur" && 
            (role === "ADMIN_GENERAL" || role === "SUPER_ADMIN")) {
          return true;
        }
      }
      
      return false;
    }
    
  
    /**
     * Obtient tous les rôles spécifiques correspondant à un rôle de base
     * @param {string} baseRole - Rôle de base (ex: 'administrateur')
     * @returns {Array<string>} - Liste des rôles spécifiques correspondants
     */
    static getSpecificRoles(baseRole) {
      return Object.entries(this.roleMapping)
        .filter(([_, value]) => value === baseRole)
        .map(([key, _]) => key)
    }
  
    /**
     * Vérifie si un rôle spécifique correspond à un rôle de base
     * @param {string} specificRole - Rôle spécifique (ex: 'SUPER_ADMIN')
     * @param {string} baseRole - Rôle de base (ex: 'administrateur')
     * @returns {boolean} - True si le rôle spécifique correspond au rôle de base
     */
    static matchesBaseRole(specificRole, baseRole) {
      return this.toBaseRole(specificRole) === baseRole
    }
  }
  
  // Exporter la classe RoleMapper
  export { RoleMapper }
  