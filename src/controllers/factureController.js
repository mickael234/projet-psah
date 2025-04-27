<<<<<<< HEAD
import ReservationModel from '../models/reservation.model.js';
import UtilisateurModel from '../models/utilisateur.model.js';

export const genererFacture = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = await ReservationModel.getFullReservation(id); 

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    const utilisateur = reservation.client.utilisateur;
    const user = await UtilisateurModel.findByEmail(utilisateur.email);
    const billing = user?.billingInfo;
    const chambreInfo = reservation.chambres[0];
    const chambre = chambreInfo?.chambre;
    const dateArrivee = chambreInfo?.date_arrivee;
    const dateDepart = chambreInfo?.date_depart;
    const nbNuits = (new Date(dateDepart) - new Date(dateArrivee)) / (1000 * 60 * 60 * 24);

    const prixChambreTotal = chambre?.prix_par_nuit * nbNuits;
    const totalServices = reservation.services.reduce((acc, s) => acc + s.service.prix * s.quantite, 0);
    const totalServicesLocaux = reservation.services_locaux.reduce((acc, s) => acc + (s.service_local?.prix || 0), 0);
    const totalGeneral = prixChambreTotal + totalServices + totalServicesLocaux;
    const montantPaye = reservation.paiements.reduce((acc, p) => acc + p.montant, 0);

    const facture = {
      date: new Date(),
      client: {
        nom: `${reservation.client.prenom} ${reservation.client.nom}`,
        email: utilisateur.email,
        adresse: billing ? `${billing.address}, ${billing.postalCode}, ${billing.city}, ${billing.country}` : null
      },
      reservation: {
        id: reservation.id_reservation,
        etat: reservation.etat,
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nb_nuits: nbNuits,
        chambre: {
          numero: chambre?.numero_chambre,
          type: chambre?.type_chambre,
          prix_par_nuit: chambre?.prix_par_nuit
        },
        paiement: {
          statut: reservation.etat_paiement,
          montant_total_paye: montantPaye
        }
      },
      services: reservation.services.map(s => ({
        nom: s.service.nom,
        prix: s.service.prix,
        quantite: s.quantite,
        total: s.service.prix * s.quantite
      })),
      services_locaux: reservation.services_locaux.map(s => ({
        nom: s.service_local?.nom,
        prix: s.service_local?.prix || 0
      })),
      montant_total_services: totalServices,
      montant_total_services_locaux: totalServicesLocaux,
      montant_total_general: totalGeneral
    };

    res.status(200).json(facture);

  } catch (error) {
    console.error('Erreur génération JSON :', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture JSON' });
  }
};
=======
import { PrismaClient } from "@prisma/client"
import PDFDocument from "pdfkit"
import { RoleMapper } from "../utils/roleMapper.js"
const prisma = new PrismaClient()

class FactureController {
  /**
   * Vérifie si l'utilisateur a les permissions nécessaires
   * @param {Object} req - Requête Express
   * @param {Array} rolesAutorises - Rôles autorisés
   * @returns {boolean} - L'utilisateur a-t-il les permissions
   */
  static verifierPermissions(req, rolesAutorises) {
    if (!req.user) return false

    // Utiliser le service RoleMapper pour vérifier les permissions
    
    return RoleMapper.hasAuthorizedRole(req.user, rolesAutorises)
  }

  /**
   * Récupère toutes les factures avec filtrage
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getAllFactures(req, res) {
    try {
      const { page = 1, limit = 10, etat, dateDebut, dateFin } = req.query

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

      // Construire les filtres
      const where = {}

      if (etat) {
        where.etat = etat
      }

      if (dateDebut || dateFin) {
        where.date_creation = {}

        if (dateDebut) {
          where.date_creation.gte = new Date(dateDebut)
        }

        if (dateFin) {
          where.date_creation.lte = new Date(dateFin)
        }
      }

      // Récupérer les factures
      const factures = await prisma.facture.findMany({
        where,
        include: {
          reservation: {
            include: {
              client: {
                include: {
                  utilisateur: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          date_creation: "desc",
        },
        skip,
        take: Number.parseInt(limit),
      })

      // Compter le nombre total de factures
      const total = await prisma.facture.count({ where })

      res.status(200).json({
        status: "OK",
        message: "Factures récupérées avec succès",
        data: {
          factures,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / Number.parseInt(limit)),
          },
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération des factures",
        error: error.message,
      })
    }
  }

  /**
   * Récupère une facture par son ID
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getFactureById(req, res) {
    try {
      const { id } = req.params

      const facture = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
        include: {
          reservation: {
            include: {
              client: true,
              chambres: {
                include: {
                  chambre: true,
                },
              },
              services: {
                include: {
                  service: true,
                },
              },
              paiements: true,
            },
          },
        },
      })

      if (!facture) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Facture récupérée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération de la facture",
        error: error.message,
      })
    }
  }

  /**
   * Récupère la facture d'une réservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async getFactureByReservation(req, res) {
    try {
      const { id } = req.params

      const facture = await prisma.facture.findFirst({
        where: { id_reservation: Number.parseInt(id) },
        include: {
          reservation: {
            include: {
              client: true,
              chambres: {
                include: {
                  chambre: true,
                },
              },
              services: {
                include: {
                  service: true,
                },
              },
              paiements: true,
            },
          },
        },
      })

      if (!facture) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée pour cette réservation",
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Facture récupérée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la récupération de la facture",
        error: error.message,
      })
    }
  }

  /**
   * Crée une nouvelle facture
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async createFacture(req, res) {
    try {
      const { id_reservation, details, notes } = req.body

      // Vérifier si la réservation existe
      const reservation = await prisma.reservation.findUnique({
        where: { id_reservation: Number.parseInt(id_reservation) },
        include: {
          client: true,
        },
      })

      if (!reservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée",
        })
      }

      // Vérifier si une facture existe déjà pour cette réservation
      const factureExistante = await prisma.facture.findFirst({
        where: { id_reservation: Number.parseInt(id_reservation) },
      })

      if (factureExistante) {
        return res.status(400).json({
          status: "ERROR",
          message: "Une facture existe déjà pour cette réservation",
        })
      }

      // Créer la facture
      const facture = await prisma.facture.create({
        data: {
          id_reservation: Number.parseInt(id_reservation),
          montant_total: reservation.prix_total,
          date_creation: new Date(),
          etat: "en_attente",
          details: details || {},
          notes: notes || null,
        },
      })

      // Ajouter une entrée dans le journal des modifications
      await prisma.journalModifications.create({
        data: {
          id_utilisateur: req.user.userId,
          type_ressource: "facture",
          id_ressource: facture.id_facture,
          action: "creation",
          details: {
            id_reservation: id_reservation,
            montant_total: reservation.prix_total.toString(),
          },
        },
      })

      res.status(201).json({
        status: "OK",
        message: "Facture créée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la création de la facture",
        error: error.message,
      })
    }
  }

  /**
   * Met à jour une facture
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async updateFacture(req, res) {
    try {
      const { id } = req.params
      const { etat, details, notes } = req.body

      // Vérifier si la facture existe
      const factureExistante = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
      })

      if (!factureExistante) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      // Mettre à jour la facture
      const facture = await prisma.facture.update({
        where: { id_facture: Number.parseInt(id) },
        data: {
          ...(etat ? { etat } : {}),
          ...(details ? { details } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      })

      // Ajouter une entrée dans le journal des modifications
      await prisma.journalModifications.create({
        data: {
          id_utilisateur: req.user.userId,
          type_ressource: "facture",
          id_ressource: Number.parseInt(id),
          action: "modification",
          details: {
            etat: etat || factureExistante.etat,
          },
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Facture mise à jour avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la mise à jour de la facture",
        error: error.message,
      })
    }
  }

  /**
   * Envoie une facture par email
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async envoyerFacture(req, res) {
    try {
      const { id } = req.params

      // Récupérer la facture avec les informations nécessaires
      const facture = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
        include: {
          reservation: {
            include: {
              client: {
                include: {
                  utilisateur: true,
                },
              },
            },
          },
        },
      })

      if (!facture) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      // Simuler l'envoi d'email (à implémenter avec un service d'email)
      const emailClient = facture.reservation.client.utilisateur.email

      // Mettre à jour l'état de la facture
      await prisma.facture.update({
        where: { id_facture: Number.parseInt(id) },
        data: {
          etat: "envoyee",
          date_envoi: new Date(),
        },
      })

      // Ajouter une entrée dans le journal des modifications
      await prisma.journalModifications.create({
        data: {
          id_utilisateur: req.user.userId,
          type_ressource: "facture",
          id_ressource: Number.parseInt(id),
          action: "envoi",
          details: {
            email_destinataire: emailClient,
            date_envoi: new Date().toISOString(),
          },
        },
      })

      res.status(200).json({
        status: "OK",
        message: `Facture envoyée avec succès à ${emailClient}`,
        data: {
          id_facture: facture.id_facture,
          email_client: emailClient,
          date_envoi: new Date(),
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'envoi de la facture",
        error: error.message,
      })
    }
  }

  /**
   * Génère une facture pour une réservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async genererFacture(req, res) {
    try {
      // Vérifier les permissions
      if (
        !FactureController.verifierPermissions(req, [
          "COMPTABILITE",
          "RECEPTIONNISTE",
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message: "Vous n'avez pas les permissions nécessaires pour générer une facture",
        })
      }

      const { id } = req.params

      // Récupérer la réservation avec toutes les informations nécessaires
      const reservation = await prisma.reservation.findUnique({
        where: {
          id_reservation: Number.parseInt(id),
          supprime_le: null,
        },
        include: {
          client: {
            include: {
              utilisateur: true,
            },
          },
          chambres: {
            include: {
              chambre: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          paiements: true,
        },
      })

      if (!reservation) {
        return res.status(404).json({
          status: "ERROR",
          message: "Réservation non trouvée ou supprimée",
        })
      }

      // Récupérer les informations de facturation du client
      const userId = reservation.client.id_utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          billingInfo: true,
        },
      })

      // Calculer les détails de la facture
      const detailsChambres = reservation.chambres.map((chambreRes) => {
        const dateArrivee = new Date(chambreRes.date_arrivee)
        const dateDepart = new Date(chambreRes.date_depart)
        const nbJours = Math.ceil((dateDepart - dateArrivee) / (1000 * 60 * 60 * 24))
        const prixTotal = Number(chambreRes.chambre.prix_par_nuit) * nbJours

        return {
          description: `Chambre ${chambreRes.chambre.numero_chambre} (${chambreRes.chambre.type_chambre})`,
          dateArrivee: dateArrivee.toISOString().split("T")[0],
          dateDepart: dateDepart.toISOString().split("T")[0],
          nbJours,
          prixUnitaire: Number(chambreRes.chambre.prix_par_nuit),
          prixTotal,
        }
      })

      const detailsServices = reservation.services.map((serviceRes) => {
        return {
          description: serviceRes.service.nom,
          quantite: serviceRes.quantite,
          prixUnitaire: Number(serviceRes.service.prix),
          prixTotal: Number(serviceRes.service.prix) * serviceRes.quantite,
        }
      })

      const totalChambres = detailsChambres.reduce((sum, item) => sum + item.prixTotal, 0)
      const totalServices = detailsServices.reduce((sum, item) => sum + item.prixTotal, 0)
      const totalGeneral = totalChambres + totalServices

      // Vérifier si le montant total correspond au prix total de la réservation
      if (Math.abs(totalGeneral - Number(reservation.prix_total)) > 0.01) {
        console.warn(
          `Attention: Le prix total calculé (${totalGeneral}) ne correspond pas au prix total de la réservation (${reservation.prix_total})`,
        )
      }

      // Calculer le statut de paiement
      const totalPaye = reservation.paiements
        .filter((p) => p.etat === "complete")
        .reduce((sum, p) => sum + Number(p.montant), 0)
      const reste = Number(reservation.prix_total) - totalPaye
      const statutPaiement = reste <= 0 ? "Payé" : "Partiellement payé"

      // Créer l'objet facture
      const facture = {
        numeroFacture: `F-${new Date().getFullYear()}-${id.padStart(6, "0")}`,
        dateFacture: new Date().toISOString().split("T")[0],
        client: {
          nom: `${reservation.client.prenom} ${reservation.client.nom}`,
          email: reservation.client.utilisateur.email,
          telephone: reservation.client.telephone || "Non spécifié",
          adresseFacturation: user?.billingInfo
            ? {
                adresse: user.billingInfo.address,
                ville: user.billingInfo.city,
                codePostal: user.billingInfo.postalCode,
                pays: user.billingInfo.country,
                nomFacturation:
                  user.billingInfo.billingName || `${reservation.client.prenom} ${reservation.client.nom}`,
                numeroTVA: user.billingInfo.vatNumber || "Non spécifié",
              }
            : "Informations de facturation non disponibles",
        },
        reservation: {
          id: reservation.id_reservation,
          dateReservation: new Date(reservation.date_reservation).toISOString().split("T")[0],
          etat: reservation.etat,
        },
        detailsChambres,
        detailsServices,
        totaux: {
          totalChambres,
          totalServices,
          totalGeneral,
          totalPaye,
          reste,
          statutPaiement,
        },
      }

      // Enregistrer la facture dans la base de données si elle n'existe pas déjà
      const factureExistante = await prisma.facture.findFirst({
        where: { id_reservation: Number.parseInt(id) },
      })

      if (!factureExistante) {
        await prisma.facture.create({
          data: {
            id_reservation: Number.parseInt(id),
            montant_total: reservation.prix_total,
            date_creation: new Date(),
            etat: reste <= 0 ? "payee" : "en_attente",
            details: facture,
          },
        })
      }

      res.status(200).json({
        status: "OK",
        message: "Facture générée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la génération de la facture",
        error: error.message,
      })
    }
  }

  static async genererFacturePDF(req, res) {
    try {
      const { id } = req.params

      // Récupérer la facture avec toutes les informations nécessaires
      const facture = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
        include: {
          reservation: {
            include: {
              client: {
                include: {
                  utilisateur: true,
                },
              },
              chambres: {
                include: {
                  chambre: true,
                },
              },
              services: {
                include: {
                  service: true,
                },
              },
              paiements: true,
            },
          },
        },
      })

      if (!facture) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      // Vérifier que les détails de la facture existent
      if (!facture.details) {
        return res.status(400).json({
          status: "ERROR",
          message: "Les détails de la facture sont manquants",
        })
      }

      // Extraire les détails de la facture
      const details = facture.details

      // Créer un document PDF
      const doc = new PDFDocument()

      // Configurer les en-têtes de réponse pour le téléchargement du PDF
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", `attachment; filename=facture-${id}.pdf`)

      // Pipe le PDF directement dans la réponse
      doc.pipe(res)

      // En-tête de la facture
      doc.fontSize(25).text("Facture", { align: "center" })
      doc.moveDown()

      // Informations sur la facture
      doc
        .fontSize(14)
        .text(
          `Numéro de Facture: ${details.numeroFacture || `F-${new Date().getFullYear()}-${id.toString().padStart(6, "0")}`}`,
        )
      doc.text(`Date de Facture: ${new Date(facture.date_creation).toLocaleDateString()}`)
      doc.moveDown()

      // Informations sur le client
      doc.fontSize(16).text("Informations sur le Client:")
      doc.fontSize(12).text(`Nom: ${facture.reservation.client.prenom} ${facture.reservation.client.nom}`)
      doc.text(`Email: ${facture.reservation.client.utilisateur.email}`)
      doc.text(`Téléphone: ${facture.reservation.client.telephone || "Non spécifié"}`)
      doc.moveDown()

      // Informations sur la réservation
      doc.fontSize(16).text("Informations sur la Réservation:")
      doc.fontSize(12).text(`ID de Réservation: ${facture.reservation.id_reservation}`)
      doc.text(`Date de Réservation: ${new Date(facture.reservation.date_reservation).toLocaleDateString()}`)
      doc.text(`État de Réservation: ${facture.reservation.etat}`)
      doc.moveDown()

      // Détails des Chambres
      doc.fontSize(16).text("Détails des Chambres:")

      // Vérifier si details.detailsChambres existe
      if (details.detailsChambres && Array.isArray(details.detailsChambres)) {
        details.detailsChambres.forEach((chambre) => {
          doc.fontSize(12).text(`Description: ${chambre.description}`)
          doc.text(`Date d'Arrivée: ${chambre.dateArrivee}`)
          doc.text(`Date de Départ: ${chambre.dateDepart}`)
          doc.text(`Nombre de Jours: ${chambre.nbJours}`)
          doc.text(`Prix Unitaire: ${chambre.prixUnitaire} €`)
          doc.text(`Prix Total: ${chambre.prixTotal} €`)
          doc.moveDown()
        })
      } else {
        // Si les détails des chambres ne sont pas disponibles, afficher les informations de base
        facture.reservation.chambres.forEach((chambreRes) => {
          const dateArrivee = new Date(chambreRes.date_arrivee)
          const dateDepart = new Date(chambreRes.date_depart)
          const nbJours = Math.ceil((dateDepart - dateArrivee) / (1000 * 60 * 60 * 24))
          const prixTotal = Number(chambreRes.chambre.prix_par_nuit) * nbJours

          doc.fontSize(12).text(`Chambre: ${chambreRes.chambre.numero_chambre} (${chambreRes.chambre.type_chambre})`)
          doc.text(`Date d'Arrivée: ${dateArrivee.toLocaleDateString()}`)
          doc.text(`Date de Départ: ${dateDepart.toLocaleDateString()}`)
          doc.text(`Nombre de Jours: ${nbJours}`)
          doc.text(`Prix par Nuit: ${chambreRes.chambre.prix_par_nuit} €`)
          doc.text(`Prix Total: ${prixTotal} €`)
          doc.moveDown()
        })
      }

      // Détails des Services
      if (facture.reservation.services && facture.reservation.services.length > 0) {
        doc.fontSize(16).text("Détails des Services:")

        // Vérifier si details.detailsServices existe
        if (details.detailsServices && Array.isArray(details.detailsServices)) {
          details.detailsServices.forEach((service) => {
            doc.fontSize(12).text(`Description: ${service.description}`)
            doc.text(`Quantité: ${service.quantite}`)
            doc.text(`Prix Unitaire: ${service.prixUnitaire} €`)
            doc.text(`Prix Total: ${service.prixTotal} €`)
            doc.moveDown()
          })
        } else {
          // Si les détails des services ne sont pas disponibles, afficher les informations de base
          facture.reservation.services.forEach((serviceRes) => {
            doc.fontSize(12).text(`Service: ${serviceRes.service.nom}`)
            doc.text(`Quantité: ${serviceRes.quantite}`)
            doc.text(`Prix Unitaire: ${serviceRes.service.prix} €`)
            doc.text(`Prix Total: ${Number(serviceRes.service.prix) * serviceRes.quantite} €`)
            doc.moveDown()
          })
        }
      }

      // Totaux
      doc.fontSize(16).text("Totaux:")

      // Calculer les totaux si details.totaux n'existe pas
      if (details.totaux) {
        doc.fontSize(12).text(`Total Chambres: ${details.totaux.totalChambres} €`)
        doc.text(`Total Services: ${details.totaux.totalServices} €`)
        doc.text(`Total Général: ${details.totaux.totalGeneral} €`)
        doc.text(`Total Payé: ${details.totaux.totalPaye} €`)
        doc.text(`Reste: ${details.totaux.reste} €`)
        doc.text(`Statut de Paiement: ${details.totaux.statutPaiement}`)
      } else {
        // Calculer les totaux manuellement
        const totalChambres = facture.reservation.chambres.reduce((sum, chambreRes) => {
          const dateArrivee = new Date(chambreRes.date_arrivee)
          const dateDepart = new Date(chambreRes.date_depart)
          const nbJours = Math.ceil((dateDepart - dateArrivee) / (1000 * 60 * 60 * 24))
          return sum + Number(chambreRes.chambre.prix_par_nuit) * nbJours
        }, 0)

        const totalServices = facture.reservation.services.reduce((sum, serviceRes) => {
          return sum + Number(serviceRes.service.prix) * serviceRes.quantite
        }, 0)

        const totalGeneral = totalChambres + totalServices

        const totalPaye = facture.reservation.paiements
          .filter((p) => p.etat === "complete")
          .reduce((sum, p) => sum + Number(p.montant), 0)

        const reste = Number(facture.montant_total) - totalPaye

        doc.fontSize(12).text(`Total Chambres: ${totalChambres.toFixed(2)} €`)
        doc.text(`Total Services: ${totalServices.toFixed(2)} €`)
        doc.text(`Total Général: ${totalGeneral.toFixed(2)} €`)
        doc.text(`Total Payé: ${totalPaye.toFixed(2)} €`)
        doc.text(`Reste: ${reste.toFixed(2)} €`)
        doc.text(`Statut de Paiement: ${reste <= 0 ? "Payé" : "Partiellement payé"}`)
      }

      // Notes
      if (facture.notes) {
        doc.moveDown()
        doc.fontSize(16).text("Notes:")
        doc.fontSize(12).text(facture.notes)
      }

      // Pied de page
      doc.moveDown(2)
      doc.fontSize(10).text("Merci pour votre confiance!", { align: "center" })
      doc.text(`Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`, {
        align: "center",
      })

      // Finaliser le PDF
      doc.end()
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de la génération du PDF",
        error: error.message,
      })
    }
  }

  /**
   * Marque une facture comme payée
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async marquerCommePaye(req, res) {
    try {
      const { id } = req.params

      // Vérifier si la facture existe
      const factureExistante = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
      })

      if (!factureExistante) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      // Mettre à jour l'état de la facture
      const facture = await prisma.facture.update({
        where: { id_facture: Number.parseInt(id) },
        data: {
          etat: "payee",
          date_paiement: new Date(),
        },
      })

      // Ajouter une entrée dans le journal des modifications
      await prisma.journalModifications.create({
        data: {
          id_utilisateur: req.user.userId,
          type_ressource: "facture",
          id_ressource: Number.parseInt(id),
          action: "paiement",
          details: {
            date_paiement: new Date().toISOString(),
          },
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Facture marquée comme payée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors du marquage de la facture comme payée",
        error: error.message,
      })
    }
  }

  /**
   * Annule une facture
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static async annulerFacture(req, res) {
    try {
      const { id } = req.params
      const { raison } = req.body

      // Vérifier si la facture existe
      const factureExistante = await prisma.facture.findUnique({
        where: { id_facture: Number.parseInt(id) },
      })

      if (!factureExistante) {
        return res.status(404).json({
          status: "ERROR",
          message: "Facture non trouvée",
        })
      }

      // Mettre à jour l'état de la facture
      const facture = await prisma.facture.update({
        where: { id_facture: Number.parseInt(id) },
        data: {
          etat: "annulee",
          notes: raison || "Annulation sans raison spécifiée",
        },
      })

      // Ajouter une entrée dans le journal des modifications
      await prisma.journalModifications.create({
        data: {
          id_utilisateur: req.user.userId,
          type_ressource: "facture",
          id_ressource: Number.parseInt(id),
          action: "annulation",
          details: {
            raison: raison || "Annulation sans raison spécifiée",
            date_annulation: new Date().toISOString(),
          },
        },
      })

      res.status(200).json({
        status: "OK",
        message: "Facture annulée avec succès",
        data: facture,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: "ERROR",
        message: "Erreur lors de l'annulation de la facture",
        error: error.message,
      })
    }
  }
}

export default FactureController
>>>>>>> origin/hassan
