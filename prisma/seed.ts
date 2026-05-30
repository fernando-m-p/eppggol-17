import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STADIUMS = [
  'MetLife Stadium (New York/New Jersey)',
  'SoFi Stadium (Los Angeles)',
  'Estadio Azteca (Mexico City)',
  'AT&T Stadium (Dallas)',
  'Hard Rock Stadium (Miami)',
  'Mercedes-Benz Stadium (Atlanta)',
  'Lumen Field (Seattle)',
  'BC Place (Vancouver)',
  'BMO Field (Toronto)',
  'Estadio BBVA (Monterrey)',
  'Estadio Akron (Guadalajara)',
  'Lincoln Financial Field (Philadelphia)',
  'Levi\'s Stadium (San Francisco)',
  'Gillette Stadium (Boston)',
  'NRG Stadium (Houston)',
  'Arrowhead Stadium (Kansas City)'
];

const GROUPS = [
  {
    name: 'Grupo A',
    teams: [
      { name: 'Estados Unidos', abbrev: 'USA', flag: '🇺🇸' },
      { name: 'México', abbrev: 'MEX', flag: '🇲🇽' },
      { name: 'Canadá', abbrev: 'CAN', flag: '🇨🇦' },
      { name: 'Panamá', abbrev: 'PAN', flag: '🇵🇦' }
    ]
  },
  {
    name: 'Grupo B',
    teams: [
      { name: 'Argentina', abbrev: 'ARG', flag: '🇦🇷' },
      { name: 'Equador', abbrev: 'ECU', flag: '🇪🇨' },
      { name: 'Chile', abbrev: 'CHI', flag: '🇨🇱' },
      { name: 'Jamaica', abbrev: 'JAM', flag: '🇯🇲' }
    ]
  },
  {
    name: 'Grupo C',
    teams: [
      { name: 'Brasil', abbrev: 'BRA', flag: '🇧🇷' },
      { name: 'Colômbia', abbrev: 'COL', flag: '🇨🇴' },
      { name: 'Paraguai', abbrev: 'PAR', flag: '🇵🇾' },
      { name: 'Venezuela', abbrev: 'VEN', flag: '🇻🇪' }
    ]
  },
  {
    name: 'Grupo D',
    teams: [
      { name: 'França', abbrev: 'FRA', flag: '🇫🇷' },
      { name: 'Holanda', abbrev: 'NED', flag: '🇳🇱' },
      { name: 'Polônia', abbrev: 'POL', flag: '🇵🇱' },
      { name: 'Áustria', abbrev: 'AUT', flag: '🇦🇹' }
    ]
  },
  {
    name: 'Grupo E',
    teams: [
      { name: 'Inglaterra', abbrev: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Itália', abbrev: 'ITA', flag: '🇮🇹' },
      { name: 'Suíça', abbrev: 'SUI', flag: '🇨🇭' },
      { name: 'Ucrânia', abbrev: 'UKR', flag: '🇺🇦' }
    ]
  },
  {
    name: 'Grupo F',
    teams: [
      { name: 'Espanha', abbrev: 'ESP', flag: '🇪🇸' },
      { name: 'Portugal', abbrev: 'POR', flag: '🇵🇹' },
      { name: 'Turquia', abbrev: 'TUR', flag: '🇹🇷' },
      { name: 'Geórgia', abbrev: 'GEO', flag: '🇬🇪' }
    ]
  },
  {
    name: 'Grupo G',
    teams: [
      { name: 'Alemanha', abbrev: 'GER', flag: '🇩🇪' },
      { name: 'Bélgica', abbrev: 'BEL', flag: '🇧🇪' },
      { name: 'Dinamarca', abbrev: 'DEN', flag: '🇩🇰' },
      { name: 'Hungria', abbrev: 'HUN', flag: '🇭🇺' }
    ]
  },
  {
    name: 'Grupo H',
    teams: [
      { name: 'Croácia', abbrev: 'CRO', flag: '🇭🇷' },
      { name: 'Marrocos', abbrev: 'MAR', flag: '🇲🇦' },
      { name: 'Egito', abbrev: 'EGY', flag: '🇪🇬' },
      { name: 'África do Sul', abbrev: 'RSA', flag: '🇿🇦' }
    ]
  },
  {
    name: 'Grupo I',
    teams: [
      { name: 'Japão', abbrev: 'JPN', flag: '🇯🇵' },
      { name: 'Coreia do Sul', abbrev: 'KOR', flag: '🇰🇷' },
      { name: 'Austrália', abbrev: 'AUS', flag: '🇦🇺' },
      { name: 'Arábia Saudita', abbrev: 'KSA', flag: '🇸🇦' }
    ]
  },
  {
    name: 'Grupo J',
    teams: [
      { name: 'Uruguai', abbrev: 'URU', flag: '🇺🇾' },
      { name: 'Peru', abbrev: 'PER', flag: '🇵🇪' },
      { name: 'Bolívia', abbrev: 'BOL', flag: '🇧🇴' },
      { name: 'Nova Zelândia', abbrev: 'NZL', flag: '🇳🇿' }
    ]
  },
  {
    name: 'Grupo K',
    teams: [
      { name: 'Senegal', abbrev: 'SEN', flag: '🇸🇳' },
      { name: 'Camarões', abbrev: 'CMR', flag: '🇨🇲' },
      { name: 'Gana', abbrev: 'GHA', flag: '🇬🇭' },
      { name: 'Nigéria', abbrev: 'NGA', flag: '🇳🇬' }
    ]
  },
  {
    name: 'Grupo L',
    teams: [
      { name: 'Suécia', abbrev: 'SWE', flag: '🇸🇪' },
      { name: 'Noruega', abbrev: 'NOR', flag: '🇳🇴' },
      { name: 'Tchéquia', abbrev: 'CZE', flag: '🇨🇿' },
      { name: 'Romênia', abbrev: 'ROU', flag: '🇷🇴' }
    ]
  }
];

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.prediction.deleteMany();
  await prisma.game.deleteMany();
  await prisma.player.deleteMany();

  console.log('Semeando jogos da fase de grupos...');
  let gameCount = 0;
  
  // Start group matches on June 11, 2026.
  let baseDate = new Date('2026-06-11T16:00:00Z');

  for (const group of GROUPS) {
    const teams = group.teams;
    // Standard round-robin matches: 6 per group
    const pairings = [
      [0, 1], [2, 3], // rodada 1
      [0, 2], [1, 3], // rodada 2
      [0, 3], [1, 2]  // rodada 3
    ];

    for (let i = 0; i < pairings.length; i++) {
      const [idxA, idxB] = pairings[i];
      const teamA = teams[idxA];
      const teamB = teams[idxB];
      
      const matchDate = new Date(baseDate.getTime());
      // Space them out: 2-3 hours between matches
      matchDate.setHours(baseDate.getHours() + gameCount * 4); 

      const stadium = STADIUMS[gameCount % STADIUMS.length];

      await prisma.game.create({
        data: {
          stadium,
          stage: group.name,
          date: matchDate,
          teamA: teamA.name,
          teamB: teamB.name,
          flagA: teamA.flag,
          flagB: teamB.flag,
          abbrevA: teamA.abbrev,
          abbrevB: teamB.abbrev,
          status: 'scheduled'
        }
      });
      gameCount++;
    }
  }

  console.log(`Semeados ${gameCount} jogos da fase de grupos.`);

  console.log('Semeando jogos de mata-mata...');
  
  const knockoutMatches = [
    {
      stage: '32-avos',
      date: new Date('2026-06-29T19:00:00Z'),
      teamA: '1º Grupo A',
      teamB: '3º Grupo B/C/D',
      abbrevA: '1A',
      abbrevB: '3BCD',
      flagA: '🏳️',
      flagB: '🏳️',
      stadium: STADIUMS[0]
    },
    {
      stage: 'Oitavas',
      date: new Date('2026-07-04T18:00:00Z'),
      teamA: 'Vencedor 32-avos 1',
      teamB: 'Vencedor 32-avos 2',
      abbrevA: 'V32-1',
      abbrevB: 'V32-2',
      flagA: '🏳️',
      flagB: '🏳️',
      stadium: STADIUMS[1]
    },
    {
      stage: 'Quartas',
      date: new Date('2026-07-09T18:00:00Z'),
      teamA: 'Vencedor Oitavas 1',
      teamB: 'Vencedor Oitavas 2',
      abbrevA: 'VO1',
      abbrevB: 'VO2',
      flagA: '🏳️',
      flagB: '🏳️',
      stadium: STADIUMS[2]
    },
    {
      stage: 'Semifinal',
      date: new Date('2026-07-14T20:00:00Z'),
      teamA: 'Vencedor Quartas 1',
      teamB: 'Vencedor Quartas 2',
      abbrevA: 'VQ1',
      abbrevB: 'VQ2',
      flagA: '🏳️',
      flagB: '🏳️',
      stadium: STADIUMS[3]
    },
    {
      stage: 'Disputa de 3º',
      date: new Date('2026-07-18T16:00:00Z'),
      teamA: 'Perdedor Semifinal 1',
      teamB: 'Perdedor Semifinal 2',
      abbrevA: 'PS1',
      abbrevB: 'PS2',
      flagA: '🏳️',
      flagB: '🏳️',
      stadium: STADIUMS[4]
    },
    {
      stage: 'Final',
      date: new Date('2026-07-19T18:00:00Z'),
      teamA: 'Vencedor Semifinal 1',
      teamB: 'Vencedor Semifinal 2',
      abbrevA: 'VS1',
      abbrevB: 'VS2',
      flagA: '🏆',
      flagB: '🏆',
      stadium: 'MetLife Stadium (New York/New Jersey)'
    }
  ];

  for (const km of knockoutMatches) {
    await prisma.game.create({
      data: {
        stadium: km.stadium,
        stage: km.stage,
        date: km.date,
        teamA: km.teamA,
        teamB: km.teamB,
        flagA: km.flagA,
        flagB: km.flagB,
        abbrevA: km.abbrevA,
        abbrevB: km.abbrevB,
        status: 'scheduled'
      }
    });
  }

  console.log('Semeados 6 jogos de mata-mata.');
  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
