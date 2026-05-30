import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        predictions: {
          include: {
            game: true
          }
        }
      }
    });

    const ranking = players.map((player) => {
      let totalPoints = 0;
      let exactCount = 0;
      let outcomeCount = 0;

      const predictionsDetail = player.predictions.map((pred) => {
        const isFinished = pred.game.status === 'finished';
        const isExact = isFinished && pred.goalsA === pred.game.goalsA && pred.goalsB === pred.game.goalsB;
        
        const realDiff = isFinished && pred.game.goalsA !== null && pred.game.goalsB !== null 
          ? pred.game.goalsA - pred.game.goalsB 
          : 0;
        const predDiff = pred.goalsA - pred.goalsB;
        const isOutcome = isFinished && !isExact && Math.sign(realDiff) === Math.sign(predDiff);

        if (isExact) exactCount++;
        if (isOutcome) outcomeCount++;
        
        totalPoints += pred.points;

        return {
          gameId: pred.gameId,
          goalsA: pred.goalsA,
          goalsB: pred.goalsB,
          points: pred.points,
          isExact,
          isOutcome
        };
      });

      return {
        id: player.id,
        name: player.name,
        totalPoints,
        exactCount,
        outcomeCount,
        predictions: predictionsDetail
      };
    });

    // Sort by points (desc), then exactCount (desc), then name (asc)
    ranking.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactCount !== a.exactCount) {
        return b.exactCount - a.exactCount;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(ranking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
