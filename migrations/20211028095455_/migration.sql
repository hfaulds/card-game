/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GamesOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Game`;

-- DropTable
DROP TABLE `GamesOnUsers`;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `state` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignOnUsers` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL,
    `accepted` DATETIME(3) NULL,

    UNIQUE INDEX `CampaignOnUsers_gameId_userEmail_key`(`gameId`, `userEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
