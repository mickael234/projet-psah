const prismaMock = require('../prisma.mock.js');

const PrismaClient = jest.fn(() => prismaMock);

module.exports = {
  PrismaClient
};