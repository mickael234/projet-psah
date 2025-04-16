import { PrismaClient } from '@prisma/client';
import {jest} from '@jest/globals'

const prisma = new PrismaClient();

export default prisma;
export const mockPrisma = jest.fn(); // A mettre en commentaire si pas de tests
