import { describe, expect, it } from 'vitest';
import { isLearnVisible, isTeacherUser } from './learn-access';

const withRoles = (...slugs: string[]) => ({ roles: slugs.map((slug) => ({ slug })) }) as never;

describe('isTeacherUser', () => {
  it('accepts teacher and admin', () => {
    expect(isTeacherUser(withRoles('teacher'))).toBe(true);
    expect(isTeacherUser(withRoles('user', 'admin'))).toBe(true);
  });
  it('rejects plain user, no roles, guest', () => {
    expect(isTeacherUser(withRoles('user'))).toBe(false);
    expect(isTeacherUser({} as never)).toBe(false);
    expect(isTeacherUser(null)).toBe(false);
    expect(isTeacherUser(undefined)).toBe(false);
  });
});

describe('isLearnVisible', () => {
  it('flag on shows for everyone', () => {
    expect(isLearnVisible(true, false)).toBe(true);
  });
  it('flag off shows only for teachers', () => {
    expect(isLearnVisible(false, true)).toBe(true);
    expect(isLearnVisible(false, false)).toBe(false);
  });
});
