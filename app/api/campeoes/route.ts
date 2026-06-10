import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {


        const { uid, campeao, segundo, terceiro } = await request.json();

        if (!uid || campeao === undefined || campeao === undefined || campeao === null || segundo === undefined || segundo === null || terceiro === undefined || terceiro === null) {
            return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
        }

        const player = await prisma.player.findUnique({
            where: { uid }
        });
        if (!player) {
            return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
        }


        const now = new Date();
        const deadline = new Date("2026-06-10T23:59:59Z");

        if (now > deadline) {
            return NextResponse.json({ error: "Prazo encerrado para palpites finais" }, { status: 400 });
        }


        //Save prediction
        const prediction = await prisma.finalPrediction.upsert({
            where: {
                playerId: player.id
            },
            update: {
                campeao,
                segundo,
                terceiro
            },
            create: {
                playerId: player.id,
                campeao,
                segundo,
                terceiro
            }
        });

        return NextResponse.json({ success: true, prediction });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function GET() {
    try {
        const finalPredictions = await prisma.finalPrediction.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(finalPredictions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}