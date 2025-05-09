import prisma from "../config/prisma.js";
import bcrypt from "bcrypt"
import { validatePhoneNumber, validateName } from "../utils/validators.js"
import { RoleMapper } from "../utils/roleMapper.js"



class UtilisateurModel {
  /**
   * Crée un nouvel utilisateur
   * @param {Object} donneesUtilisateur - Données complètes de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur créé
   */
  static async creer(donneesUtilisateur) {
    // Validation du nom complet
    if (donneesUtilisateur.nom_utilisateur && !validateName(donneesUtilisateur.nom_utilisateur)) {
      throw new Error("Le nom complet ne doit pas contenir de chiffres")
    }

    // Hachage du mot de passe
    const motDePasseHache = await bcrypt.hash(donneesUtilisateur.mot_de_passe, 10)

    // Si le code du rôle est fourni mais pas l'ID, récupérer l'ID
    if (donneesUtilisateur.role && !donneesUtilisateur.id_role) {
      const roleObject = await prisma.role.findUnique({
        where: { code: donneesUtilisateur.role },
      })
      if (roleObject) {
        donneesUtilisateur.id_role = roleObject.id_role
      }
    }

    // Si l'ID du rôle est fourni mais pas le code, récupérer le code
    if (donneesUtilisateur.id_role && !donneesUtilisateur.role) {
      const roleObject = await prisma.role.findUnique({
        where: { id_role: donneesUtilisateur.id_role },
      })
      if (roleObject) {
        donneesUtilisateur.role = roleObject.code
      }
    }

    // IMPORTANT: Convertir le code du rôle (ex: "ADMIN_GENERAL") en type RoleUtilisateur (ex: "administrateur")
    let roleUtilisateur = "client" // Valeur par défaut
    if (donneesUtilisateur.role) {
      roleUtilisateur = RoleMapper.toBaseRole(donneesUtilisateur.role)
    }

    // Créer l'utilisateur avec le rôle converti
    return prisma.utilisateur.create({
      data: {
        nom_utilisateur: donneesUtilisateur.nom_utilisateur,
        email: donneesUtilisateur.email,
        mot_de_passe: motDePasseHache,
        role: roleUtilisateur, // Utiliser le rôle converti
        id_role: donneesUtilisateur.id_role,
        fournisseur_auth: donneesUtilisateur.fournisseur_auth,
        id_auth_externe: donneesUtilisateur.id_auth_externe,
        date_creation: new Date(),
        date_modification: new Date(),
      },
      include: {
        role_relation: true,
      },
    })
  }

  /**
   * Méthode alternative pour créer un utilisateur avec des paramètres séparés
   * @param {string} nomComplet - Nom complet
   * @param {string} email - Email
   * @param {string} motDePasse - Mot de passe
   * @param {number} idRole - ID du rôle
   * @param {string} telephone - Numéro de téléphone
   * @param {string} codeRole - Code du rôle (optionnel)
   * @returns {Promise<Object>} - L'utilisateur créé
   */
  static async creerAvecParametres(nomComplet, email, motDePasse, idRole, telephone, codeRole = null) {
    // Validation du numéro de téléphone
    if (telephone && !validatePhoneNumber(telephone)) {
      throw new Error("Format de numéro de téléphone invalide")
    }

    // Si le code du rôle n'est pas fourni, le récupérer depuis la base de données
    if (!codeRole && idRole) {
      try {
        const role = await prisma.role.findUnique({
          where: { id_role: idRole },
        })

        if (!role) {
          throw new Error("Rôle non trouvé")
        }

        codeRole = role.code
      } catch (error) {
        console.error("Erreur lors de la recherche du rôle:", error)
        throw new Error(`Impossible de trouver le rôle avec l'ID ${idRole}: ${error.message}`)
      }
    }

    // Convertir le code du rôle en type RoleUtilisateur
    const roleUtilisateur = RoleMapper.toBaseRole(codeRole)

    // Créer l'utilisateur sans le téléphone (qui n'est pas dans le modèle Utilisateur)
    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom_utilisateur: nomComplet,
        email,
        mot_de_passe: await bcrypt.hash(motDePasse, 10),
        role: roleUtilisateur, // Utiliser le type RoleUtilisateur
        id_role: idRole,
        date_creation: new Date(),
        date_modification: new Date(),
      },
      include: {
        role_relation: true,
      },
    })

    // Si c'est un client, créer un enregistrement Client avec le téléphone
    if (roleUtilisateur === "client") {
      // Extraire le prénom et le nom du nom complet
      const [prenom, ...nomParts] = nomComplet.split(" ")
      const nom = nomParts.join(" ") || prenom // Si pas de nom, utiliser le prénom

      await prisma.client.create({
        data: {
          id_utilisateur: utilisateur.id_utilisateur,
          prenom,
          nom,
          telephone,
        },
      })
    }
    // Si c'est un personnel, créer un enregistrement Personnel avec le téléphone
    else if (roleUtilisateur === "personnel" || roleUtilisateur === "administrateur") {
      // Extraire le prénom et le nom du nom complet
      const [prenom, ...nomParts] = nomComplet.split(" ")
      const nom = nomParts.join(" ") || prenom // Si pas de nom, utiliser le prénom

      await prisma.personnel.create({
        data: {
          id_utilisateur: utilisateur.id_utilisateur,
          prenom,
          nom,
          poste: roleUtilisateur === "administrateur" ? "Administrateur" : "Personnel",
        },
      })
    }

    return utilisateur
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static async trouverParId(id) {
    return prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
      include: {
        client: true,
        personnel: true,
        role_relation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur trouvé
   */
  static async trouverParEmail(email) {
    return prisma.utilisateur.findUnique({
      where: { email },
      include: {
        client: true,
        personnel: true,
        role_relation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Met à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} donneesUtilisateur - Nouvelles données
   * @returns {Promise<Object>} - L'utilisateur mis à jour
   */
  static async mettreAJour(id, donneesUtilisateur) {
    // Extraire le téléphone des données (car il n'est pas dans le modèle Utilisateur)
    const { telephone, ...donneesUtilisateurSansTelephone } = donneesUtilisateur

    // Validation du nom complet si fourni
    if (
      donneesUtilisateurSansTelephone.nom_utilisateur &&
      !validateName(donneesUtilisateurSansTelephone.nom_utilisateur)
    ) {
      throw new Error("Le nom complet ne doit pas contenir de chiffres")
    }

    // Si un nouveau mot de passe est fourni, le hacher
    if (donneesUtilisateurSansTelephone.mot_de_passe) {
      donneesUtilisateurSansTelephone.mot_de_passe = await bcrypt.hash(donneesUtilisateurSansTelephone.mot_de_passe, 10)
    }
    // Support pour le champ password (pour la compatibilité)
    else if (donneesUtilisateurSansTelephone.password) {
      donneesUtilisateurSansTelephone.mot_de_passe = await bcrypt.hash(donneesUtilisateurSansTelephone.password, 10)
      delete donneesUtilisateurSansTelephone.password
    }

    // Si un nouveau rôle est fourni via id_role, mettre à jour le rôle
    if (donneesUtilisateurSansTelephone.id_role) {
      const role = await prisma.role.findUnique({
        where: { id_role: donneesUtilisateurSansTelephone.id_role },
      })

      if (!role) {
        throw new Error("Rôle non trouvé")
      }

      // Convertir le code du rôle en type RoleUtilisateur
      donneesUtilisateurSansTelephone.role = RoleMapper.toBaseRole(role.code)
    }

    // Ajouter la date de modification
    donneesUtilisateurSansTelephone.date_modification = new Date()

    // Mettre à jour l'utilisateur
    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: donneesUtilisateurSansTelephone,
      include: {
        client: true,
        personnel: true,
        role_relation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    // Si un téléphone est fourni, mettre à jour le client ou le personnel
    if (telephone) {
      // Validation du numéro de téléphone
      if (!validatePhoneNumber(telephone)) {
        throw new Error("Format de numéro de téléphone invalide")
      }

      if (utilisateurMisAJour.client) {
        await prisma.client.update({
          where: { id_utilisateur: id },
          data: { telephone },
        })
      } else if (utilisateurMisAJour.personnel) {
        // Note: Le modèle Personnel n'a pas de champ téléphone dans le schéma actuel
        // Si vous souhaitez ajouter ce champ, vous devrez modifier le schéma Prisma
      }
    }

    return utilisateurMisAJour
  }

  /**
   * Suppression logique d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Object>} - L'utilisateur supprimé
   */
  static async supprimer(id) {
    return prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: { supprime_le: new Date() },
    })
  }

  /**
   * Authentifie un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} motDePasse - Mot de passe
   * @returns {Promise<Object|null>} - L'utilisateur authentifié ou null
   */
  static async authentifier(email, motDePasse) {
    const utilisateur = await this.trouverParEmail(email)

    if (!utilisateur || utilisateur.supprime_le) {
      return null
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe)
    return motDePasseValide ? utilisateur : null
  }

  /**
   * Vérifie un mot de passe
   * @param {string} motDePasse - Mot de passe en clair
   * @param {string} motDePasseHache - Mot de passe haché
   * @returns {Promise<boolean>} - True si le mot de passe est correct
   */
  static async verifierMotDePasse(motDePasse, motDePasseHache) {
    return bcrypt.compare(motDePasse, motDePasseHache)
  }

  /**
   * Récupère les permissions d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des permissions
   */
  static async obtenirPermissionsUtilisateur(id) {
    const utilisateur = await this.trouverParId(id)

    if (!utilisateur || !utilisateur.role_relation) {
      return []
    }

    return utilisateur.role_relation.permissions.map((rp) => rp.permission)
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   * @param {number} id - ID de l'utilisateur
   * @param {string} codePermission - Code de la permission
   * @returns {Promise<boolean>} - True si l'utilisateur a la permission
   */
  static async aPermission(id, codePermission) {
    const permissions = await this.obtenirPermissionsUtilisateur(id)
    return permissions.some((p) => p.code === codePermission)
  }
}

export default UtilisateurModel
