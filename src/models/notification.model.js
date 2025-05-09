import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class NotificationModel {
    /**
     * Crée une nouvelle notification
     * @param {Object} data - Données de la notification
     * @returns {Promise<Object>} - La notification créée
     */
    static async createNotification(data) {
        try {
            return await prisma.notification.create({
                data: {
                    id_utilisateur: data.id_utilisateur,
                    type: data.type,
                    contenu: data.contenu,
                    etat: data.etat || 'non_lu',
                    envoye_le: data.envoye_le || new Date()
                }
            });
        } catch (error) {
            console.error('Erreur création notification:', error);
            throw error;
        }
    }

    /**
     * Récupère toutes les notifications d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Array>} - Liste des notifications
     */
    static async findByUser(idUtilisateur) {
        try {
            return await prisma.notification.findMany({
                where: { 
                    id_utilisateur: idUtilisateur 
                },
                orderBy: { 
                    envoye_le: 'desc' 
                },
                include: {
                    utilisateur: true // Include user relations if needed
                }
            });
        } catch (error) {
            console.error('Erreur récupération notifications:', error);
            throw error;
        }
    }

    /**
     * Récupère les notifications non lues d'un utilisateur
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Array>} - Liste des notifications non lues
     */
    static async getUnreadNotifications(idUtilisateur) {
        try {
            return await prisma.notification.findMany({
                where: {
                    id_utilisateur: idUtilisateur,
                    etat: 'non_lu'
                },
                orderBy: { 
                    envoye_le: 'desc' 
                }
            });
        } catch (error) {
            console.error('Erreur récupération notifications non lues:', error);
            throw error;
        }
    }

    /**
     * Marque une notification comme lue
     * @param {number} idNotification - ID de la notification
     * @returns {Promise<Object>} - La notification mise à jour
     */
    static async markAsRead(idNotification) {
        try {
            return await prisma.notification.update({
                where: {
                    id_notification: idNotification
                },
                data: {
                    etat: 'lu'
                }
            });
        } catch (error) {
            console.error('Erreur mise à jour notification:', error);
            throw error;
        }
    }

    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     * @param {number} idUtilisateur - ID de l'utilisateur
     * @returns {Promise<Object>} - Résultat de la mise à jour
     */
    static async markAllAsRead(idUtilisateur) {
        try {
            return await prisma.notification.updateMany({
                where: {
                    id_utilisateur: idUtilisateur,
                    etat: 'non_lu'
                },
                data: {
                    etat: 'lu'
                }
            });
        } catch (error) {
            console.error('Erreur mise à jour notifications:', error);
            throw error;
        }
    }

    /**
     * Supprime une notification
     * @param {number} idNotification - ID de la notification
     * @returns {Promise<Object>} - La notification supprimée
     */
    static async deleteNotification(idNotification) {
        try {
            return await prisma.notification.delete({
                where: {
                    id_notification: idNotification
                }
            });
        } catch (error) {
            console.error('Erreur suppression notification:', error);
            throw error;
        }
    }
}

export default NotificationModel;