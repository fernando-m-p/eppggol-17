import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePoints } from '@/lib/scoring';

function getCurrentDateTime() {
    const now = new Date();

    const pad = (n: number) => String(n).padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const offset = -now.getTimezoneOffset(); // em minutos
    const sign = offset >= 0 ? "+" : "-";

    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}


export async function GET() {
    console.log(console.log(getCurrentDateTime()));
    try {
        const games = await prisma.game.findMany({
            select: {
                id: true,
                flagA: true,
                abbrevA: true,
                teamA: true,
                teamB: true,
                flagB: true,
                abbrevB: true,
                date: true,
                goalsA: true,
                goalsB: true,
                stadium: true,
                stage: true,
                status: true,
                predictions: {
                    select: {
                        player: {
                            select: {
                                name: true
                            }
                        },
                        goalsA: true,
                        goalsB: true,
                        points: true,
                    },
                    orderBy: {
                        points: 'desc'
                    },
                    where: {
                        game: {
                            date: {
                                lt: getCurrentDateTime()
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'asc' }
        });
        games.map(g => {
            if (g.status == 'live') {
                g.predictions.map(prediction => {
                    prediction.points = calculatePoints(
                        prediction.goalsA,
                        prediction.goalsB,
                        g.goalsA,
                        g.goalsB,
                        g.stage
                    );
                })
                g.predictions.sort((a, b) => b.points - a.points);
            }

        });


        return NextResponse.json(games);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
