import prisma from '../config/prisma.js';

class Role {
    static async findByName(name) {
        return prisma.role.findUnique({
            where: { name }
        });
    }
}

export default Role;
