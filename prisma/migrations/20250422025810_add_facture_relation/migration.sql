-- CreateTable
CREATE TABLE "Facture" (
    "id_facture" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_envoi" TIMESTAMP(3),
    "date_paiement" TIMESTAMP(3),
    "etat" TEXT NOT NULL DEFAULT 'en_attente',
    "details" JSONB,
    "notes" TEXT,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id_facture")
);

-- CreateIndex
CREATE INDEX "Facture_id_reservation_idx" ON "Facture"("id_reservation");

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;
