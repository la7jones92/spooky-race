/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Task` table. All the data in the column will be lost.
  - Added the required column `shortDescription` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `completionCode` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('LOCKED', 'UNLOCKED', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."SubmissionResult" AS ENUM ('SUCCESS', 'FAILURE');

-- AlterTable
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "description",
DROP COLUMN "order",
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "detailedDescription" DROP NOT NULL,
ALTER COLUMN "points" DROP DEFAULT,
ALTER COLUMN "completionCode" SET NOT NULL,
ALTER COLUMN "completionCode" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Task_id_seq";

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "entryCode" CITEXT NOT NULL,
    "hasEntered" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalBonusPoints" INTEGER NOT NULL DEFAULT 0,
    "totalHintPenalties" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamTask" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'LOCKED',
    "unlockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "bonusAwarded" INTEGER NOT NULL DEFAULT 0,
    "bonusPhotoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamTaskId" TEXT NOT NULL,
    "providedCode" CITEXT NOT NULL,
    "result" "public"."SubmissionResult" NOT NULL,
    "matchedTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Upload" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "blob" BYTEA,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "filename" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_entryCode_key" ON "public"."Team"("entryCode");

-- CreateIndex
CREATE INDEX "TeamTask_status_idx" ON "public"."TeamTask"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamTask_teamId_order_key" ON "public"."TeamTask"("teamId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TeamTask_teamId_taskId_key" ON "public"."TeamTask"("teamId", "taskId");

-- CreateIndex
CREATE INDEX "Submission_teamId_idx" ON "public"."Submission"("teamId");

-- CreateIndex
CREATE INDEX "Submission_teamTaskId_idx" ON "public"."Submission"("teamTaskId");

-- CreateIndex
CREATE INDEX "Submission_result_idx" ON "public"."Submission"("result");

-- CreateIndex
CREATE INDEX "Upload_teamId_idx" ON "public"."Upload"("teamId");

-- CreateIndex
CREATE INDEX "Task_completionCode_idx" ON "public"."Task"("completionCode");

-- CreateIndex
CREATE INDEX "Task_displayOrder_idx" ON "public"."Task"("displayOrder");

-- AddForeignKey
ALTER TABLE "public"."TeamTask" ADD CONSTRAINT "TeamTask_bonusPhotoId_fkey" FOREIGN KEY ("bonusPhotoId") REFERENCES "public"."Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamTask" ADD CONSTRAINT "TeamTask_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamTask" ADD CONSTRAINT "TeamTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_teamTaskId_fkey" FOREIGN KEY ("teamTaskId") REFERENCES "public"."TeamTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Upload" ADD CONSTRAINT "Upload_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
