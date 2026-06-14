interface TeamStats {
  team: string;
  flag: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface Game {
  id: number;
  stadium: string;
  stage: string;
  date: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  abbrevA: string;
  abbrevB: string;
  goalsA: number | null;
  goalsB: number | null;
  status: string;
  predictions: {
    goalsA: number;
    goalsB: number;
    points: number;
    player: {
      name: string;

    }
  }[]
}

function generateStandings(games: Game[]): TeamStats[] {
  const table: Record<string, TeamStats> = {};

  games
    .forEach(game => {
      const ensureTeam = (name: string, flag: string): TeamStats => {
        if (!table[name]) {
          table[name] = {
            team: name,
            flag,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
          };
        }
        return table[name];
      };

      const teamA = ensureTeam(game.teamA, game.flagA);
      const teamB = ensureTeam(game.teamB, game.flagB);

      // Jogos
      if (game.status === 'finished' || game.status === 'live') {
        teamA.played++;
        teamB.played++;
      }

      // Gols
      teamA.goalsFor += game.goalsA!;
      teamA.goalsAgainst += game.goalsB!;

      teamB.goalsFor += game.goalsB!;
      teamB.goalsAgainst += game.goalsA!;

      // Resultado
      if (game.status === 'finished' || game.status === 'live') {

        if (game.goalsA! > game.goalsB!) {
          teamA.wins++;
          teamB.losses++;
          teamA.points += 3;
        } else if (game.goalsA! < game.goalsB!) {
          teamB.wins++;
          teamA.losses++;
          teamB.points += 3;
        } else {
          teamA.draws++;
          teamB.draws++;
          teamA.points += 1;
          teamB.points += 1;
        }
      }
    });

  // Calcula saldo
  Object.values(table).forEach(team => {
    team.goalDiff = team.goalsFor - team.goalsAgainst;
  });

  // Retorna array ordenado
  return Object.values(table).sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor
    );
  });
}

export { generateStandings };
export type { TeamStats, Game };
