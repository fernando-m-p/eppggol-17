import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const games = await prisma.game.findMany({
            select: {
                teamA: true,
                teamB: true
            },
            where: {
                stage: {
                    startsWith: "Grupo"
                }
            }
        });
        const teams = [
            ...new Set(
                games.flatMap(g => [g.teamA, g.teamB])
            )
        ];
        teams.sort((a, b) => a.localeCompare(b));


        return NextResponse.json(teams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
