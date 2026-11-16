'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/api/cookies';
import * as user from '@/lib/api/user';
import type { IUser } from '@/lib/api/types';
import { isTeacherUser } from '@/lib/learn-access';

export interface CurrentUser {
  signedIn: boolean;
  user: IUser | null;
  isTeacher: boolean;
  ready: boolean;
  error: boolean;
}

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({
    signedIn: false,
    user: null,
    isTeacher: false,
    ready: false,
    error: false,
  });
  useEffect(() => {
    if (!getAuthToken()) {
      setState({ signedIn: false, user: null, isTeacher: false, ready: true, error: false });
      return;
    }
    setState((s) => ({ ...s, signedIn: true }));
    user
      .getUser()
      .then((u) => setState({ signedIn: true, user: u, isTeacher: isTeacherUser(u), ready: true, error: false }))
      .catch(() => setState((s) => ({ ...s, ready: true, error: true })));
  }, []);
  return state;
}
