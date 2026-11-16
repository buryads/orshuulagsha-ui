import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUser } from '@/lib/use-current-user';

const replace = vi.fn();
let current: CurrentUser;

vi.mock('@/lib/learn-enabled', () => ({ LEARN_ENABLED: false }));
vi.mock('react', async (orig) => ({ ...(await orig<typeof import('react')>()), useEffect: (f: () => void) => f() }));
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/learn/path',
}));
vi.mock('@/lib/use-current-user', () => ({ useCurrentUser: () => current }));

import { LearnGate } from './learn-gate';

const render = () => renderToStaticMarkup(<LearnGate><p>lesson content</p></LearnGate>);
const base: CurrentUser = { signedIn: true, user: null, isTeacher: false, ready: true, error: false };

beforeEach(() => {
  replace.mockClear();
  current = base;
});

describe('LearnGate with the flag off', () => {
  it('shows content to a teacher', () => {
    current = { ...base, isTeacher: true };
    expect(render()).toContain('lesson content');
  });

  it('shows content to an admin', () => {
    current = { ...base, user: { roles: [{ slug: 'admin' }] } as never, isTeacher: true };
    expect(render()).toContain('lesson content');
  });

  it('shows 404 to a plain user', () => {
    const html = render();
    expect(html).toContain('learn-not-found');
    expect(html).not.toContain('lesson content');
  });

  it('renders nothing while loading', () => {
    current = { ...base, signedIn: false, ready: false };
    expect(render()).toBe('');
    expect(replace).not.toHaveBeenCalled();
  });

  it('renders nothing for a guest (redirect to signin)', () => {
    current = { ...base, signedIn: false };
    expect(render()).toBe('');
    expect(replace).toHaveBeenCalledWith('/signin?next=%2Flearn%2Fpath');
  });

  it('shows an error state when the user lookup failed', () => {
    current = { ...base, error: true };
    expect(render()).toContain('learn-gate-error');
  });
});
