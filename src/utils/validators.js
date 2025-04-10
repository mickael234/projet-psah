/**
 * Valide un numéro de téléphone au format international
 * @param {string} phoneNumber - Numéro de téléphone à valider
 * @returns {boolean} - True si le numéro est valide
 */
export const validatePhoneNumber = (phoneNumber) => {
    // Regex pour valider un numéro de téléphone international
    // Format: +[code pays][numéro]
    // Exemple: +33612345678
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
  }
  
  /**
   * Extrait le code pays d'un numéro de téléphone
   * @param {string} phoneNumber - Numéro de téléphone au format international
   * @returns {string|null} - Code pays ou null si invalide
   */
  export const extractCountryCode = (phoneNumber) => {
    if (!validatePhoneNumber(phoneNumber)) return null
  
    // Extraire le code pays (tout après le + jusqu'au premier chiffre du numéro national)
    const match = phoneNumber.match(/^\+(\d+)/)
    return match ? match[1] : null
  }
  
  /**
   * Extrait le numéro national d'un numéro de téléphone
   * @param {string} phoneNumber - Numéro de téléphone au format international
   * @returns {string|null} - Numéro national ou null si invalide
   */
  export const extractNationalNumber = (phoneNumber) => {
    if (!validatePhoneNumber(phoneNumber)) return null
  
    // Extraire le numéro national (tout après le code pays)
    // Cette logique est simplifiée et pourrait nécessiter des ajustements selon les pays
    const countryCode = extractCountryCode(phoneNumber)
    if (!countryCode) return null
  
    return phoneNumber.substring(countryCode.length + 1) // +1 pour le caractère '+'
  }
  
  /**
   * Valide un nom (ne doit pas contenir de chiffres)
   * @param {string} name - Nom à valider
   * @returns {boolean} - True si le nom est valide
   */
  export const validateName = (name) => {
    // Regex pour vérifier qu'un nom ne contient pas de chiffres
    const nameRegex = /^[^\d]+$/
    return nameRegex.test(name)
  }
  