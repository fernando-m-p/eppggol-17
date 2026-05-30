import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isMatchLocked } from '@/lib/lock';

export async function POST(request: Request) {
  try {
    const { uid, gameId, goalsA, goalsB } = await request.json();

    if (!uid || gameId === undefined || goalsA === undefined || goalsB === undefined || goalsA === null || goalsB === null) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { uid }
    });
    if (!player) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    const game = await prisma.game.findUnique({
      where: { id: Number(gameId) }
    });
    if (!game) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });
    }

    // Check lock
    if (isMatchLocked(game.date)) {
      return NextResponse.json({ error: 'Este jogo está bloqueado para palpites (limite de 10 minutos antes do início)' }, { status: 400 });
    }

    // Save prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        playerId_gameId: {
          playerId: player.id,
          gameId: game.id
        }
      },
      update: {
        goalsA: Number(goalsA),
        goalsB: Number(goalsB)
      },
      create: {
        playerId: player.id,
        gameId: game.id,
        goalsA: Number(goalsA),
        goalsB: Number(goalsB),
        points: 0
      }
    });

    return NextResponse.json({ success: true, prediction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
