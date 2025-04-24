import HebergementModel from '../models/hebergementModel.js';
import { PrismaClient } from '@prisma/client';
import { RoleMapper } from '../utils/roleMapper.js';
import EquipementModel from '../models/equipement.model.js';

const prisma = new PrismaClient();

class HebergementController {
    /**
     * Vérifie si l'utilisateur a les permissions nécessaires
     * @param {Object} req - Requête Express
     * @param {Array} rolesAutorises - Rôles autorisés
     * @returns {boolean} - L'utilisateur a-t-il les permissions
     */
    static verifierPermissions(req, rolesAutorises) {
        if (!req.user) return false;

        // Utiliser le service RoleMapper pour vérifier les permissions
        return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises);
    }

    /**
     * Récupère tous les hébergements avec filtres optionnels
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getAllHebergements(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const hebergements = await HebergementModel.findAll(
                filters,
                Number.parseInt(page),
                Number.parseInt(limit)
            );

            res.status(200).json({
                status: 'OK',
                message: 'Hébergements récupérés avec succès',
                data: hebergements
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération des hébergements',
                error: error.message
            });
        }
    }

    /**
     * Récupère un hébergement par son ID
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async getHebergementById(req, res) {
        try {
            const { id } = req.params;

            // Assurez-vous que l'ID est un entier
            const hebergementId = Number.parseInt(id);

            // Vérifiez que l'ID est valide
            if (isNaN(hebergementId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "ID d'hébergement invalide"
                });
            }

            const hebergement = await HebergementModel.findById(hebergementId);

            if (!hebergement) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Hébergement non trouvé'
                });
            }

            res.status(200).json({
                status: 'OK',
                message: 'Hébergement récupéré avec succès',
                data: hebergement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de la récupération de l'hébergement",
                error: error.message
            });
        }
    }


    /**
     * Vérifie la disponibilité d'un hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async checkAvailability(req, res) {
        try {
            const { id } = req.params;
            const { dateArrivee, dateDepart } = req.query;

            if (!dateArrivee || !dateDepart) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "Les dates d'arrivée et de départ sont requises"
                });
            }

            // Assurez-vous que l'ID est un entier
            const hebergementId = Number.parseInt(id);

            // Vérifiez que l'ID est valide
            if (isNaN(hebergementId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "ID d'hébergement invalide"
                });
            }

            const isAvailable = await HebergementModel.checkAvailability(
                hebergementId,
                dateArrivee,
                dateDepart
            );

            res.status(200).json({
                status: 'OK',
                message: 'Disponibilité vérifiée avec succès',
                data: { isAvailable }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la vérification de la disponibilité',
                error: error.message
            });
        }
    }

    /**
     * Recherche des hébergements disponibles
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async searchAvailableHebergements(req, res) {
        try {
            const {
                dateArrivee,
                dateDepart,
                page = 1,
                limit = 10,
                ...filters
            } = req.query;

            if (!dateArrivee || !dateDepart) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "Les dates d'arrivée et de départ sont requises"
                });
            }

            const hebergements = await HebergementModel.findAvailable(
                dateArrivee,
                dateDepart,
                filters,
                Number.parseInt(page),
                Number.parseInt(limit)
            );

            res.status(200).json({
                status: 'OK',
                message: 'Hébergements disponibles récupérés avec succès',
                data: hebergements
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message:
                    "Erreur lors de la recherche d'hébergements disponibles",
                error: error.message
            });
        }
    }

    /**
     * Crée un nouvel hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async createHebergement(req, res) {
        try {
            // Vérifier les permissions (seuls le personnel et l'administrateur peuvent créer)
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour créer un hébergement"
                });
            }

            const hebergementData = req.body;

            // Validation des données pour une chambre (hébergement)
            if (
                !hebergementData.numero_chambre ||
                !hebergementData.type_chambre ||
                !hebergementData.prix_par_nuit
            ) {
                return res.status(400).json({
                    status: 'ERROR',
                    message:
                        'Numéro de chambre, type et prix par nuit sont requis'
                });
            }

            // Ajouter l'ID de l'utilisateur qui crée l'hébergement
            if (req.user && req.user.userId) {
                // Vérifiez si l'utilisateur existe dans la base de données
                const utilisateur = await prisma.utilisateur.findUnique({
                    where: { id_utilisateur: req.user.userId }
                });

                if (utilisateur) {
                    hebergementData.modifie_par = req.user.userId;
                    hebergementData.date_modification = new Date();
                } else {
                    // Si l'utilisateur n'existe pas, ne pas inclure modifie_par
                    delete hebergementData.modifie_par;
                }
            }

            const hebergement = await HebergementModel.create(hebergementData);

            res.status(201).json({
                status: 'OK',
                message: 'Hébergement créé avec succès',
                data: hebergement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de la création de l'hébergement",
                error: error.message
            });
        }
    }

    /**
     * Met à jour un hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async updateHebergement(req, res) {
        try {
            // Vérifier les permissions (seuls le personnel et l'administrateur peuvent modifier)
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour modifier un hébergement"
                });
            }

            const { id } = req.params;
            const hebergementData = req.body;

            // Assurez-vous que l'ID est un entier
            const hebergementId = Number.parseInt(id);

            // Vérifiez que l'ID est valide
            if (isNaN(hebergementId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "ID d'hébergement invalide"
                });
            }

            // Vérifier si l'hébergement existe
            const hebergementExistant =
                await HebergementModel.findById(hebergementId);

            if (!hebergementExistant) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Hébergement non trouvé'
                });
            }

            // Ajouter l'ID de l'utilisateur qui modifie l'hébergement
            // IMPORTANT: Vérifiez que l'utilisateur existe avant d'utiliser son ID
            if (req.user && req.user.userId) {
                // Vérifiez si l'utilisateur existe dans la base de données
                const utilisateur = await prisma.utilisateur.findUnique({
                    where: { id_utilisateur: req.user.userId }
                });

                if (utilisateur) {
                    hebergementData.modifie_par = req.user.userId;
                    hebergementData.date_modification = new Date();
                } else {
                    // Si l'utilisateur n'existe pas, ne pas inclure modifie_par
                    delete hebergementData.modifie_par;
                }
            } else {
                // Si pas d'utilisateur dans la requête, ne pas inclure modifie_par
                delete hebergementData.modifie_par;
            }

            // Mettre à jour l'hébergement
            const hebergement = await HebergementModel.update(
                hebergementId,
                hebergementData
            );

            res.status(200).json({
                status: 'OK',
                message: 'Hébergement mis à jour avec succès',
                data: hebergement
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de la mise à jour de l'hébergement",
                error: error.message
            });
        }
    }

    /**
     * Supprime un hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async deleteHebergement(req, res) {
        try {
            // Vérifier les permissions (seul l'administrateur peut supprimer)
            if (
                !HebergementController.verifierPermissions(req, [
                    'SUPER_ADMIN',
                    'ADMIN_GENERAL'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour supprimer un hébergement"
                });
            }

            const { id } = req.params;

            // Assurez-vous que l'ID est un entier
            const hebergementId = Number.parseInt(id);

            // Vérifiez que l'ID est valide
            if (isNaN(hebergementId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "ID d'hébergement invalide"
                });
            }

            // Vérifier si l'hébergement existe
            const hebergementExistant =
                await HebergementModel.findById(hebergementId);

            if (!hebergementExistant) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Hébergement non trouvé'
                });
            }

            await HebergementModel.delete(hebergementId);

            res.status(200).json({
                status: 'OK',
                message: 'Hébergement supprimé avec succès'
            });
        } catch (error) {
            console.error(error);

            if (error.message.includes('réservations futures')) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de la suppression de l'hébergement",
                error: error.message
            });
        }
    }

    /**
     * Ajoute un média à un hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addMedia(req, res) {
        try {
            // Vérifier les permissions (seuls le personnel et l'administrateur peuvent ajouter des médias)
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour ajouter un média"
                });
            }

            const { id } = req.params;
            const mediaData = req.body;

            // Assurez-vous que l'ID est un entier
            const hebergementId = Number.parseInt(id);

            // Vérifiez que l'ID est valide
            if (isNaN(hebergementId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "ID d'hébergement invalide"
                });
            }

            // Si un fichier a été téléchargé, utiliser son URL
            if (req.file) {
                mediaData.url = req.file.path;
            }

            // Validation des données
            if (!mediaData.url || !mediaData.type_media) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'URL et type de média sont requis'
                });
            }

            // Ajouter l'ID de la chambre (hébergement)
            mediaData.id_chambre = hebergementId;

            const media = await HebergementModel.addMedia(
                hebergementId,
                mediaData
            );

            res.status(201).json({
                status: 'OK',
                message: 'Média ajouté avec succès',
                data: media
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de l'ajout du média",
                error: error.message
            });
        }
    }

    /**
     * Supprime un média d'un hébergement
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async removeMedia(req, res) {
        try {
            // Vérifier les permissions (seuls le personnel et l'administrateur peuvent supprimer des médias)
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour supprimer un média"
                });
            }

            const { id, mediaId } = req.params;

            // Assurez-vous que les IDs sont des entiers
            const hebergementId = Number.parseInt(id);
            const mediaIdInt = Number.parseInt(mediaId);

            // Vérifiez que les IDs sont valides
            if (isNaN(hebergementId) || isNaN(mediaIdInt)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'IDs invalides'
                });
            }

            // Vérifier si le média existe
            const mediaExistant =
                await HebergementModel.findMediaById(mediaIdInt);

            if (!mediaExistant) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Média non trouvé'
                });
            }

            await HebergementModel.removeMedia(hebergementId, mediaIdInt);

            res.status(200).json({
                status: 'OK',
                message: 'Média supprimé avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la suppression du média',
                error: error.message
            });
        }
    }

  
    /**
     * Ajoute un équipement à une chambre
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async addEquipementToChambre(req, res) {
        try {
            // Vérifier les permissions
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour ajouter un équipement à un hébergement"
                });
            }

            const { id } = req.params;
            const { idEquipement } = req.body;

            // Validation des IDs
            const hebergementId = Number.parseInt(id);
            const equipementId = Number.parseInt(idEquipement);

            if (isNaN(hebergementId) || isNaN(equipementId)) {
                return res.status(400).json({
                    status: 'MAUVAISE DEMANDE',
                    message: "IDs invalides"
                });
            }

            // Vérifier si l'hébergement existe
            const hebergementExistant = await HebergementModel.findById(hebergementId);
            if (!hebergementExistant) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: 'Hébergement non trouvé'
                });
            }

            // Vérifier si l'équipement existe
            const equipementExistant = await EquipementModel.findById(equipementId);

            if (!equipementExistant) {
                return res.status(404).json({
                    status: 'RESSOURCE NON TROUVEE',
                    message: 'Équipement non trouvé'
                });
            }

            // Vérifier si la relation existe déjà
            const relationExistante = await prisma.chambresEquipements.findUnique({
                where: {
                    id_chambre_id_equipement: {
                        id_chambre: hebergementId,
                        id_equipement: equipementId
                    }
                }
            });

            if (relationExistante) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Cet équipement est déjà associé à cette chambre'
                });
            }

            const relation = await HebergementModel.addEquipement(hebergementId, equipementId);

            res.status(201).json({
                status: 'OK',
                message: 'Équipement ajouté avec succès',
                data: relation
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de l'ajout de l'équipement",
                error: error.message
            });
        }
    }

    /**
     * Supprime un équipement d'une chambre
     * @param {Object} req - Requête Express
     * @param {Object} res - Réponse Express
     */
    static async removeEquipementFromChambre(req, res) {
        try {
            // Vérifier les permissions
            if (
                !HebergementController.verifierPermissions(req, [
                    'RESPONSABLE_HEBERGEMENT',
                    'ADMIN_GENERAL',
                    'SUPER_ADMIN',
                    'RECEPTIONNISTE'
                ])
            ) {
                return res.status(403).json({
                    status: 'ERROR',
                    message:
                        "Vous n'avez pas les permissions nécessaires pour supprimer un équipement d'un hébergement"
                });
            }

            const { id, equipementId } = req.params;

            // Validation des IDs
            const hebergementId = Number.parseInt(id);
            const equipId = Number.parseInt(equipementId);

            if (isNaN(hebergementId) || isNaN(equipId)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "IDs invalides"
                });
            }

            // Vérifier si la relation existe
            const relationExistante = await prisma.chambresEquipements.findUnique({
                where: {
                    id_chambre_id_equipement: {
                        id_chambre: hebergementId,
                        id_equipement: equipId
                    }
                }
            });

            if (!relationExistante) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: "Cet équipement n'est pas associé à cette chambre"
                });
            }

            await HebergementModel.removeEquipement(hebergementId, equipId);

            res.status(200).json({
                status: 'OK',
                message: 'Équipement supprimé avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: "Erreur lors de la suppression de l'équipement",
                error: error.message
            });
        }
    }
}

export default HebergementController;
