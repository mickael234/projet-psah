import prisma from "../config/prisma.js";

import utilisateurModel from './utilisateur.model.js';
import { RoleMapper } from '../utils/roleMapper.js';

 // Une seule instance de PrismaClient [^1]

class ClientModel {
    /**
     * Récupère un client avec ses relations
     * @param {number} id - ID du client
     * @returns {Promise<Object>} - Le client avec ses relations
     */
    async getWithRelations(id) {
        return prisma.client.findUnique({
            where: { id_client: id },
            include: {
                utilisateur: true,
                reservations: true,
                fidelite: true
            }
        });
    }

    /**
     * Récupère un client par l'ID de son utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object>} - Le client trouvé
     */
    async findByUserId(userId) {
        return prisma.client.findUnique({
            where: { id_utilisateur: userId }
        });
    }

    /**
     * Crée un nouveau client avec un compte utilisateur
     * @param {Object} clientData - Données du client
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - Le client créé
     */
    async create(clientData, userData) {
        // Créer l'utilisateur d'abord
        // Utiliser le service RoleMapper pour convertir le rôle
        userData.role = RoleMapper.toBaseRole(userData.role || 'CLIENT');

        const utilisateur = await utilisateurModel.create(userData);

        // Puis créer le client associé
        return prisma.client.create({
            data: {
                ...clientData,
                id_utilisateur: utilisateur.id_utilisateur
            },
            include: {
                utilisateur: true
            }
        });
    }
    /**
     * Récupère un client par son ID
     * @param {number} id - ID du client
     * @returns {Promise<Object>} - Le client trouvé
     */
    async findById(id) {
        return prisma.client.findUnique({
            where: { id_client: id },
            include: {
                utilisateur: true,
                reservations: true,
                fidelite: true
            }
        });
    }

    /**
     * Récupère tous les clients
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array>} - Liste des clients
     */
    async findAll(filters = {}) {
        return prisma.client.findMany({
            where: {
                ...filters,
                supprime_le: null // Exclure les clients supprimés
            },
            include: {
                utilisateur: true,
                fidelite: true
            }
        });
    }

    /**
     * Met à jour un client
     * @param {number} id - ID du client
     * @param {Object} clientData - Nouvelles données
     * @returns {Promise<Object>} - Le client mis à jour
     */
    async update(id, clientData) {
        return prisma.client.update({
            where: { id_client: id },
            data: clientData
        });
    }

    /**
     * Suppression logique d'un client
     * @param {number} id - ID du client
     * @returns {Promise<Object>} - Le client supprimé
     */
    async delete(id) {
        const client = await this.findById(id);

        // Supprimer logiquement le client et son utilisateur
        await prisma.client.update({
            where: { id_client: id },
            data: { supprime_le: new Date() }
        });

        return utilisateurModel.delete(client.id_utilisateur);
    }

    /**
     * Récupère toutes les réservations d'un client
     * @param {number} id - ID du client
     * @returns {Promise<Array>} - Liste des réservations
     */
    async getReservations(id) {
        return prisma.reservation.findMany({
            where: {
                id_client: id,
                supprime_le: null
            },
            include: {
                chambres: {
                    include: {
                        chambre: true
                    }
                },
                services: {
                    include: {
                        service: true
                    }
                },
                paiements: true
            }
        });
    }

    /**
     * Récupère le programme de fidélité d'un client
     * @param {number} id - ID du client
     * @returns {Promise<Object>} - Programme de fidélité
     */
    async getFidelite(id) {
        return prisma.fidelite.findUnique({
            where: { id_client: id },
            include: {
                transactions: true,
                echanges: {
                    include: {
                        recompense: true
                    }
                }
            }
        });
    }

    /**
     * Recherche des clients par nom ou email
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} - Clients correspondants
     */
    async search(query) {
        return prisma.client.findMany({
            where: {
                OR: [
                    { prenom: { contains: query, mode: 'insensitive' } },
                    { nom: { contains: query, mode: 'insensitive' } },
                    {
                        utilisateur: {
                            email: { contains: query, mode: 'insensitive' }
                        }
                    }
                ],
                supprime_le: null
            },
            include: {
                utilisateur: true
            }
        });
    }
}

export default ClientModel;
