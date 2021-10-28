/*
  Warnings:

  - Added the required column `name` to the `Encounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Encounter` ADD COLUMN `name` VARCHAR(191) NOT NULL;
