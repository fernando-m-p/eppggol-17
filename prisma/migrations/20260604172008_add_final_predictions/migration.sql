/*
  Warnings:

  - A unique constraint covering the columns `[playerId]` on the table `FinalPrediction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FinalPrediction_playerId_key" ON "FinalPrediction"("playerId");
