-- CreateTable
CREATE TABLE "Favori" (
    "id_favori" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "ajoute_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favori_pkey" PRIMARY KEY ("id_favori")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favori_id_utilisateur_id_chambre_key" ON "Favori"("id_utilisateur", "id_chambre");

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;
