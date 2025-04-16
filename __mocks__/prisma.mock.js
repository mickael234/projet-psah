import { jest } from '@jest/globals';

const prismaMock = {
  reservation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  avis: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  chambre: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getWithRelations: jest.fn()
  },
  client: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  utilisateur: {
    findUnique: jest.fn()
  }
};

export default prismaMock;

