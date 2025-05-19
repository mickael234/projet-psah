import prisma from "../config/prisma.js";

import ClientModel from '../models/client.model.js';

const clientModel = new ClientModel();


class ClientController {
    static async getAllClients(req, res) {
        try {
            const clients = await clientModel.findAll();
            res.status(200).json({
                status: 'OK',
                message: 'Clients récupérés avec succès',
                data: clients
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des clients',
                error: error.message
            });
        }
    }

    static async getClientById(req, res) {
        try {
            const { id } = req.params;
            const client = await clientModel.findById(parseInt(id));
            if (!client) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Client non trouvé'
                });
            }
            res.status(200).json({
                status: 'OK',
                message: 'Client récupéré avec succès',
                data: client
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération du client',
                error: error.message
            });
        }
    }

    static async createClient(req, res) {
        try {
            const { clientData, userData } = req.body;

            if (!clientData || !userData) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Données client et utilisateur requises'
                });
            }

            if (
                !userData.email ||
                !userData.mot_de_passe ||
                !userData.nom_utilisateur
            ) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "Email, mot de passe et nom d'utilisateur requis"
                });
            }

            if (!clientData.prenom || !clientData.nom) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Prénom et nom requis'
                });
            }

            const client = await clientModel.create(clientData, userData);

            res.status(201).json({
                status: 'OK',
                message: 'Client créé avec succès',
                data: client
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la création du client',
                error: error.message
            });
        }
    }

    static async updateClient(req, res) {
        try {
            const { id } = req.params;
            const { clientData } = req.body;
            const existingClient = await clientModel.findById(parseInt(id));

            if (!existingClient) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Client non trouvé'
                });
            }

            const client = await clientModel.update(parseInt(id), clientData);

            res.status(200).json({
                status: 'OK',
                message: 'Client mis à jour avec succès',
                data: client
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour du client',
                error: error.message
            });
        }
    }

    static async deleteClient(req, res) {
        try {
            const { id } = req.params;
            const existingClient = await clientModel.findById(parseInt(id));

            if (!existingClient) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Client non trouvé'
                });
            }

            await clientModel.delete(parseInt(id));

            res.status(200).json({
                status: 'OK',
                message: 'Client supprimé avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la suppression du client',
                error: error.message
            });
        }
    }

    static async getClientReservations(req, res) {
        try {
            const { id } = req.params;
            const existingClient = await clientModel.findById(parseInt(id));

            if (!existingClient) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Client non trouvé'
                });
            }

            const reservations = await clientModel.getReservations(
                parseInt(id)
            );

            res.status(200).json({
                status: 'OK',
                message: 'Réservations récupérées avec succès',
                data: reservations
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des réservations',
                error: error.message
            });
        }
    }
}

export default ClientController;
