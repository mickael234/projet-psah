const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PreferenceUtilisateurModel {
    /**
     * Récupère toutes les préférences d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Array>} - Liste des préférences
     */
    static findByUser(idUtilisateur) {
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
    static findUsersByPreference(typePreference, valeur) {
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
}

module.exports = PreferenceUtilisateurModel;
