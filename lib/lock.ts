export function isMatchLocked(kickoffDate: Date | string): boolean {
  const kickoffTime = new Date(kickoffDate).getTime();
  const now = Date.now();
  const lockTime = kickoffTime - 10 * 60 * 1000; // 10 minutes before kickoff
  return now >= lockTime;
}
