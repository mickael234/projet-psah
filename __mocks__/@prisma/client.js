<<<<<<< HEAD
export const PrismaClient = jest.fn(() => ({
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    maintenance: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    utilisateur: {
      findUnique: jest.fn()
    }
  }));
  
=======
const prismaMock = require('../prisma.mock.js');

const PrismaClient = jest.fn(() => prismaMock);

module.exports = {
    PrismaClient
};
>>>>>>> origin/hassan
