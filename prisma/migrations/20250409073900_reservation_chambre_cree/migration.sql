-- CreateTable
CREATE TABLE "ReservationChambre" (
    "id_reservation" INTEGER NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "date_arrivee" TIMESTAMP(3) NOT NULL,
    "date_depart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationChambre_pkey" PRIMARY KEY ("id_reservation","id_chambre")
);

-- CreateIndex
CREATE INDEX "ReservationChambre_date_arrivee_idx" ON "ReservationChambre"("date_arrivee");

-- CreateIndex
CREATE INDEX "ReservationChambre_date_depart_idx" ON "ReservationChambre"("date_depart");

-- AddForeignKey
ALTER TABLE "ReservationChambre" ADD CONSTRAINT "ReservationChambre_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationChambre" ADD CONSTRAINT "ReservationChambre_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
