import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST /api/hebergements/:id/maintenance
export const creerMaintenance = async (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  try {
    const maintenance = await prisma.maintenance.create({
      data: {
        id_chambre: parseInt(id),
        description,
        date: new Date(date),
      }
    });
    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Erreur POST maintenance:', error);
    res.status(500).json({ message: "Erreur lors de la création de la maintenance", error: error.message });
  }
};

// GET /api/hebergements/:id/maintenance
export const listerMaintenancesParChambre = async (req, res) => {
  const { id } = req.params;

  try {
    const maintenances = await prisma.maintenance.findMany({
      where: {
        id_chambre: parseInt(id)
      },
      orderBy: {
        date: 'desc'  // ✅ correction ici
      }
    });
    res.status(200).json(maintenances);
  } catch (error) {
    console.error('Erreur GET maintenance:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des maintenances", error: error.message });
  }
};
