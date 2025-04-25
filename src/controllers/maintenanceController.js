import MaintenanceModel from '../models/maintenance.model.js';

//  Créer une maintenance
export const creerMaintenance = async (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  try {
    const maintenance = await MaintenanceModel.createMaintenance({
      id_chambre: parseInt(id),
      description,
      date: new Date(date)
    });

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Erreur POST maintenance:', error);
    res.status(500).json({ 
      message: "Erreur lors de la création de la maintenance", 
      error: error.message 
    });
  }
};

// Lister les maintenances par chambre
export const listerMaintenancesParChambre = async (req, res) => {
  const { id } = req.params;

  try {
    const maintenances = await MaintenanceModel.findByChambre(id);
    res.status(200).json(maintenances);
  } catch (error) {
    console.error('Erreur GET maintenance:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des maintenances", 
      error: error.message 
    });
  }
};
