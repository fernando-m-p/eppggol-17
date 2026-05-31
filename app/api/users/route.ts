import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const uid = searchParams.get('uid');

    const adminPassword = process.env.ADMIN_PASSWORD || 'copa2026';

    if (password !== null) {
      if (password !== adminPassword) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
      }
      // Return all players with UIDs for admin dashboard
      const players = await prisma.player.findMany({
        orderBy: { name: 'asc' }
      });
      return NextResponse.json(players);
    }

    if (!uid) {
      return NextResponse.json({ error: 'UID ou Senha é obrigatório' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { uid },
      include: {
        predictions: true
      }
    });

    if (!player) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD || 'copa2026';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: { name: name.trim() }
    });

    return NextResponse.json({ success: true, player });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');
    const password = searchParams.get('password');

    const adminPassword = process.env.ADMIN_PASSWORD || 'copa2026';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    if (!playerId) {
      return NextResponse.json({ error: 'ID do jogador é obrigatório' }, { status: 400 });
    }

    await prisma.player.delete({
      where: { id: Number(playerId) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
