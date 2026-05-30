import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculatePoints } from '@/lib/scoring';

export async function POST(request: Request) {
  try {
    const { gameId, goalsA, goalsB, status, password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD || 'copa2026';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    if (gameId === undefined || gameId === null) {
      return NextResponse.json({ error: 'gameId é obrigatório' }, { status: 400 });
    }

    const idVal = Number(gameId);
    const parsedGoalsA = goalsA !== undefined && goalsA !== null && goalsA !== '' ? Number(goalsA) : null;
    const parsedGoalsB = goalsB !== undefined && goalsB !== null && goalsB !== '' ? Number(goalsB) : null;

    const game = await prisma.game.update({
      where: { id: idVal },
      data: {
        goalsA: parsedGoalsA,
        goalsB: parsedGoalsB,
        status: status || 'scheduled'
      }
    });

    // Fetch all predictions for this game
    const predictions = await prisma.prediction.findMany({
      where: { gameId: idVal }
    });

    // Recalculate points for each prediction
    for (const pred of predictions) {
      const points = game.status === 'finished'
        ? calculatePoints(pred.goalsA, pred.goalsB, game.goalsA, game.goalsB, game.stage)
        : 0;

      await prisma.prediction.update({
        where: { id: pred.id },
        data: { points }
      });
    }

    return NextResponse.json({ success: true, game });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
