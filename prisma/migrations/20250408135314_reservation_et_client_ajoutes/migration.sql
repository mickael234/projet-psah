-- CreateEnum
CREATE TYPE "EtatReservation" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'ENREGISTREE', 'DEPART');

-- CreateEnum
CREATE TYPE "EtatPaiement" AS ENUM ('EN_ATTENTE', 'COMPLETE', 'ECHOUE', 'REMBOURSE');

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "statut_membre" TEXT NOT NULL,
    "consentement_marketing" BOOLEAN NOT NULL DEFAULT false,
    "supprime_le" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id_reservation" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "date_reservation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etat" "EtatReservation" NOT NULL,
    "prix_total" DECIMAL(10,2) NOT NULL,
    "etat_paiement" "EtatPaiement" NOT NULL,
    "source_reservation" TEXT,
    "id_reservation_externe" TEXT,
    "supprime_le" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_id_utilisateur_key" ON "Client"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;
