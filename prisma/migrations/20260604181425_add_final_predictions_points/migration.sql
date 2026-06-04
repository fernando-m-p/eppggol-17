-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinalPrediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "campeao" TEXT NOT NULL,
    "segundo" TEXT NOT NULL,
    "terceiro" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinalPrediction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FinalPrediction" ("campeao", "createdAt", "id", "playerId", "segundo", "terceiro", "updatedAt") SELECT "campeao", "createdAt", "id", "playerId", "segundo", "terceiro", "updatedAt" FROM "FinalPrediction";
DROP TABLE "FinalPrediction";
ALTER TABLE "new_FinalPrediction" RENAME TO "FinalPrediction";
CREATE UNIQUE INDEX "FinalPrediction_playerId_key" ON "FinalPrediction"("playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
