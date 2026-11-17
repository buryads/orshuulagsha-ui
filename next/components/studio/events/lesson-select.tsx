'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { getLessons, type LessonRow } from '@/lib/api/studio';
import { inputStyle } from '../field';

export function LessonSelect({
  value,
  onChange,
  label,
  testId,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
  label: string;
  testId: string;
}): ReactElement {
  const t = useTranslations('studioEvents.common');
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  useEffect(() => {
    getLessons()
      .then(setLessons)
      .catch(() => undefined);
  }, []);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
      {label}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        style={inputStyle}
        data-testid={testId}
      >
        <option value="">{t('pickLesson')}</option>
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title}
          </option>
        ))}
      </select>
    </label>
  );
}
