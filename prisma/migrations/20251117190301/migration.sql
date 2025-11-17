/*
  Warnings:

  - You are about to drop the `LoggedOnUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('fresh', 'opened', 'stale');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "connections" TEXT[];

-- DropTable
DROP TABLE "LoggedOnUser";

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'fresh',

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);
