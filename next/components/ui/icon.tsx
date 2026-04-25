import type { CSSProperties, ReactElement } from 'react';

export type IconName =
  | 'search'
  | 'translate'
  | 'book'
  | 'user'
  | 'home'
  | 'compass'
  | 'sparkles'
  | 'zap'
  | 'flame'
  | 'heart'
  | 'heart-fill'
  | 'bookmark'
  | 'bookmark-fill'
  | 'play'
  | 'volume'
  | 'mic'
  | 'settings'
  | 'trophy'
  | 'target'
  | 'chart'
  | 'users'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-down'
  | 'swap'
  | 'copy'
  | 'share'
  | 'moon'
  | 'sun'
  | 'globe'
  | 'menu'
  | 'x'
  | 'check'
  | 'plus'
  | 'filter'
  | 'calendar'
  | 'clock'
  | 'library'
  | 'comment'
  | 'bell'
  | 'lightbulb'
  | 'ai'
  | 'keyboard'
  | 'leaf'
  | 'mountain'
  | 'edit'
  | 'trash'
  | 'more'
  | 'star'
  | 'lock';

export interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({
  name,
  size = 20,
  stroke = 1.8,
  className = '',
  style,
}: IconProps): ReactElement {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
  };
  switch (name) {
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case 'translate':
      return (
        <svg {...props}>
          <path d="M5 8h6" />
          <path d="M8 5v3" />
          <path d="M5 14c2.5 4 5.5 4 5.5 4" />
          <path d="M5 14c0-2 2.5-3 5.5-3" />
          <path d="m12 20 4-9 4 9" />
          <path d="M14 17h4" />
        </svg>
      );
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
          <path d="M4 19.5V5.5" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      );
    case 'home':
      return (
        <svg {...props}>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case 'compass':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15 9-2 6-6 2 2-6 6-2z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...props}>
          <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
          <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    case 'flame':
      return (
        <svg {...props}>
          <path d="M12 22c4 0 7-3 7-7 0-4-3-6-3-9 0 0-3 1-4 5-1-2-3-2-3-2s-1 3-1 5c0 1.5.5 3 1 4-2 0-4-1-4-3 0 0-1 2-1 4 0 4 4 7 8 7z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      );
    case 'heart-fill':
      return (
        <svg {...props} fill="currentColor" stroke="none">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...props}>
          <path d="M6 4h12v18l-6-4-6 4z" />
        </svg>
      );
    case 'bookmark-fill':
      return (
        <svg {...props} fill="currentColor" stroke="none">
          <path d="M6 4h12v18l-6-4-6 4z" />
        </svg>
      );
    case 'play':
      return (
        <svg {...props} fill="currentColor" stroke="none">
          <path d="M6 4v16l14-8z" />
        </svg>
      );
    case 'volume':
      return (
        <svg {...props}>
          <path d="M11 5 6 9H2v6h4l5 4z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M19 6a8 8 0 0 1 0 12" />
        </svg>
      );
    case 'mic':
      return (
        <svg {...props}>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
          <path d="M17 4h3v3a3 3 0 0 1-3 3" />
          <path d="M7 4H4v3a3 3 0 0 0 3 3" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 3 5-7" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="8" r="3" />
          <path d="M21 21c0-2.5-1.7-4.5-4-5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...props}>
          <path d="M19 12H5" />
          <path d="m11 19-7-7 7-7" />
        </svg>
      );
    case 'arrow-up-down':
      return (
        <svg {...props}>
          <path d="M7 4v16" />
          <path d="m3 8 4-4 4 4" />
          <path d="M17 20V4" />
          <path d="m13 16 4 4 4-4" />
        </svg>
      );
    case 'swap':
      return (
        <svg {...props}>
          <path d="M7 16V4" />
          <path d="m3 8 4-4 4 4" />
          <path d="M17 8v12" />
          <path d="m13 16 4 4 4-4" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...props}>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'share':
      return (
        <svg {...props}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'x':
      return (
        <svg {...props}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="m5 12 5 5 9-11" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...props}>
          <path d="M3 5h18l-7 9v6l-4-2v-4z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'library':
      return (
        <svg {...props}>
          <path d="M5 4v16" />
          <path d="M9 4v16" />
          <path d="M13 6l3-1 4 14-3 1z" />
        </svg>
      );
    case 'comment':
      return (
        <svg {...props}>
          <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg {...props}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12.6c.7.6 1 1.4 1 2.4h6c0-1 .3-1.8 1-2.4A7 7 0 0 0 12 2z" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...props}>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'keyboard':
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M8 14h8" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...props}>
          <path d="M11 20A7 7 0 0 1 4 13c0-6 4-9 13-10 0 8-2 13-6 17z" />
          <path d="M2 22c4-6 8-8 12-9" />
        </svg>
      );
    case 'mountain':
      return (
        <svg {...props}>
          <path d="m3 20 6-10 4 6 3-4 5 8z" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );
    case 'more':
      return (
        <svg {...props} fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
