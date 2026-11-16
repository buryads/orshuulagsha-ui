import type { IUser } from '@/lib/api/types';

export function isTeacherUser(u: Pick<IUser, 'roles'> | null | undefined): boolean {
  return Boolean(u?.roles?.some((r) => r.slug === 'teacher' || r.slug === 'admin'));
}

export function isLearnVisible(flagEnabled: boolean, isTeacher: boolean): boolean {
  return flagEnabled || isTeacher;
}
