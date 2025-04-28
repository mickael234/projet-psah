// prisma.mock.js

const prismaMock = {
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    maintenance: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    utilisateur: {
      findUnique: jest.fn(),
    },
  };
  
  module.exports = prismaMock;
  