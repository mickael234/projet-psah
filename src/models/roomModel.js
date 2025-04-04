import prisma from "../config/prisma";

class Room {
    static async findById(idNumber){
        return prisma.room.findUnique({
            where: {
                id: idNumber
            }
        })
    }
}

export default Room;