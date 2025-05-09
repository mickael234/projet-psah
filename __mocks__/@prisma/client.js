import { jest } from "@jest/globals"

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
}

// Pour les ES modules, utilisez export default au lieu de module.exports
export default prismaMock

// Si vous avez besoin de simuler la structure de @prisma/client qui exporte PrismaClient
export const PrismaClient = () => prismaMock
