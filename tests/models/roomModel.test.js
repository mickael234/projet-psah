import Room from '../../src/models/roomModel';
import { room as _room } from '../../__mocks__/prisma.mock.js';

describe('Room Model', () => {
  it('should return room by ID with media and amenities', async () => {
    const mockRoom = {
      id: 1,
      number: "102",
      type: "Standard",
      pricePerNight: 99.00,
      status: "available",
      description: "Brief example description",
      media: [
        { 
          id: 1, 
          roomId: 1, 
          type: "image", 
          url: "someUrl.jpg", 
          title: "Image 1", 
          description: "An image for room 102"
        }
      ],
      amenities: [
        {
          roomId: 1,
          amenityId: 22,
          amenity: { 
            id: 22, 
            name: 'Wi-Fi' 
          } 
        }
      ],
    };


    _room.findUnique.mockResolvedValue(mockRoom);

    const room = await Room.findById(1);

    expect(room).toEqual(mockRoom);

    expect(_room.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        media: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

  });
  
});