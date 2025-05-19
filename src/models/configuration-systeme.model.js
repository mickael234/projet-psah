import prisma from "../config/prisma.js";


class ConfigurationSystemeModel {
    /**
     * Récupère la valeur d'une configuration
     * @param {string} cle - Clé de la configuration
     * @param {string} defaultValue - Valeur par défaut
     * @returns {Promise<string>} - Valeur de la configuration
     */
    static async getValue(cle, defaultValue = null) {
        const config = await prisma.configurationSysteme.findUnique({
            where: { cle }
        });
        return config ? config.valeur : defaultValue;
    }

    /**
     * Récupère plusieurs configurations par préfixe
     * @param {string} prefix - Préfixe des clés
     * @returns {Promise<Array>} - Liste des configurations
     */
    static findByPrefix(prefix) {
        return prisma.configurationSysteme.findMany({
            where: {
                cle: {
                    startsWith: prefix
                }
            }
        });
    }

    /**
     * Récupère les configurations sous forme d'objet
     * @param {string} prefix - Préfixe optionnel pour filtrer
     * @returns {Promise<Object>} - Configurations sous forme d'objet
     */
    static async getAsObject(prefix = null) {
        const configs = prefix
            ? await this.findByPrefix(prefix)
            : await prisma.configurationSysteme.findMany();

        const result = {};
        for (const config of configs) {
            result[config.cle] = config.valeur;
        }

        return result;
    }
}

export defaultConfigurationSystemeModel;
