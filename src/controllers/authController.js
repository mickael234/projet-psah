import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import Role from "../models/roleModel.js"
import { validatePhoneNumber, validateName } from "../utils/validators.js"

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

      const roleObject = await Role.findByName(role)
      if (!roleObject) {
        return res.status(400).json({
          status: "ERROR",
          message: "Le rôle spécifié n'existe pas",
        })
      }

      const user = await User.create(fullName, email, password, roleObject.id, phoneNumber)
      res.status(201).json({
        status: "OK",
        message: "Utilisateur créé avec succès",
        data: {
          userId: user.id,
          createdAt: user.createdAt,
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
        })
      }
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findByEmail(email)
      if (user && (await User.verifyPassword(password, user.password))) {
        const token = jwt.sign({ userId: user.id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.status(200).json({
          status: "OK",
          message: "Connexion réussie",
          data: {
            token,
            userId: user.id,
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
      })
    }
  }
}

export default AuthController
