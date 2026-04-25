// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import type { DemoUser } from './demo-data';

export interface ProfileCoverUser {
  name: string;
  email?: string;
  dialect?: string;
  level?: string;
  joined?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const first = parts[0]!;
    return first.slice(0, 2).toUpperCase();
  }
  const first = parts[0]!.charAt(0);
  const second = parts[1]!.charAt(0);
  return (first + second).toUpperCase();
}

const MONTHS_RU = [
  'январе',
  'феврале',
  'марте',
  'апреле',
  'мае',
  'июне',
  'июле',
  'августе',
  'сентябре',
  'октябре',
  'ноябре',
  'декабре',
];

function formatJoined(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = MONTHS_RU[date.getMonth()] ?? '';
  return `в портале с ${month} ${date.getFullYear()}`;
}

export interface ProfileCoverProps {
  user: ProfileCoverUser | DemoUser;
}

export function ProfileCover({ user }: ProfileCoverProps): ReactElement {
  const initials = getInitials(user.name);
  const dialect = user.dialect ?? 'Хоринский';
  const level = user.level ?? 'B1';
  const joinedRaw = user.joined ?? '2026-01-15';
  const joinedText = formatJoined(joinedRaw);

  return (
    <div>
      {/* hero with cover */}
      <div
        style={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, var(--primary-700) 0%, var(--accent-warm) 100%)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.15,
          }}
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="profile-meander"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 30 L15 30 L15 15 L30 15 L30 30 L45 30 L45 15 L60 15"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="1200" height="200" fill="url(#profile-meander)" />
        </svg>
      </div>

      <div style={{ padding: '0 clamp(16px, 4vw, 28px)' }}>
        {/* avatar bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
            marginTop: -56,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, var(--accent-warm) 0%, var(--tertiary) 100%)',
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              fontSize: 40,
              fontWeight: 800,
              border: '6px solid var(--bg)',
              boxShadow: 'var(--shadow-md)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, paddingBottom: 8, minWidth: 220 }}>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {user.name}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 6,
                alignItems: 'center',
                color: 'var(--text-muted)',
                fontSize: 13,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon name="globe" size={12} /> {dialect} диалект
              </span>
              <span>·</span>
              <span>
                Уровень <b style={{ color: 'var(--text)' }}>{level}</b>
              </span>
              <span>·</span>
              <span>{joinedText}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
            <button className="btn btn-secondary" type="button">
              <Icon name="share" size={14} /> Поделиться
            </button>
            <button className="btn btn-secondary" type="button">
              <Icon name="settings" size={14} /> Настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
