/*
  Warnings:

  - You are about to drop the column `state` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Campaign` DROP COLUMN `state`;

-- CreateTable
CREATE TABLE `Encounter` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EncounterOnCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `encounterId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `state` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
