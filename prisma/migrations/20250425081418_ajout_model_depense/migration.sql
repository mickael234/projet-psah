-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('maintenance', 'personnel', 'services', 'transport', 'communication', 'logiciel', 'marketing', 'admin', 'equipement', 'autre');

-- CreateTable
CREATE TABLE "Depense" (
    "id_depense" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "categorie" "CategorieDepense" NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "date_suppression" TIMESTAMP(3),

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id_depense")
);

-- CreateIndex
CREATE INDEX "Depense_date_creation_idx" ON "Depense"("date_creation");

-- CreateIndex
CREATE INDEX "Depense_categorie_idx" ON "Depense"("categorie");

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;
