export function isMilestone(count: number): boolean {
  if (count === 10 || count === 25 || count === 50) return true;
  return count > 50 && count % 50 === 0;
}

export function milestoneOrdinal(count: number): number {
  if (!isMilestone(count)) return -1;
  if (count === 10) return 0;
  if (count === 25) return 1;
  return count / 50 + 1;
}

export function praiseIndex(count: number, total: number): number {
  const ordinal = milestoneOrdinal(count);
  if (ordinal < 0 || total <= 0) return 0;
  return ordinal % total;
}
