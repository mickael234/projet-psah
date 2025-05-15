-- CreateEnum
CREATE TYPE "StatutDemandeCourse" AS ENUM ('en_attente', 'acceptee', 'refusee', 'annulee');

-- CreateEnum
CREATE TYPE "StatutTrajet" AS ENUM ('en_attente', 'en_cours', 'termine');

-- CreateTable
CREATE TABLE "DemandeCourse" (
    "id_demande_course" SERIAL NOT NULL,
    "lieu_depart" TEXT NOT NULL,
    "lieu_arrivee" TEXT NOT NULL,
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutDemandeCourse" NOT NULL DEFAULT 'en_attente',
    "id_client" INTEGER NOT NULL,

    CONSTRAINT "DemandeCourse_pkey" PRIMARY KEY ("id_demande_course")
);

-- CreateTable
CREATE TABLE "Trajet" (
    "id_trajet" SERIAL NOT NULL,
    "date_prise_en_charge" TIMESTAMP(3) NOT NULL,
    "date_depose" TIMESTAMP(3) NOT NULL,
    "statut" "StatutTrajet" NOT NULL DEFAULT 'en_attente',
    "id_personnel" INTEGER NOT NULL,
    "id_demande_course" INTEGER NOT NULL,

    CONSTRAINT "Trajet_pkey" PRIMARY KEY ("id_trajet")
);

-- CreateIndex
CREATE INDEX "DemandeCourse_id_client_idx" ON "DemandeCourse"("id_client");

-- CreateIndex
CREATE UNIQUE INDEX "Trajet_id_demande_course_key" ON "Trajet"("id_demande_course");

-- CreateIndex
CREATE INDEX "Trajet_id_personnel_idx" ON "Trajet"("id_personnel");

-- AddForeignKey
ALTER TABLE "DemandeCourse" ADD CONSTRAINT "DemandeCourse_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trajet" ADD CONSTRAINT "Trajet_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "Personnel"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trajet" ADD CONSTRAINT "Trajet_id_demande_course_fkey" FOREIGN KEY ("id_demande_course") REFERENCES "DemandeCourse"("id_demande_course") ON DELETE RESTRICT ON UPDATE CASCADE;
