/*
  Warnings:

  - You are about to alter the column `points` on the `Prediction` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "goalsA" INTEGER NOT NULL,
    "goalsB" INTEGER NOT NULL,
    "points" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Prediction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Prediction" ("gameId", "goalsA", "goalsB", "id", "playerId", "points") SELECT "gameId", "goalsA", "goalsB", "id", "playerId", "points" FROM "Prediction";
DROP TABLE "Prediction";
ALTER TABLE "new_Prediction" RENAME TO "Prediction";
CREATE UNIQUE INDEX "Prediction_playerId_gameId_key" ON "Prediction"("playerId", "gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
