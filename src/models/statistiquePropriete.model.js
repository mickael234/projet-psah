import prisma from '../config/prisma.js';

const StatistiqueProprieteModel = {
  async create(data) {
    return await prisma.statistiquePropriete.create({ data });
  },

  async updateByHebergement(id_hebergement, data) {
    return await prisma.statistiquePropriete.updateMany({
      where: { id_hebergement },
      data,
    });
  },

  async getByUtilisateur(id_utilisateur) {
    return await prisma.statistiquePropriete.findMany({
      where: { id_utilisateur },
      include: { hebergement: true }
    });
  },

  async getByHebergement(id_hebergement) {
    return await prisma.statistiquePropriete.findUnique({
      where: { id_hebergement }
    });
  }
};

export default StatistiqueProprieteModel;
