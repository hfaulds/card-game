/*
  Warnings:

  - You are about to drop the `EncounterOnCampaign` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `campaignId` to the `Encounter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Encounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Encounter` ADD COLUMN `campaignId` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` JSON NOT NULL;

-- DropTable
DROP TABLE `EncounterOnCampaign`;
