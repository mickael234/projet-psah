/*
  Warnings:

  - You are about to drop the column `authentification_deux_facteurs` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `date_creation` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `date_modification` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `photo_profil` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `secret_deux_facteurs` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "authentification_deux_facteurs",
DROP COLUMN "date_creation",
DROP COLUMN "date_modification",
DROP COLUMN "photo_profil",
DROP COLUMN "secret_deux_facteurs";
