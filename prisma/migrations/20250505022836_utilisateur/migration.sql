/*
  Warnings:

  - Added the required column `date_modification` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "authentification_deux_facteurs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "photo_profil" TEXT,
ADD COLUMN     "secret_deux_facteurs" TEXT;
