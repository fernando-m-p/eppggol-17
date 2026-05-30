export function calculatePoints(
  predGoalsA: number,
  predGoalsB: number,
  realGoalsA: number | null,
  realGoalsB: number | null,
  stage: string
): number {
  if (realGoalsA === null || realGoalsB === null) {
    return 0;
  }

  let basePoints = 0;

  const realDiff = realGoalsA - realGoalsB;
  const predDiff = predGoalsA - predGoalsB;

  const realOutcome = Math.sign(realDiff);
  const predOutcome = Math.sign(predDiff);

  const exactMatch = predGoalsA === realGoalsA && predGoalsB === realGoalsB;
  const outcomeMatch = realOutcome === predOutcome;

  if (exactMatch) {
    basePoints = 3;
    // Goleada Bonus: if correct exact score AND goal difference is >= 3
    if (Math.abs(realDiff) >= 3) {
      basePoints += 1;
    }
  } else if (outcomeMatch) {
    basePoints = 1;
  }

  const weight = getPhaseWeight(stage);
  return basePoints * weight;
}

export function getPhaseWeight(stage: string): number {
  const norm = stage.toLowerCase().trim();
  
  if (norm.includes('final') && !norm.includes('semi') && !norm.includes('quarta') && !norm.includes('oitava')) {
    return 10;
  }
  if (norm.includes('semi')) {
    return 5;
  }
  if (norm.includes('3º') || norm.includes('3o') || norm.includes('3rd') || norm.includes('terceiro')) {
    return 5;
  }
  if (norm.includes('quarta') || norm.includes('quarter')) {
    return 4;
  }
  if (norm.includes('oitava') || norm.includes('16') || norm.includes('octava')) {
    return 3;
  }
  if (norm.includes('32-avos') || norm.includes('32avos') || norm.includes('32')) {
    return 2;
  }
  
  // Default is Group Stage (Grupo)
  return 1;
}
