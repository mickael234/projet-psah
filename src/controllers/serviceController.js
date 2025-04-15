import ServiceModel from "../models/service.model";
import ReservationModel from "../models/reservation.model"
import { PrismaClient } from "@prisma/client";
import { RoleMapper } from "../utils/roleMapper.js";

const prisma = new PrismaClient();

class ServiceController {
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
   * Créer un service
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static creatService = async (req,res) => {
    try{
      if (
        !ServiceController.verifierPermissions(req, [
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
          "RECEPTIONNISTE",
        ])
      ){
        return res.status(403).json({
          status: "ERROR",
          message:
            "Vous n'avez pas les permissions nécessaires pour créer un service",
        });
      }
      else{
        const {nom, description, prix}  = req.body
        if(!nom || !description || !prix){
          return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }else {
          if (isNaN(prix) || Number(prix) <= 0) {
            return res.status(400).json({ message: 'Le prix doit être un nombre positif.' });
          }else {
            const newService = await ServiceModel.create({nom,description,prix})
            res.status(200).jsonn({
              status: "OK",
              massage: "Service créer avec success",
              newService: newService
            })
          }
        }
      }
    }catch(error){
      res.status(500).json({
        status: "error",
        message: "erreur lors du creation du service",
        error: error.message,
      });
    }
  }
  /**
   * lié un service à une reservation
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static createServiceReservation = async (req,res) => {
    const {id_reservation,id_service} = req.body
    try {
      if (
        !ServiceController.verifierPermissions(req, [
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
          "RECEPTIONNISTE",
        ])
      ){
        return res.status(403).json({
          status: "ERROR",
          message:
            "Vous n'avez pas les permissions nécessaires pour créer un service",
        });
      }else{
            if(!id_reservation || !id_service){
                  const reservationExist = await ReservationModel.findById(id_reservation)
                  if(!reservationExist){
                    return res.status(404).json({
                      status: "ERROR",
                      message: "la reservation que vous essayez de lié a un service n'existe pas",
                    });
                  }
                  const serviceExist = await ServiceModel.findById(id_service)
                  if(!serviceExist){
                    return res.status(404).json({
                      status: "ERROR",
                      message: "le  service que vous essayez de lié a un reservation n'existe pas"
                    })
                  }
                  
            }
      }
    }catch(error){
      return res.status(403).json({
        status: "ERROR",
        message:
          "Vous n'avez pas les permissions nécessaires pour lié un service à une reservation",
      });
    }
  }

  /**
   * Récupère tous les services
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static getAllServices = async (req, res) => {
    try {
      const services = await ServiceModel.findMany();
      res.status(200).json({
        status: "ok",
        message: "liste Services recuperer avec succés",
        data: services,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "erreur lors du chargement de tous les listes de services",
        error: error.message,
      });
    }
  };
  /**
   * mettre à jour  un service
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static updateService = async (req, res) => {
    try {
      if (
        !ServiceController.verifierPermissions(req, [
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
          "RECEPTIONNISTE",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message:
            "Vous n'avez pas les permissions nécessaires pour mettre à jour ce service",
        });
      } else {
        const { id } = req.params.id;
        const verifieServiceExiste = await ServiceModel.findById(id);
        if (!verifieServiceExiste) {
          return res.status(404).json({
            status: "ERROR",
            message: "le service que vous essayez de supprier n'existe pas",
          });
        } else { 
            const {nom, description, prix } = req.body
            if (!nom || !description || !prix) {
                return res.status(400).json({ message: 'Tous les champs sont requis.' });
              }else{
                if (isNaN(prix) || Number(prix) <= 0) {
                    return res.status(400).json({ message: 'Le prix doit être un nombre positif.' });
                  }else{
                    const updatedService = await ServiceModel.update(id, {nom, description, prix})
                    res.status(200).json({
                        status: "OK",
                        massage: "service mis à jour avec success",
                        updatedService: updatedService
                    })
                  }
              }
            
        }
      }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `erreur lors du mise à jour du service dans l' id est : ${id} `,
            error: error.message,
          });
    }
  };
  /**
   * supprimer un service
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  static deleteService = async (req, res) => {
    try {
      if (
        !ServiceController.verifierPermissions(req, [
          "RESPONSABLE_HEBERGEMENT",
          "ADMIN_GENERAL",
          "SUPER_ADMIN",
          "RECEPTIONNISTE",
        ])
      ) {
        return res.status(403).json({
          status: "ERROR",
          message:
            "Vous n'avez pas les permissions nécessaires pour supprimer un service",
        });
      }
      const { id } = req.params.id;
      const verifieServiceExiste = await ServiceModel.findById(id);
      if (!verifieServiceExiste) {
        return res.status(404).json({
          status: "ERROR",
          message: "le service que vous essayez de supprier n'existe pas",
        });
      } else {
        const deletedService = await ServiceModel.delete(id);
        res.status(200).json({
          status: "OK",
          message: `service supprimer avec success`,
          deletedService: deletedService,
        });
      }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `erreur lors du suppression du service  dans id est  ${id}`,
            error: error.message,
          });
    }
  };
}
