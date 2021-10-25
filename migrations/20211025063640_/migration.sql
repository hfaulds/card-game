/*
  Warnings:

  - Made the column `gameId` on table `GamesOnUsers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `GamesOnUsers` MODIFY `gameId` VARCHAR(191) NOT NULL;
