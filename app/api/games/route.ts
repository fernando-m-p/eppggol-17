import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(games);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
