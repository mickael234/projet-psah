import prisma from '../config/prisma.js';

const ReservationsServicesModel = {
  async ajouterService({ id_reservation, id_service, quantite }) {
    return await prisma.reservationsServices.create({
      data: {
        id_reservation,
        id_service,
        quantite,
        date_demande: new Date()
      }
    });
  }
};

export default ReservationsServicesModel;
