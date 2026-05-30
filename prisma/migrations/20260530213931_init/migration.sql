-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stadium" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "flagA" TEXT NOT NULL,
    "flagB" TEXT NOT NULL,
    "abbrevA" TEXT NOT NULL,
    "abbrevB" TEXT NOT NULL,
    "goalsA" INTEGER,
    "goalsB" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled'
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "goalsA" INTEGER NOT NULL,
    "goalsB" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Prediction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_uid_key" ON "Player"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_playerId_gameId_key" ON "Prediction"("playerId", "gameId");
