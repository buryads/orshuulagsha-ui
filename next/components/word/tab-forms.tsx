// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';

export interface FormItem {
  label: string;
  value: string;
}

export interface TabFormsProps {
  forms?: FormItem[];
}

const DEFAULT_FORMS: FormItem[] = [
  { label: 'Именительный', value: 'тэнгэри' },
  { label: 'Родительный', value: 'тэнгэриин' },
  { label: 'Дательный', value: 'тэнгэридэ' },
  { label: 'Винительный', value: 'тэнгэриие' },
  { label: 'Орудный', value: 'тэнгэреэр' },
  { label: 'Совместный', value: 'тэнгэритэй' },
  { label: 'Исходный', value: 'тэнгэриhээ' },
  { label: 'Множественное', value: 'тэнгэринүүд' },
];

export function TabForms({ forms }: TabFormsProps): ReactElement {
  const list = forms && forms.length > 0 ? forms : DEFAULT_FORMS;
  return (
    <div className="card fade-up" style={{ padding: 28, marginTop: 16 }}>
      <h3
        style={{
          fontSize: 13,
          color: 'var(--text-soft)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Склонение (множественное и падежи)
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {list.map((p, i) => (
          <div
            key={`${p.label}-${i}`}
            style={{
              padding: '12px 14px',
              background: 'var(--surface-2)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.label}</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
