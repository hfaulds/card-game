/*
  Warnings:

  - The primary key for the `GamesOnUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[gameId,userId]` on the table `GamesOnUsers` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `GamesOnUsers` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `GamesOnUsers` DROP PRIMARY KEY,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    MODIFY `gameId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `GamesOnUsers_gameId_userId_key` ON `GamesOnUsers`(`gameId`, `userId`);
