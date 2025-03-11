import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

class User {
  static async create(fullName, email, password, roleId, phoneNumber) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        roleId,
        phoneNumber
      }
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default User;