'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { addTeacher, getTeachers, removeTeacher, type Teacher } from '@/lib/api/studio';
import { inputStyle } from './field';

export function TeachersPanel(): ReactElement {
  const t = useTranslations('studio.teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => setError(t('loadFailed')));
  }, [t]);

  useEffect(load, [load]);

  async function grant() {
    const value = email.trim();
    if (!value) return;
    setError(null);
    try {
      const teacher = await addTeacher(value);
      setTeachers((list) => (list.some((x) => x.id === teacher.id) ? list : [...list, teacher]));
      setEmail('');
    } catch {
      setError(t('grantFailed'));
    }
  }

  async function revoke(id: number) {
    try {
      await removeTeacher(id);
      setTeachers((list) => list.filter((x) => x.id !== id));
    } catch {
      setError(t('revokeFailed'));
    }
  }

  return (
    <details className="card" style={{ padding: '10px 14px' }} data-testid="teachers-panel">
      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
        {t('title')} ({teachers.length})
      </summary>
      <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {teachers.map((x) => (
          <li key={x.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{x.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{x.email}</span>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}
              onClick={() => void revoke(x.id)}
            >
              {t('revoke')}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void grant();
        }}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          aria-label={t('emailPlaceholder')}
          style={{ ...inputStyle, flex: '1 1 200px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
          {t('grant')}
        </button>
      </form>
      {error && (
        <p role="alert" style={{ color: 'var(--tertiary-700)', fontSize: 13, margin: '8px 0 0' }}>
          {error}
        </p>
      )}
    </details>
  );
}
