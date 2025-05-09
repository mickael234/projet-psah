// src/models/profile.js
import prisma from "../config/prisma.js";
import { validateName } from "../utils/validators.js"
import UtilisateurModel from "./utilisateur.model.js"
import PreferenceUtilisateurModel from "./preference-utilisateur.model.js"



class Profile {
  /**
   * Récupère le profil d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Le profil de l'utilisateur
   */
  static async getProfile(userId) {
    const utilisateur = await UtilisateurModel.trouverParId(userId)

    // Ajouter le téléphone au profil s'il existe dans client ou personnel
    if (utilisateur) {
      if (utilisateur.client && utilisateur.client.telephone) {
        utilisateur.telephone = utilisateur.client.telephone
      } else if (utilisateur.personnel && utilisateur.personnel.telephone) {
        utilisateur.telephone = utilisateur.personnel.telephone
      }
      
      // Ajouter les informations de facturation
      utilisateur.billingInfo = await PreferenceUtilisateurModel.getBillingInfo(userId);
    }

    return utilisateur
  }

  /**
   * Met à jour le profil d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} userData - Données du profil
   * @returns {Promise<Object>} - Le profil mis à jour
   */
  static async updateProfile(userId, userData) {
    return UtilisateurModel.mettreAJour(userId, userData)
  }

  /**
   * Met à jour la photo de profil d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {string} photoUrl - URL de la photo
   * @returns {Promise<Object>} - Le profil mis à jour
   */
  static async updateProfilePhoto(userId, photoUrl) {
    return UtilisateurModel.mettreAJour(userId, {
      photo_profil: photoUrl,
      date_modification: new Date(),
    })
  }

  /**
   * Met à jour les informations de facturation d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} billingData - Données de facturation
   * @returns {Promise<Object>} - Les informations de facturation mises à jour
   */
  static async updateBillingInfo(userId, billingData) {
    // Validation du nom de facturation
    if (billingData.billingName && !validateName(billingData.billingName)) {
      throw new Error("Le nom de facturation ne doit pas contenir de chiffres")
    }

    // Utiliser PreferenceUtilisateurModel pour mettre à jour les informations de facturation
    const billingInfo = await PreferenceUtilisateurModel.updateBillingInfo(userId, billingData);

    // Mettre à jour la date de modification de l'utilisateur
    await UtilisateurModel.mettreAJour(userId, {
      date_modification: new Date(),
    })

    return billingInfo;
  }

  /**
   * Configure l'authentification à deux facteurs
   * @param {number} userId - ID de l'utilisateur
   * @param {string} secret - Clé secrète
   * @returns {Promise<Object>} - Le profil mis à jour
   */
  static async setupTwoFactorAuth(userId, secret) {
    return UtilisateurModel.mettreAJour(userId, {
      secret_deux_facteurs: secret,
      date_modification: new Date(),
    })
  }

  /**
   * Active l'authentification à deux facteurs
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Le profil mis à jour
   */
  static async enableTwoFactorAuth(userId) {
    return UtilisateurModel.mettreAJour(userId, {
      authentification_deux_facteurs: true,
      date_modification: new Date(),
    })
  }

  /**
   * Désactive l'authentification à deux facteurs
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} - Le profil mis à jour
   */
  static async disableTwoFactorAuth(userId) {
    return UtilisateurModel.mettreAJour(userId, {
      authentification_deux_facteurs: false,
      secret_deux_facteurs: null,
      date_modification: new Date(),
    })
  }
}

export default Profile