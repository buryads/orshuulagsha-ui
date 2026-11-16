export type SwipeDir = 'right' | 'left' | 'up';

export const SWIPE_THRESHOLD = 90;

export function classifySwipe(dx: number, dy: number, threshold = SWIPE_THRESHOLD): SwipeDir | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax >= ay && ax >= threshold && ax > ay) return dx > 0 ? 'right' : 'left';
  if (ay > ax && dy <= -threshold) return 'up';
  return null;
}

export interface SwipeVisual {
  transform: string;
  hint: SwipeDir | null;
  strength: number;
}

export function swipeVisual(dx: number, dy: number, threshold = SWIPE_THRESHOLD): SwipeVisual {
  const up = Math.min(0, dy);
  const rotate = Math.max(-18, Math.min(18, dx / 14));
  const transform = `translate(${dx}px, ${up}px) rotate(${rotate}deg)`;
  const ax = Math.abs(dx);
  const ay = Math.abs(up);
  const dominant = Math.max(ax, ay);
  const strength = Math.min(1, dominant / threshold);
  if (dominant < threshold * 0.4) return { transform, hint: null, strength };
  const hint: SwipeDir = ay > ax ? 'up' : dx > 0 ? 'right' : 'left';
  return { transform, hint, strength };
}
