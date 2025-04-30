import ReponseAvisModel from "../models/reponseAvis.model.js";
import AvisModel from "../models/avis.model.js";

class ReponseAvisController {

  static async getAllReponses(req, res) {
    try {
      const reponses = await ReponseAvisModel.findAll();
      if (!reponses || reponses.length === 0) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucune réponse n'a été trouvée."
        });
      }

      return res.status(200).json({
        status: "OK",
        data: reponses
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la récupération des réponses."
      });
    }
  }

  static async getReponsesByAvis(req, res) {
    try {
      const idAvis = Number(req.params.idAvis);
      const reponses = await ReponseAvisModel.findByAvis(idAvis);

      if (!reponses || reponses.length === 0) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "Aucune réponse trouvée pour cet avis."
        });
      }

      return res.status(200).json({
        status: "OK",
        data: reponses
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la récupération des réponses."
      });
    }
  }

  static async getReponseById(req, res) {
    try {
      const id = Number(req.params.idReponse);
      const reponse = await ReponseAvisModel.findById(id);

      if (!reponse) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "La réponse n'existe pas."
        });
      }

      return res.status(200).json({
        status: "OK",
        data: reponse
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la récupération de la réponse."
      });
    }
  }

  static async createReponse(req, res) {
    try {
      const idAvis = Number(req.params.idAvis);
      const commentaire = req.body.commentaire;
      const idPersonnel = req.user.id_utilisateur;

      const avis = await AvisModel.findById(idAvis);
      if (!avis) {
        return res.status(404).json({
          status: 'RESSOURCE NON TROUVEE',
          message: "L'avis n'existe pas."
        });
      }

      if (!commentaire || commentaire.length < 5) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "Le commentaire est invalide (trop court)."
        });
      }

      const nouvelleReponse = await ReponseAvisModel.create({
        commentaire,
        id_avis: idAvis,
        id_personnel: idPersonnel,
      });

      return res.status(201).json({
        status: "OK",
        data: nouvelleReponse
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la création de la réponse."
      });
    }
  }

  static async updateReponse(req, res) {
    try {
      const id = Number(req.params.idReponse);
      const commentaire = req.body.commentaire;

      if (!commentaire || commentaire.length < 5) {
        return res.status(400).json({
          status: 'MAUVAISE DEMANDE',
          message: "Le commentaire est invalide (trop court)."
        });
      }

      const updated = await ReponseAvisModel.update(id, commentaire);

      return res.status(200).json({
        status: "OK",
        data: updated
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la mise à jour de la réponse."
      });
    }
  }

  static async deleteReponse(req, res) {
    try {
      const id = Number(req.params.idReponse);

      await ReponseAvisModel.delete(id);

      return res.status(200).json({
        status: "SUPPRIME",
        message: "Réponse supprimée avec succès."
      });

    } catch (error) {
      console.error('Erreur :', error);
      return res.status(500).json({
        status: 'ERREUR SERVEUR',
        message: "Erreur interne lors de la suppression de la réponse."
      });
    }
  }
}

export default ReponseAvisController;
