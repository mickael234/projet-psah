import ChambreModel from '../models/chambre.model.js';

class ChambreController {
    /**
     * Récupère les détails d'une chambre en fonction de son identifiant.
     * @param {Express.Request} req - Requête contenant l'id de la chambre dans les paramètres.
     * @param {Express.Response} res - Réponse pour renvoyer les données ou les erreurs.
     * @returns {Promise<void>}
     */
    static async getRoomDetails(req, res) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    status: 'BAD REQUEST',
                    message: "L'id de la chambre n'est valide."
                });
            }

            const chambre = await ChambreModel.getWithRelations(id);

            if (!chambre) {
                return res.status(404).json({
                    status: 'NOT FOUND',
                    message: "Aucune chambre n'a été trouvé"
                });
            }

            res.status(200).json({
                status: 'OK',
                data: {
                    chambre
                }
            });
        } catch (error) {
            console.error('Une erreur est survenue : ' + error);
            res.status(500).json({
                status: 'INTERNAL SERVER ERROR',
                message: 'Une erreur interne est survenue.'
            });
        }
    }
}

export default ChambreController;
