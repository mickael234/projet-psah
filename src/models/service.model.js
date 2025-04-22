import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ServiceModel {
  async create(serviceData) {
    return prisma.service.create({
      data: serviceData
    });
  }

  async findById(id) {
    return prisma.service.findUnique({
      where: { id_service: id }
    });
  }

  async findAll() {
    return prisma.service.findMany();
  }

  async update(id, serviceData) {
    return prisma.service.update({
      where: { id_service: id },
      data: serviceData
    });
  }

  async delete(id) {
    const reservations = await prisma.reservationsServices.findMany({
      where: { id_service: id }
    });

    if (reservations.length > 0) {
      throw new Error('Ce service est utilisé dans des réservations et ne peut pas être supprimé');
    }

    return prisma.service.delete({
      where: { id_service: id }
    });
  }

  static getReservations(id) {
    return prisma.reservationsServices.findMany({
      where: { id_service: id },
      include: {
        reservation: true
      }
    });
  }
}

export default ServiceModel;
