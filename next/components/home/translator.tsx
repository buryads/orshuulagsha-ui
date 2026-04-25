// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Icon } from '@/components/ui/icon';
import { TranslationText } from './translation-text';

export type FromLang = 'ru' | 'en' | 'mn' | 'auto' | 'bur';
export type ToLang = 'bur' | 'ru';

const BUR_CHARS = ['Ү', 'ү', 'Ө', 'ө', 'Һ', 'һ', 'Ң', 'ң', 'Ё', 'ё'] as const;

function speechLangFor(lang: FromLang | ToLang): string {
  // Browsers don't ship a Buryat voice — Mongolian is the closest match.
  switch (lang) {
    case 'ru':
      return 'ru-RU';
    case 'bur':
    case 'mn':
      return 'mn-MN';
    case 'en':
      return 'en-US';
    case 'auto':
    default:
      return 'ru-RU';
  }
}

interface BurKeyboardProps {
  onInsert: (c: string) => void;
  onClose: () => void;
}

function BurKeyboard({ onInsert, onClose }: BurKeyboardProps): ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        marginBottom: 10,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 10,
        display: 'flex',
        gap: 6,
        boxShadow: 'var(--shadow-md)',
        zIndex: 10,
      }}
    >
      {BUR_CHARS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onInsert(c)}
          style={{
            width: 36,
            height: 36,
            fontSize: 16,
            fontWeight: 600,
            background: 'var(--surface-2)',
            borderRadius: 8,
            color: 'var(--text)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-50)';
            e.currentTarget.style.color = 'var(--primary-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-2)';
            e.currentTarget.style.color = 'var(--text)';
          }}
        >
          {c}
        </button>
      ))}
      <button
        type="button"
        onClick={onClose}
        style={{ width: 36, height: 36, color: 'var(--text-muted)' }}
        aria-label="Закрыть клавиатуру"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

function langLabel(code: FromLang | ToLang): string {
  const labels: Record<string, string> = {
    ru: 'Русский',
    bur: 'Буряад хэлэн',
    en: 'English',
    mn: 'Монгол хэлэн',
    auto: 'Авто',
  };
  return labels[code] ?? code;
}

export interface TranslatorProps {
  from: FromLang;
  to: ToLang;
  setTo: (l: ToLang) => void;
  src: string;
  setSrc: (v: string) => void;
  tgt: string;
  loading: boolean;
  onSwap: () => void;
  onCommit?: () => void;
}

export function Translator({
  from,
  to,
  setTo,
  src,
  setSrc,
  tgt,
  loading,
  onSwap,
  onCommit,
}: TranslatorProps): ReactElement {
  const [showKb, setShowKb] = useState(false);
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea to fit content so the card never needs a vertical
  // scrollbar. Reset to auto first to allow shrinking when text is deleted.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 150)}px`;
  }, [src]);

  const insertChar = (c: string) => {
    const el = textareaRef.current;
    if (!el) {
      setSrc(src + c);
      return;
    }
    const start = el.selectionStart ?? src.length;
    const end = el.selectionEnd ?? src.length;
    const next = src.slice(0, start) + c + src.slice(end);
    setSrc(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + c.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const speak = (text: string, lang: FromLang | ToLang) => {
    if (typeof window === 'undefined' || !text) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = speechLangFor(lang);
    synth.speak(utter);
  };

  const copyTgt = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(tgt);
    } catch {
      // ignore
    }
  };

  const [shared, setShared] = useState(false);
  const shareUrl = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    // Prefer native share sheet on mobile; fall back to clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // user cancelled — fall through to clipboard so they still get the link
      }
    }
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="card fade-up"
      style={{
        borderRadius: 28,
        overflow: 'visible',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        position: 'relative',
      }}
    >
      {/* lang switch bar — direction is already shown by per-pane labels;
          this row only carries the swap button + TO chips */}
      <div className="tr-langbar">
        <button
          type="button"
          onClick={onSwap}
          className="btn-icon"
          style={{
            width: 40,
            height: 40,
            alignSelf: 'center',
            marginLeft: 14,
            background: 'var(--primary-50)',
            color: 'var(--primary)',
          }}
          aria-label="Поменять языки местами"
        >
          <Icon name="swap" size={18} />
        </button>
        <div
          style={{
            padding: '0 14px',
            display: 'flex',
            gap: 6,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={() => setTo('bur')}
            className="chip"
            style={{
              background: to === 'bur' ? 'var(--primary)' : 'transparent',
              color: to === 'bur' ? 'white' : 'var(--text-muted)',
              border: to === 'bur' ? '1px solid transparent' : '1px solid var(--border)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Буряад хэлэн
          </button>
          <button
            type="button"
            onClick={() => setTo('ru')}
            className="chip"
            style={{
              background: to === 'ru' ? 'var(--primary-50)' : 'transparent',
              color: to === 'ru' ? 'var(--primary-700)' : 'var(--text-muted)',
              border: to === 'ru' ? '1px solid transparent' : '1px solid var(--border)',
              fontWeight: to === 'ru' ? 700 : 600,
              cursor: 'pointer',
            }}
          >
            Русский
          </button>
        </div>
      </div>

      {/* text areas */}
      <div className="tr-cols" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={onSwap}
          className="tr-swap-mobile"
          aria-label="Поменять языки местами"
        >
          <Icon name="swap" size={18} />
        </button>
        <div style={{ padding: 24, position: 'relative' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-soft)',
              marginBottom: 10,
            }}
          >
            {langLabel(from)}
          </div>
          <textarea
            ref={textareaRef}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onBlur={() => onCommit?.()}
            placeholder="Введите текст…"
            style={{
              width: '100%',
              minHeight: 150,
              resize: 'vertical',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 22,
              lineHeight: 1.4,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              overflowY: 'hidden',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowKb(!showKb)}
                style={{
                  width: 34,
                  height: 34,
                  color: showKb ? 'var(--primary)' : 'var(--text-muted)',
                }}
                title="Бурятская клавиатура"
              >
                <Icon name="keyboard" size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => speak(src, from)}
                style={{ width: 34, height: 34 }}
                aria-label="Озвучить исходный текст"
              >
                <Icon name="volume" size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setRecording(!recording)}
                style={{
                  width: 34,
                  height: 34,
                  background: recording ? 'var(--tertiary)' : 'var(--surface-2)',
                  color: recording ? 'white' : 'var(--text-muted)',
                }}
                aria-label="Голосовой ввод"
              >
                <Icon name="mic" size={16} />
              </button>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
              {src.length} / 5000
            </span>
            {showKb && (
              <BurKeyboard onInsert={insertChar} onClose={() => setShowKb(false)} />
            )}
          </div>
        </div>

        <div
          style={{
            padding: 24,
            position: 'relative',
            background: 'var(--surface-2)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-soft)',
              marginBottom: 10,
            }}
          >
            {langLabel(to)}
          </div>
          <div
            style={{
              minHeight: 150,
              fontSize: 22,
              lineHeight: 1.4,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <TranslationText text={tgt} />
            {recording && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 6,
                  verticalAlign: 'middle',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="wave"
                    style={{
                      width: 3,
                      height: 14,
                      background: 'var(--primary)',
                      borderRadius: 2,
                      animation: `wave 0.8s ${i * 0.15}s ease-in-out infinite`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => speak(tgt, to)}
                style={{ width: 34, height: 34, color: 'var(--primary)' }}
                aria-label="Озвучить перевод"
              >
                <Icon name="volume" size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => void copyTgt()}
                style={{ width: 34, height: 34 }}
                aria-label="Скопировать перевод"
              >
                <Icon name="copy" size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                style={{ width: 34, height: 34 }}
                aria-label="В избранное"
              >
                <Icon name="bookmark" size={16} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => void shareUrl()}
                style={{
                  width: 34,
                  height: 34,
                  color: shared ? 'var(--accent-green)' : undefined,
                }}
                aria-label="Скопировать ссылку"
                title={shared ? 'Ссылка скопирована' : 'Скопировать ссылку'}
              >
                <Icon name={shared ? 'check' : 'share'} size={16} />
              </button>
            </div>
            <button type="button" className="chip chip-primary" style={{ cursor: 'pointer' }}>
              <Icon name="book" size={12} /> Открыть в словаре
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
