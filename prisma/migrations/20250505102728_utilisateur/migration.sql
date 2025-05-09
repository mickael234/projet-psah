/*
  Warnings:

  - You are about to drop the `BillingInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date_modification` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BillingInfo" DROP CONSTRAINT "BillingInfo_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "authentification_deux_facteurs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_modification" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "photo_profil" TEXT,
ADD COLUMN     "secret_deux_facteurs" TEXT;

-- DropTable
DROP TABLE "BillingInfo";

-- DropTable
DROP TABLE "User";
