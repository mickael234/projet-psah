import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class UtilisateurModel {
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10);

    return prisma.utilisateur.create({
      data: {
        ...userData,
        mot_de_passe: hashedPassword
      }
    });
  }

  async findById(id) {
    return prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
      include: {
        client: true,
        personnel: true
      }
    });
  }

  static getWithRelations(id) {
    return prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
      include: {
        client: true,
        personnel: true
      }
    });
  }

  static findByEmail(email) {
    return prisma.utilisateur.findUnique({
      where: { email }
    });
  }

  static findByUsername(username) {
    return prisma.utilisateur.findUnique({
      where: { nom_utilisateur: username }
    });
  }

  async findAll(filters = {}) {
    return prisma.utilisateur.findMany({
      where: {
        ...filters,
        supprime_le: null
      },
      include: {
        client: true,
        personnel: true
      }
    });
  }

  async update(id, userData) {
    if (userData.mot_de_passe) {
      userData.mot_de_passe = await bcrypt.hash(userData.mot_de_passe, 10);
    }

    return prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: userData
    });
  }

  async delete(id) {
    return prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: { supprime_le: new Date() }
    });
  }

  async authenticate(email, password) {
    const user = await UtilisateurModel.findByEmail(email);

    if (!user || user.supprime_le) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);
    return passwordMatch ? user : null;
  }

  async hasRole(id, role) {
    const user = await this.findById(id);
    return user && user.role === role;
  }
}

export default UtilisateurModel;
