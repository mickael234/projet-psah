import { PrismaClient } from "@prisma/client"
import { beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"

// Crée le mock
const prisma = mockDeep()

// Réinitialise les mocks avant chaque test
beforeEach(() => {
  mockReset(prisma)
})

module.exports = {
  prisma, // <- important d'exporter "prisma" avec ce nom
}
