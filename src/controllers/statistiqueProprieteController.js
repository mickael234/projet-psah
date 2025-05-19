import StatistiqueProprieteModel from '../models/statistiquePropriete.model.js';

class StatistiqueProprieteController {
  static async getStatsByUser(req, res) {
    try {
      const id_utilisateur = req.user.id_utilisateur;
      const stats = await StatistiqueProprieteModel.getByUtilisateur(id_utilisateur);

      return res.status(200).json({ status: 'OK', data: stats });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'ERREUR SERVEUR', message: 'Erreur interne' });
    }
  }
}

export default StatistiqueProprieteController;
