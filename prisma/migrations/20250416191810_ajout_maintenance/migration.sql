-- CreateTable
CREATE TABLE "Maintenance" (
    "id_maintenance" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id_maintenance")
);

-- CreateIndex
CREATE INDEX "Maintenance_id_chambre_idx" ON "Maintenance"("id_chambre");

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;
