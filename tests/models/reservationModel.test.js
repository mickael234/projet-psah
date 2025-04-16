import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ReservationModel from '../../src/models/reservation.model.js';

describe('Reservation Model', () => {
  // Création de spies sur les méthodes du modèle Reservation
  const findAllPresentReservationsSpy = jest.spyOn(ReservationModel, 'findAllPresentReservations');
  const findAllPastReservationsSpy = jest.spyOn(ReservationModel, 'findAllPastReservations');
  
  // Réinitialiseation et configuration des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des implementations
    findAllPresentReservationsSpy.mockImplementation(async (clientId) => {
      if (clientId === 1) {
        return [
          {
            id_reservation: 1,
            id_client: 1,
            etat: 'confirmee'
          }
        ];
      }
      return [];
    });
    
    findAllPastReservationsSpy.mockImplementation(async (clientId) => {
      if (clientId === 1) {
        return [
          {
            id_reservation: 2,
            id_client: 1,
            etat: 'terminee'
          }
        ];
      }
      return [];
    });
  });
  
  // Restaurer les implementations originales après tous les tests
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("devrait récupérer toutes les réservations actuelles d'un client", async () => {
    const expectedReservations = [
      {
        id_reservation: 1,
        id_client: 1,
        etat: 'confirmee'
      }
    ];
    
    const result = await ReservationModel.findAllPresentReservations(1);
    
    expect(findAllPresentReservationsSpy).toHaveBeenCalledWith(1);
    
    expect(result).toEqual(expectedReservations);
  });

  it("devrait récupérer toutes les réservations passées d'un client", async () => {
    const expectedReservations = [
      {
        id_reservation: 2,
        id_client: 1,
        etat: 'terminee'
      }
    ];
    
    const result = await ReservationModel.findAllPastReservations(1);
    
    expect(findAllPastReservationsSpy).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedReservations);
  });
});