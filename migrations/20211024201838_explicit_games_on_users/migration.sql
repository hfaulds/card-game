/*
  Warnings:

  - You are about to drop the `_GameToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Account_userId_fkey` ON `Account`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `Session`;

-- DropTable
DROP TABLE `_GameToUser`;

-- CreateTable
CREATE TABLE `GamesOnUsers` (
    `gameId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL,
    `accepted` DATETIME(3) NULL,

    PRIMARY KEY (`gameId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
