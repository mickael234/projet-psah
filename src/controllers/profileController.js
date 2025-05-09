// src/controllers/profileController.js
import Profile from '../models/profileModel.js';
import UtilisateurModel from '../models/utilisateur.model.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { uploadFile } from '../utils/fileUpload.js';
import { validatePhoneNumber, validateName } from '../utils/validators.js';

class ProfileController {
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await Profile.getProfile(userId);

            if (!profile) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Profil non trouvé'
                });
            }

            // Ne pas renvoyer le mot de passe et les informations sensibles
            const { ...safeProfile } = profile;
            delete safeProfile.mot_de_passe;
            delete safeProfile.secret_deux_facteurs;
            res.status(200).json({
                status: 'OK',
                message: 'Profil récupéré avec succès',
                data: safeProfile
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la récupération du profil'
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { fullName, phoneNumber, email } = req.body;

            // Validation du nom complet (ne doit pas contenir de chiffres)
            if (fullName && !validateName(fullName)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Le nom complet ne doit pas contenir de chiffres'
                });
            }

            // Validation du numéro de téléphone
            if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message:
                        'Format de numéro de téléphone invalide. Utilisez le format international (ex: +33612345678)'
                });
            }

            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            if (email) {
                const existingUser = await UtilisateurModel.trouverParEmail(email);
                if (existingUser && existingUser.id_utilisateur !== userId) {
                    return res.status(400).json({
                        status: 'ERROR',
                        message:
                            'Cet email est déjà utilisé par un autre utilisateur'
                    });
                }
            }

            const updatedProfile = await Profile.updateProfile(userId, {
                nom_utilisateur: fullName,
                telephone: phoneNumber,
                email,
                date_modification: new Date()
            });

            res.status(200).json({
                status: 'OK',
                message: 'Profil mis à jour avec succès',
                data: {
                    userId: updatedProfile.id_utilisateur,
                    fullName: updatedProfile.nom_utilisateur,
                    email: updatedProfile.email,
                    phoneNumber: updatedProfile.telephone,
                    updatedAt: updatedProfile.date_modification
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour du profil'
            });
        }
    }

    static async updateProfilePhoto(req, res) {
        try {
            const userId = req.user.userId;

            if (!req.file) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Aucune photo fournie'
                });
            }

            // Télécharger la photo vers le stockage
            const photoUrl = await uploadFile(req.file, `profiles/${userId}`);

            // Mettre à jour l'URL de la photo dans la base de données
            const updatedProfile = await Profile.updateProfilePhoto(userId, photoUrl);
            console.log("Profil mis à jour:", updatedProfile);

            res.status(200).json({
                status: 'OK',
                message: 'Photo de profil mise à jour avec succès',
                data: {
                    profilePhoto: photoUrl
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la mise à jour de la photo de profil'
            });
        }
    }

    static async updateBillingInfo(req, res) {
        try {
            const userId = req.user.userId;
            const {
                address,
                city,
                postalCode,
                country,
                billingName,
                vatNumber
            } = req.body;

            // Valider les données requises
            if (!address || !city || !postalCode || !country) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Adresse, ville, code postal et pays sont requis'
                });
            }

            // Validation du nom de facturation (ne doit pas contenir de chiffres)
            if (billingName && !validateName(billingName)) {
                return res.status(400).json({
                    status: 'ERROR',
                    message:
                        'Le nom de facturation ne doit pas contenir de chiffres'
                });
            }

            const billingInfo = await Profile.updateBillingInfo(userId, {
                address,
                city,
                postalCode,
                country,
                billingName,
                vatNumber,
                updatedAt: new Date()
            });

            res.status(200).json({
                status: 'OK',
                message: 'Informations de facturation mises à jour avec succès',
                data: billingInfo
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message:
                    'Erreur lors de la mise à jour des informations de facturation'
            });
        }
    }

    static async setupTwoFactorAuth(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await Profile.getProfile(userId);

            // Générer une clé secrète pour l'authentification à deux facteurs
            const secret = speakeasy.generateSecret({
                name: `PSAH Hotel (${profile.email})`
            });

            // Stocker temporairement la clé secrète
            await Profile.setupTwoFactorAuth(userId, secret.base32);

            // Générer un QR code pour la configuration
            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

            res.status(200).json({
                status: 'OK',
                message:
                    "Configuration de l'authentification à deux facteurs initiée",
                data: {
                    qrCode: qrCodeUrl,
                    secret: secret.base32
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message:
                    "Erreur lors de la configuration de l'authentification à deux facteurs"
            });
        }
    }

    static async verifyAndEnableTwoFactorAuth(req, res) {
        try {
            const userId = req.user.userId;
            const { token } = req.body;

            // Récupérer la clé secrète temporaire
            const profile = await Profile.getProfile(userId);
            const secret = profile.secret_deux_facteurs;

            if (!secret) {
                return res.status(400).json({
                    status: 'ERROR',
                    message:
                        "La configuration de l'authentification à deux facteurs n'a pas été initiée"
                });
            }

            // Vérifier le token avec une fenêtre de temps plus large (2 périodes avant et après)
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2 // Permet une tolérance de 2 périodes (30 secondes chacune) avant et après
            });

            if (!verified) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: "Code d'authentification invalide ou expiré"
                });
            }

            // Activer l'authentification à deux facteurs
            await Profile.enableTwoFactorAuth(userId);

            res.status(200).json({
                status: 'OK',
                message: 'Authentification à deux facteurs activée avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message:
                    "Erreur lors de l'activation de l'authentification à deux facteurs"
            });
        }
    }

    static async disableTwoFactorAuth(req, res) {
        try {
            const userId = req.user.userId;
            const { password } = req.body;

            // Vérifier le mot de passe pour des raisons de sécurité
            const profile = await Profile.getProfile(userId);
            const isPasswordValid = await UtilisateurModel.verifierMotDePasse(
                password,
                profile.mot_de_passe
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Mot de passe incorrect'
                });
            }

            // Désactiver l'authentification à deux facteurs
            await Profile.disableTwoFactorAuth(userId);

            res.status(200).json({
                status: 'OK',
                message:
                    'Authentification à deux facteurs désactivée avec succès'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'ERROR',
                message:
                    "Erreur lors de la désactivation de l'authentification à deux facteurs"
            });
        }
    }
}

export default ProfileController;