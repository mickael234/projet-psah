import {expect, vi,test} from 'vitest'
import HebergementModel from "../../models/hebergementModel"
import {prisma} from "../../libs/__moks__/prisma.js"

vi.mock('../../libs/prisma.js', async () => {
  const actual = await vi.importActual('../../libs/__mocks__/prisma.js')
  return actual
})
const chambre = {
  id_chambre : 2,
  numero_chambre: "102",
  type_chambre: "Standard",
  prix_par_nuit:100.90,
  etat: "disponible",
  description: "Chambre standard confortable avec vue sur la ville",
  modifie_par: null,
  date_modification:null
}
test("update availability of hebergement", async() => {
  prisma.chambre.update.mockResolvedValue({id: 2, chambre})
  const updatedChambreAvailability = await  HebergementModel.updateAvailability(2, "disponible")
  expect(updatedChambreAvailability).toStrictEqual({ ...chambre, id_chambre: 2 })
})

test("update price of hebergement", async() => {
  prisma.chambre.update.mockResolvedValue({id: 2, chambre} )
  const updatedChambrePrice = await HebergementModel.updatePrice(2, 100.90)
  expect(updatedChambrePrice).toStrictEqual({ ...chambre, id_chambre: 2 })
})