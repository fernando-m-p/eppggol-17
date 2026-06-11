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
}

function generateStandings(games: Game[]) {
  const groups: Record<string, Record<string, TeamStats>> = {};

  games
    .filter(g => g.status === 'finished' && g.goalsA !== null && g.goalsB !== null)
    .forEach(game => {
      const group = game.stage;

      if (!groups[group]) {
        groups[group] = {};
      }

      const groupTable = groups[group];

      const ensureTeam = (name: string, flag: string): TeamStats => {
        if (!groupTable[name]) {
          groupTable[name] = {
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
        return groupTable[name];
      };

      const teamA = ensureTeam(game.teamA, game.flagA);
      const teamB = ensureTeam(game.teamB, game.flagB);

      // Atualiza jogos
      teamA.played++;
      teamB.played++;

      teamA.goalsFor += game.goalsA!;
      teamA.goalsAgainst += game.goalsB!;

      teamB.goalsFor += game.goalsB!;
      teamB.goalsAgainst += game.goalsA!;

      // Resultado
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
    });

  // Ordenação estilo Copa (GE)
  Object.values(groups).forEach(group => {
    Object.values(group).forEach(team => {
      team.goalDiff = team.goalsFor - team.goalsAgainst;
    });
  });

  const sortedGroups: Record<string, TeamStats[]> = {};

  Object.entries(groups).forEach(([groupName, teams]) => {
    sortedGroups[groupName] = Object.values(teams).sort((a, b) => {
      return (
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor
      );
    });
  });

  return sortedGroups;
}

export { generateStandings };
export type { TeamStats, Game };
