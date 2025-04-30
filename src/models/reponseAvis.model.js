import prisma from "../config/prisma.js";
const ReponseAvisModel = {
  async findAll() {
    return await prisma.reponseAvis.findMany();
  },

  async findById(id) {
    return await prisma.reponseAvis.findUnique({
      where: { id_reponse_avis: id },
    });
  },

  async findByAvis(idAvis) {
    return await prisma.reponseAvis.findMany({
      where: { id_avis: idAvis },
    });
  },

  async create(data) {
    return await prisma.reponseAvis.create({
      data: data,
    });
  },

  async update(id, newCommentaire) {
    return await prisma.reponseAvis.update({
      where: { id_reponse_avis: id },
      data: {
        commentaire: newCommentaire,
      },
    });
  },

  async delete(id) {
    return await prisma.reponseAvis.delete({
      where: { id_reponse_avis: id },
    });
  }
};

export default ReponseAvisModel;
