// src/models/preferenceUtilisateur.model.js
import prisma from "../config/prisma.js";


class PreferenceUtilisateurModel {
    /**
     * Récupère toutes les préférences d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Array>} - Liste des préférences
     */
    static async findByUser(idUtilisateur) {
        return prisma.preferenceUtilisateur.findMany({
            where: { id_utilisateur: idUtilisateur }
        });
    }

    /**
     * Récupère les utilisateurs ayant une préférence spécifique
     * @param {string} typePreference - Type de préférence
     * @param {string} valeur - Valeur recherchée
     * @returns {Promise<Array>} - Liste des utilisateurs
     */
    static async findUsersByPreference(typePreference, valeur) {
        return prisma.preferenceUtilisateur.findMany({
            where: {
                type_preference: typePreference,
                valeur
            },
            include: {
                utilisateur: true
            }
        });
    }

    /**
     * Récupère toutes les préférences de facturation d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Object>} - Informations de facturation formatées
     */
    static async getBillingInfo(idUtilisateur) {
        const preferences = await prisma.preferenceUtilisateur.findMany({
            where: {
                id_utilisateur: idUtilisateur,
                type_preference: {
                    startsWith: "facturation_"
                }
            }
        });

        // Convertir les préférences en objet
        return preferences.reduce((acc, pref) => {
            const key = pref.type_preference.replace("facturation_", "");
            acc[key] = pref.valeur;
            return acc;
        }, {});
    }

    /**
     * Met à jour les informations de facturation d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @param {Object} billingData - Données de facturation
     * @returns {Promise<Object>} - Informations de facturation mises à jour
     */
    static async updateBillingInfo(idUtilisateur, billingData) {
        // Supprimer les préférences existantes
        await prisma.preferenceUtilisateur.deleteMany({
            where: {
                id_utilisateur: idUtilisateur,
                type_preference: {
                    startsWith: "facturation_"
                }
            }
        });

        // Préparer les nouvelles préférences
        const preferences = [
            { type_preference: "facturation_adresse", valeur: billingData.address },
            { type_preference: "facturation_ville", valeur: billingData.city },
            { type_preference: "facturation_code_postal", valeur: billingData.postalCode },
            { type_preference: "facturation_pays", valeur: billingData.country },
            { type_preference: "facturation_nom", valeur: billingData.billingName },
            { type_preference: "facturation_tva", valeur: billingData.vatNumber }
        ];

        // Insérer les nouvelles préférences
        for (const pref of preferences) {
            if (pref.valeur) {
                await prisma.preferenceUtilisateur.create({
                    data: {
                        id_utilisateur: idUtilisateur,
                        type_preference: pref.type_preference,
                        valeur: pref.valeur
                    }
                });
            }
        }

        // Retourner les informations mises à jour
        return this.getBillingInfo(idUtilisateur);
    }
}

export default PreferenceUtilisateurModel;