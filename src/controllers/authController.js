import jwt from "jsonwebtoken"
import UtilisateurModel from "../models/utilisateur.model.js"
import RoleModel from "../models/roleModel.js"
import PermissionModel from "../models/permission.model.js"
import { validatePhoneNumber, validateName } from "../utils/validators.js"
const permissionModel = PermissionModel;

//const permissions = await PermissionModel.getUserPermissions(utilisateur.id_utilisateur)

class AuthController {
  static async register(req, res) {
    try {
      const { fullName, email, password, role, phoneNumber } = req.body

      // Validation du nom complet (ne doit pas contenir de chiffres)
      if (fullName && !validateName(fullName)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le nom complet ne doit pas contenir de chiffres",
        })
      }

      // Validation du numéro de téléphone
      if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Format de numéro de téléphone invalide. Utilisez le format international (ex: +33612345678)",
        })
      }

      // Rechercher le rôle par son code
      const roleObject = await RoleModel.findByName(role)
      if (!roleObject) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le rôle spécifié n'existe pas",
        })
      }

      // Créer l'utilisateur avec l'ID du rôle et le code du rôle
      const utilisateur = await UtilisateurModel.creerAvecParametres(
        fullName,
        email,
        password,
        roleObject.id_role,
        phoneNumber,
        roleObject.code,
      )

      res.status(201).json({
        status: "OK",
        message: "Utilisateur créé avec succès",
        data: {
          userId: utilisateur.id_utilisateur,
          createdAt: utilisateur.date_creation,
        },
      })
    } catch (error) {
      console.error(error)
      if (error.code === "P2002") {
        res.status(400).json({
          status: "ERROR",
          message: "Cet email est déjà utilisé",
        })
      } else {
        res.status(500).json({
          status: "ERROR",
          message: "Erreur lors de l'inscription",
          error: error.message,
        })
      }
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body

      // Utiliser la méthode authentifier du modèle
      const utilisateur = await UtilisateurModel.authentifier(email, password)

      if (utilisateur) {
        // Récupérer les permissions
        console.log(`Récupération des permissions pour l'utilisateur ${utilisateur.id_utilisateur}`)

        // Log des données utilisateur pour le débogage
        console.log("Données utilisateur pour les permissions:", {
          userId: utilisateur.id_utilisateur,
          hasRoleRelation: !!utilisateur.role_relation,
          roleId: utilisateur.id_role,
          roleName: utilisateur.role_relation?.nom,
          roleCode: utilisateur.role_relation?.code,
          permissionsCount: utilisateur.role_relation?.permissions?.length,
        })

        const permissions = await permissionModel.getUserPermissions(utilisateur.id_utilisateur)
        console.log(`Permissions trouvées pour l'utilisateur ${utilisateur.id_utilisateur}:`, permissions)

        // Créer un tableau formaté des codes de permissions
        const formattedPermissions = permissions.map((p) => p.code)

        console.log(`Permissions pour l'utilisateur ${utilisateur.id_utilisateur}:`, formattedPermissions)

        // Récupérer le code du rôle depuis la relation de rôle
        let roleCode = utilisateur.role
        if (utilisateur.role_relation) {
          roleCode = utilisateur.role_relation.code
        }

        // Déterminer si l'utilisateur est un client et récupérer son ID client
        let clientId = null
        if (utilisateur.client) {
          clientId = utilisateur.client.id_client
        }

        console.log("Création du token avec les données:", {
          userId: utilisateur.id_utilisateur,
          role: roleCode,
          clientId: clientId,
          permissions: formattedPermissions,
        })

        const token = jwt.sign(
          {
            userId: utilisateur.id_utilisateur,
            role: roleCode, // Utiliser le code du rôle, pas le rôle de base
            email: utilisateur.email,
            clientId: clientId, // Ajouter l'ID client si disponible
            permissions: formattedPermissions,
          },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256", // Spécifier explicitement l'algorithme
            expiresIn: "1h",
          },
        )

        // Vérifier immédiatement le token pour s'assurer qu'il est valide
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] })
          console.log("Token vérifié avec succès:", decoded)
        } catch (verifyError) {
          console.error("Erreur lors de la vérification du token:", verifyError)
        }

        res.status(200).json({
          status: "OK",
          message: "Connexion réussie",
          data: {
            token,
            userId: utilisateur.id_utilisateur,
            role: roleCode,
            clientId: clientId,
            permissions: formattedPermissions,
            lastLogin: new Date(),
          },
        })
      } else {
        res.status(400).json({
          status: "ERROR",
          message: "Email ou mot de passe incorrect",
        })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la connexion",
        error: error.message,
      })
    }
  }
}

export default AuthController
