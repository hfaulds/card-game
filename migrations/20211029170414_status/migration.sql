/*
  Warnings:

  - Added the required column `state` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `state` JSON NOT NULL;

-- AlterTable
ALTER TABLE `Encounter` ADD COLUMN `visibility` ENUM('DRAFT', 'OPEN', 'CLOSED') NOT NULL DEFAULT 'DRAFT';
