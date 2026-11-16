'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/api/cookies';
import { getMe, type StudioMe } from '@/lib/api/studio';

export type StudioAccess =
  | { state: 'loading' }
  | { state: 'guest' }
  | { state: 'denied' }
  | { state: 'error' }
  | { state: 'ok'; me: StudioMe };

export function isForbidden(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 403;
}

export function useStudioAccess(): StudioAccess {
  const [access, setAccess] = useState<StudioAccess>({ state: 'loading' });
  useEffect(() => {
    if (!getAuthToken()) {
      setAccess({ state: 'guest' });
      return;
    }
    getMe()
      .then((me) => setAccess({ state: 'ok', me }))
      .catch((e) => setAccess({ state: isForbidden(e) ? 'denied' : 'error' }));
  }, []);
  return access;
}
