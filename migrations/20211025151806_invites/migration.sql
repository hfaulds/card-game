/*
  Warnings:

  - You are about to drop the column `userId` on the `GamesOnUsers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId,userEmail]` on the table `GamesOnUsers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `GamesOnUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `GamesOnUsers_gameId_userId_key` ON `GamesOnUsers`;

-- AlterTable
ALTER TABLE `GamesOnUsers` DROP COLUMN `userId`,
    ADD COLUMN `userEmail` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `GamesOnUsers_gameId_userEmail_key` ON `GamesOnUsers`(`gameId`, `userEmail`);
