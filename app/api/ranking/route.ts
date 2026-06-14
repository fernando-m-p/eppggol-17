import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        predictions: {
          include: {
            game: true
          }
        },
        finalPredictions: true
      }
    });

    const ranking = players.map((player: { predictions: any[]; id: any; name: any; finalPredictions: any[]; }) => {
      let totalPoints = 0;
      let exactCount = 0;
      let outcomeCount = 0;
      const campeaoPredictionDetail = player.finalPredictions;
      const predictionsDetail = player.predictions.map((pred: { game: { status: string; goalsA: number | null; goalsB: number | null; }; goalsA: number; goalsB: number; points: number; gameId: any; }) => {
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
      totalPoints += player.finalPredictions[0]?.points ?? 0;
      return {
        id: player.id,
        name: player.name,
        totalPoints,
        exactCount,
        outcomeCount,
        predictions: predictionsDetail,
        finalPredictions: campeaoPredictionDetail
      };
    });

    // Sort by points (desc), then exactCount (desc), then name (asc)
    ranking.sort((a: { totalPoints: number; exactCount: number; name: string; }, b: { totalPoints: number; exactCount: number; name: any; }) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactCount !== a.exactCount) {
        return b.exactCount - a.exactCount;
      }
      return b.name.localeCompare(a.name);
    });

    return NextResponse.json(ranking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
