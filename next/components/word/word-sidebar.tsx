// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface DialectForm {
  dialect: string;
  word: string;
}

export interface CommunityComment {
  author: string;
  initial: string;
  ago: string;
  text: string;
}

export interface WordSidebarProps {
  synonyms?: string[];
  antonyms?: string[];
  dialects?: DialectForm[];
  comments?: CommunityComment[];
  commentsCount?: number;
}

const DEFAULT_SYNONYMS = ['огторгой', 'хүхэ мүнхэ', 'сэнхир', 'ниидэлгэ'];
const DEFAULT_ANTONYMS = ['дэлхэй (земля)', 'газар (земля)'];
const DEFAULT_DIALECTS: DialectForm[] = [
  { dialect: 'Хоринский', word: 'тэнгэри' },
  { dialect: 'Селенгинский', word: 'тэнгрэ' },
  { dialect: 'Эхиритский', word: 'тэнгри' },
  { dialect: 'Цонгольский', word: 'тангара' },
];
const DEFAULT_COMMENTS: CommunityComment[] = [
  {
    author: 'Аюна Б.',
    initial: 'А',
    ago: '2 ч',
    text: 'В нашем селе говорят «тэнгри», без удвоения.',
  },
];

export function WordSidebar({
  synonyms,
  antonyms,
  dialects,
  comments,
  commentsCount,
}: WordSidebarProps): ReactElement {
  const syns = synonyms && synonyms.length > 0 ? synonyms : DEFAULT_SYNONYMS;
  const ants = antonyms && antonyms.length > 0 ? antonyms : DEFAULT_ANTONYMS;
  const dials = dialects && dialects.length > 0 ? dialects : DEFAULT_DIALECTS;
  const cmts = comments && comments.length > 0 ? comments : DEFAULT_COMMENTS;
  const count = commentsCount ?? 12;

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* learn this word */}
      <div
        className="card"
        style={{
          padding: 22,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
          color: 'white',
          border: 'none',
        }}
      >
        <Icon name="lightbulb" size={22} />
        <h4 style={{ fontSize: 18, marginTop: 8, marginBottom: 6 }}>Выучить за 5 минут</h4>
        <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, marginBottom: 14 }}>
          Флешкарта + квиз + произношение. Прямо сейчас.
        </p>
        <button
          type="button"
          className="btn"
          style={{ background: 'white', color: 'var(--primary-700)', width: '100%' }}
        >
          <Icon name="play" size={12} /> Начать карточку
        </button>
      </div>

      {/* synonyms / antonyms */}
      <div className="card" style={{ padding: 22 }}>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-soft)',
            marginBottom: 12,
          }}
        >
          Синонимы
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {syns.map((w) => (
            <span
              key={w}
              className="chip"
              style={{
                cursor: 'pointer',
                background: 'var(--primary-50)',
                color: 'var(--primary-700)',
                border: 'none',
              }}
            >
              {w}
            </span>
          ))}
        </div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-soft)',
            marginTop: 18,
            marginBottom: 12,
          }}
        >
          Антонимы
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ants.map((w) => (
            <span key={w} className="chip">
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* dialects */}
      <div className="card" style={{ padding: 22 }}>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-soft)',
            marginBottom: 12,
          }}
        >
          Диалектные формы
        </h4>
        {dials.map((x, i) => (
          <div
            key={`${x.dialect}-${i}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderTop: i ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{x.dialect}</span>
            <span style={{ fontWeight: 600 }}>{x.word}</span>
          </div>
        ))}
      </div>

      {/* community */}
      <div className="card" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-soft)',
            }}
          >
            Обсуждение · {count}
          </h4>
          <button type="button" className="chip chip-primary" style={{ cursor: 'pointer' }}>
            <Icon name="plus" size={10} /> Добавить
          </button>
        </div>
        {cmts.map((c, i) => (
          <div
            key={`${c.author}-${i}`}
            style={{ display: 'flex', gap: 10, marginBottom: 12 }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--accent-warm)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {c.initial}
            </div>
            <div>
              <div style={{ fontSize: 12 }}>
                <b>{c.author}</b>{' '}
                <span style={{ color: 'var(--text-soft)' }}>· {c.ago}</span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                  lineHeight: 1.5,
                }}
              >
                {c.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
