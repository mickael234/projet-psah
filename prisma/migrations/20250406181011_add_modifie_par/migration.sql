-- AlterTable
ALTER TABLE "Chambre" ADD COLUMN     "date_modification" TIMESTAMP(3),
ADD COLUMN     "modifie_par" INTEGER;

-- CreateTable
CREATE TABLE "JournalModifications" (
    "id_journal" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type_ressource" TEXT NOT NULL,
    "id_ressource" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalModifications_pkey" PRIMARY KEY ("id_journal")
);

-- AddForeignKey
ALTER TABLE "JournalModifications" ADD CONSTRAINT "JournalModifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;
