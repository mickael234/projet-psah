import prisma from "../config/prisma.js"

class PreferenceUtilisateurModel {
  /**
   * Récupère une préférence utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {string} type - Type de préférence
   * @returns {Promise<Object>} - La préférence trouvée
   */
  static async getPreference(userId, type) {
    return prisma.preferenceUtilisateur.findFirst({
      where: {
        id_utilisateur: userId,
        type_preference: type,
      },
    })
  }

  /**
   * Récupère toutes les préférences d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des préférences
   */
  static async getAllPreferences(userId) {
    return prisma.preferenceUtilisateur.findMany({
      where: {
        id_utilisateur: userId,
      },
    })
  }

  /**
   * Récupère les préférences d'un utilisateur par type
   * @param {number} userId - ID de l'utilisateur
   * @param {string} typePrefix - Préfixe du type de préférence
   * @returns {Promise<Array>} - Liste des préférences
   */
  static async getPreferencesByType(userId, typePrefix) {
    return prisma.preferenceUtilisateur.findMany({
      where: {
        id_utilisateur: userId,
        type_preference: {
          startsWith: typePrefix,
        },
      },
    })
  }

  /**
   * Crée ou met à jour une préférence utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {string} type - Type de préférence
   * @param {string} value - Valeur de la préférence
   * @returns {Promise<Object>} - La préférence créée ou mise à jour
   */
  static async setPreference(userId, type, value) {
    // Vérifier si la préférence existe déjà
    const existingPref = await this.getPreference(userId, type)

    if (existingPref) {
      // Mettre à jour la préférence existante
      return prisma.preferenceUtilisateur.update({
        where: { id: existingPref.id },
        data: { valeur: value },
      })
    } else {
      // Créer une nouvelle préférence
      return prisma.preferenceUtilisateur.create({
        data: {
          id_utilisateur: userId,
          type_preference: type,
          valeur: value,
        },
      })
    }
  }

  /**
   * Supprime une préférence utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {string} type - Type de préférence
   * @returns {Promise<Object>} - La préférence supprimée
   */
  static async deletePreference(userId, type) {
    const preference = await this.getPreference(userId, type)
    if (!preference) {
      return null
    }

    return prisma.preferenceUtilisateur.delete({
      where: { id: preference.id },
    })
  }

  /**
   * Récupère les informations de facturation d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Informations de facturation
   */
  static async getBillingInfo(userId) {
    const billingPreferences = await this.getPreferencesByType(userId, "facturation_")

    // Convertir les préférences en objet
    const billingInfo = {}
    billingPreferences.forEach((pref) => {
      const key = pref.type_preference.replace("facturation_", "")
      billingInfo[key] = pref.valeur
    })

    return billingInfo
  }

  /**
   * Met à jour les informations de facturation d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} billingData - Données de facturation
   * @returns {Promise<Object>} - Informations de facturation mises à jour
   */
  static async updateBillingInfo(userId, billingData) {
    // Supprimer les préférences existantes liées à la facturation
    await prisma.preferenceUtilisateur.deleteMany({
      where: {
        id_utilisateur: userId,
        type_preference: {
          startsWith: "facturation_",
        },
      },
    })

    // Créer les nouvelles préférences
    const preferences = [
      { type_preference: "facturation_adresse", valeur: billingData.address },
      { type_preference: "facturation_ville", valeur: billingData.city },
      { type_preference: "facturation_code_postal", valeur: billingData.postalCode },
      { type_preference: "facturation_pays", valeur: billingData.country },
      { type_preference: "facturation_nom", valeur: billingData.billingName },
      { type_preference: "facturation_tva", valeur: billingData.vatNumber },
    ]

    // Insérer les préférences
    for (const pref of preferences) {
      if (pref.valeur) {
        await prisma.preferenceUtilisateur.create({
          data: {
            id_utilisateur: userId,
            type_preference: pref.type_preference,
            valeur: pref.valeur,
          },
        })
      }
    }

    // Récupérer et retourner toutes les préférences de facturation
    return this.getBillingInfo(userId)
  }

  /**
   * Récupère les préférences de sécurité d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Préférences de sécurité
   */
  static async getSecurityPreferences(userId) {
    const securityPreferences = await this.getPreferencesByType(userId, "securite_")

    // Convertir les préférences en objet
    const securitySettings = {}
    securityPreferences.forEach((pref) => {
      const key = pref.type_preference.replace("securite_", "")
      securitySettings[key] = pref.valeur
    })

    return securitySettings
  }
}

export default PreferenceUtilisateurModel
