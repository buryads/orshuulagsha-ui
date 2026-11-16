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

let cached: { token: string; promise: Promise<IUser> } | null = null;

function fetchUserOnce(token: string): Promise<IUser> {
  if (cached?.token === token) return cached.promise;
  const promise = user.getUser();
  cached = { token, promise };
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  return promise;
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
    const token = getAuthToken();
    if (!token) {
      setState({ signedIn: false, user: null, isTeacher: false, ready: true, error: false });
      return;
    }
    setState((s) => ({ ...s, signedIn: true }));
    fetchUserOnce(token)
      .then((u) => setState({ signedIn: true, user: u, isTeacher: isTeacherUser(u), ready: true, error: false }))
      .catch(() => setState((s) => ({ ...s, ready: true, error: true })));
  }, []);
  return state;
}
