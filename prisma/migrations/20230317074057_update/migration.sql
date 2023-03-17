/*
  Warnings:

  - You are about to drop the column `minecraftUsername` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "minecraftUsername",
ADD COLUMN     "minecraftUUIDs" TEXT[],
ADD COLUMN     "minecraftUsernames" TEXT[];
