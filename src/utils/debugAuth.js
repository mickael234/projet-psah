/**
 * Utilitaire de débogage pour l'authentification
 */

/**
 * Vérifie le format du token d'autorisation
 * @param {string} authHeader - En-tête d'autorisation
 * @returns {Object} - Résultat de la vérification
 */
export const debugAuthHeader = (authHeader) => {
    console.log("=== DÉBOGAGE AUTHENTIFICATION ===")
    console.log("En-tête d'autorisation reçu:", authHeader ? "Présent" : "Absent")
  
    if (!authHeader) {
      return {
        valid: false,
        message: "En-tête d'autorisation manquant",
      }
    }
  
    const parts = authHeader.split(" ")
    console.log("Parties de l'en-tête:", parts.length)
  
    if (parts.length !== 2) {
      return {
        valid: false,
        message: "Format incorrect: l'en-tête devrait avoir 2 parties",
      }
    }
  
    if (parts[0] !== "Bearer") {
      return {
        valid: false,
        message: "Type d'authentification incorrect: devrait être 'Bearer'",
      }
    }
  
    const token = parts[1]
    console.log("Token trouvé (premiers caractères):", token.substring(0, 20) + "...")
  
    return {
      valid: true,
      token,
      message: "Format d'en-tête valide",
    }
  }
  
  /**
   * Vérifie si le JWT_SECRET est correctement configuré
   * @returns {boolean} - True si le secret est configuré
   */
  export const checkJwtSecret = () => {
    const secret = process.env.JWT_SECRET
    console.log("JWT_SECRET:", secret ? "Défini" : "Non défini")
  
    if (!secret) {
      console.error("ERREUR: JWT_SECRET n'est pas défini dans les variables d'environnement")
      return false
    }
  
    if (secret.length < 32) {
      console.warn("AVERTISSEMENT: JWT_SECRET est court, il devrait idéalement avoir au moins 32 caractères")
    }
  
    return true
  }
  