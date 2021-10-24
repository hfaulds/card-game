-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_GameToUser` DROP FOREIGN KEY `_gametouser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `_GameToUser` DROP FOREIGN KEY `_gametouser_ibfk_2`;
