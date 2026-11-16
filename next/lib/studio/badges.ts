export type BadgeId =
  | 'first'
  | 'actions10'
  | 'actions100'
  | 'actions1000'
  | 'voice10'
  | 'voice100'
  | 'voice1000'
  | 'review10'
  | 'review100'
  | 'review1000'
  | 'fix10';

export interface Badge {
  id: BadgeId;
  key: string;
  icon: string;
}

export interface BadgeStats {
  allTimeTotal: number;
  recorded?: number;
  reviewed?: number;
  fixed?: number;
}

export interface NextBadge extends Badge {
  current: number;
  target: number;
}

const badge = (id: BadgeId, icon: string): Badge => ({ id, key: `studio.honor.badges.${id}`, icon });

const TOTAL_LADDER: { badge: Badge; target: number }[] = [
  { badge: badge('first', '🌱'), target: 1 },
  { badge: badge('actions10', '⭐'), target: 10 },
  { badge: badge('actions100', '🌟'), target: 100 },
  { badge: badge('actions1000', '🏆'), target: 1000 },
];

const TYPE_LADDERS: { field: 'recorded' | 'reviewed' | 'fixed'; steps: { badge: Badge; target: number }[] }[] = [
  {
    field: 'recorded',
    steps: [
      { badge: badge('voice10', '🎙️'), target: 10 },
      { badge: badge('voice100', '🎤'), target: 100 },
      { badge: badge('voice1000', '📻'), target: 1000 },
    ],
  },
  {
    field: 'reviewed',
    steps: [
      { badge: badge('review10', '🔍'), target: 10 },
      { badge: badge('review100', '🧐'), target: 100 },
      { badge: badge('review1000', '🦉'), target: 1000 },
    ],
  },
  { field: 'fixed', steps: [{ badge: badge('fix10', '🛠️'), target: 10 }] },
];

export function earnedBadges(stats: BadgeStats): Badge[] {
  const earned = TOTAL_LADDER.filter((s) => stats.allTimeTotal >= s.target).map((s) => s.badge);
  for (const ladder of TYPE_LADDERS) {
    const count = stats[ladder.field];
    if (count === undefined) continue;
    earned.push(...ladder.steps.filter((s) => count >= s.target).map((s) => s.badge));
  }
  return earned;
}

export function nextBadge(allTimeTotal: number): NextBadge | null {
  const step = TOTAL_LADDER.find((s) => allTimeTotal < s.target);
  return step ? { ...step.badge, current: allTimeTotal, target: step.target } : null;
}
