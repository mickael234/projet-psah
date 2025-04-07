import prisma from "../config/prisma.js";

class Room {
    static async findById(idNumber){
        return prisma.room.findUnique({
            where: {
                id: idNumber
            },
            include: {
                media: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        })
    }
}

export default Room;