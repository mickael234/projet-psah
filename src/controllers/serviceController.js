import ServiceModel from '../models/service.model.js';
const serviceModel = new ServiceModel();


//  Créer un service
export const creerService = async (req, res) => {
  const { nom, description, prix } = req.body;

  if (!nom || !prix) {
    return res.status(400).json({ message: "Nom et prix sont requis." });
  }

  try {
    const nouveauService = await serviceModel.create({
      nom,
      description,
      prix: parseFloat(prix)
    });
    res.status(201).json(nouveauService);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du service.", details: error.message });
  }
};

//  Lister tous les services
export const listerServices = async (req, res) => {
  try {
    const services = await serviceModel.findAll();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des services." });
  }
};

// Modifier un service
export const modifierService = async (req, res) => {
  const { id } = req.params;
  const { nom, description, prix } = req.body;

  try {
    const serviceModifie = await serviceModel.update(Number(id), {
      nom,
      description,
      prix: prix ? parseFloat(prix) : undefined
    });
    res.status(200).json(serviceModifie);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du service.", details: error.message });
  }
};

//  Supprimer un service (avec vérif s'il est utilisé)
export const supprimerService = async (req, res) => {
  const { id } = req.params;

  try {
    await serviceModel.delete(Number(id));
    res.status(200).json({ message: "Service supprimé avec succès." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
