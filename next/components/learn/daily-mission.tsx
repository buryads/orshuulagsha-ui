// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

interface DailyMissionProps {
  onContinue: () => void;
}

const COMPLETED = 5;
const TOTAL = 8;
const XP = 120;

export function DailyMission({ onContinue }: DailyMissionProps): ReactElement {
  const percent = Math.round((COMPLETED / TOTAL) * 100);
  return (
    <div
      className="card"
      style={{
        padding: 28,
        background:
          'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
        color: 'white',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Icon name="zap" size={28} />
      <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>
        Дневная миссия
      </h3>
      <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
        Выучи 8 новых слов и пройди мини-квиз
      </p>
      <div
        style={{
          marginTop: 18,
          height: 8,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: 'white',
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontSize: 12,
          opacity: 0.9,
        }}
      >
        <span>
          {COMPLETED} / {TOTAL} слов
        </span>
        <span>+{XP} XP</span>
      </div>
      <button
        onClick={onContinue}
        className="btn"
        style={{
          marginTop: 18,
          background: 'white',
          color: 'var(--primary-700)',
        }}
      >
        Продолжить →
      </button>
    </div>
  );
}
