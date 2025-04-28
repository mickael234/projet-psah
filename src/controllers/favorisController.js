import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ Ajouter un favori
export const ajouterFavori = async (req, res) => {
  const { id_utilisateur, id_chambre } = req.body;

  if (!id_utilisateur || !id_chambre) {
    return res.status(400).json({ message: "id_utilisateur et id_chambre sont requis." });
  }

  try {
    const favori = await prisma.favori.create({
      data: {
        id_utilisateur: Number(id_utilisateur),
        id_chambre: Number(id_chambre)
      }
    });
    res.status(201).json(favori);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: "Le favori existe déjà." });
    } else {
      res.status(500).json({ error: "Erreur lors de l’ajout du favori.", details: error.message });
    }
  }
};

// ✅ Supprimer un favori
export const supprimerFavori = async (req, res) => {
  const { id_utilisateur, id_chambre } = req.body;

  if (!id_utilisateur || !id_chambre) {
    return res.status(400).json({ message: "id_utilisateur et id_chambre sont requis." });
  }

  try {
    await prisma.favori.delete({
      where: {
        id_utilisateur_id_chambre: {
          id_utilisateur: Number(id_utilisateur),
          id_chambre: Number(id_chambre)
        }
      }
    });
    res.status(200).json({ message: "Favori supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lister les favoris
export const listerFavorisUtilisateur = async (req, res) => {
  const { id_utilisateur } = req.params;

  try {
    const favoris = await prisma.favori.findMany({
      where: { id_utilisateur: Number(id_utilisateur) },
      include: {
        chambre: true
      }
    });
    res.status(200).json(favoris);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
