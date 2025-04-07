import RoomController from "../../src/controllers/roomController";
import Room from "../../src/models/roomModel";

jest.mock("../../src/models/roomModel");

describe("Room Controller", ()=> {

    it("should return a room with a status of 200 OK", async() => {
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

        Room.findById.mockResolvedValue(mockRoom);

        const req = {params : {id: "1"}} ;
        const res = {
            status: jest.fn().mockReturnThis(),
            json : jest.fn()
        };

        await RoomController.getRoomDetails(req, res);

        expect(Room.findById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "OK", data : {
                room : mockRoom
            }
        });
    })
    it("should return a status of 404 NOT FOUND if no room is found", async () => {
        Room.findById.mockResolvedValue(null);

        const req = {params : {id: "22"}} ;
        const res = {
            status: jest.fn().mockReturnThis(),
            json : jest.fn()
        };

        await RoomController.getRoomDetails(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({message: "Aucune chambre n'a été trouvé", status: "NOT FOUND"});
    })
})