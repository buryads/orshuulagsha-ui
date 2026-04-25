// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { Icon } from '@/components/ui/icon';
import { translateWord } from '@/lib/api/translate';
import type { TranslationType } from '@/lib/api/types';

type FromLang = 'ru' | 'en' | 'mn' | 'auto' | 'bur';
type ToLang = 'bur' | 'ru';

const BUR_CHARS = ['Ү', 'ү', 'Ө', 'ө', 'Һ', 'һ', 'Ң', 'ң', 'Ё', 'ё'] as const;

const INITIAL_DEMO_SRC = 'Здравствуйте, как дела?';
const INITIAL_DEMO_TGT = 'Сайн байна, юу һонин бэ?';

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

function pickTranslationType(from: FromLang, to: ToLang): TranslationType | null {
  if (to === 'bur') {
    if (from === 'ru' || from === 'auto') return 'ru2bur';
    return null; // 'en' / 'mn' / 'bur' → 'bur' is unsupported
  }
  // to === 'ru'
  if (from === 'bur' || from === 'auto') return 'bur2ru';
  return null; // 'en' / 'mn' / 'ru' → 'ru' is unsupported
}

export function Translator(): ReactElement {
  const [from, setFrom] = useState<FromLang>('ru');
  const [to, setTo] = useState<ToLang>('bur');
  const [src, setSrc] = useState<string>(INITIAL_DEMO_SRC);
  const [tgt, setTgt] = useState<string>(INITIAL_DEMO_TGT);
  const [showKb, setShowKb] = useState(false);
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the very first auto-translate call when the textarea still holds the
  // canned demo string — keeps curated `tgt` visible and avoids a wasted API hit.
  const isInitial = useRef(true);

  const swap = useCallback(() => {
    // New target language is the opposite of current `from` (when `from` is
    // a recognised primary lang). Default to flipping bur<->ru.
    const newTo: ToLang = from === 'ru' ? 'bur' : 'ru';
    // The new `from` is the current `to`. Both 'bur' and 'ru' are valid
    // FromLang values, so the cast is sound after the type extension.
    const newFrom: FromLang = to;
    setFrom(newFrom);
    setTo(newTo);
    setSrc(tgt);
    setTgt(src);
  }, [from, to, src, tgt]);

  const runTranslate = useCallback(
    async (value: string) => {
      const type = pickTranslationType(from, to);
      if (!type || !value.trim()) return;
      try {
        const result = await translateWord(type, value);
        const first = result.exactTranslations[0] ?? result.possibleTranslations[0];
        if (first?.translations[0]?.name) {
          setTgt(first.translations[0].name);
        }
      } catch {
        // silent fail — keep prior translation visible
      }
    },
    [from, to],
  );

  // Debounced translate on src change
  useEffect(() => {
    if (isInitial.current && src === INITIAL_DEMO_SRC) {
      isInitial.current = false;
      return;
    }
    isInitial.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate(src);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [src, runTranslate]);

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

  const fromChip = (l: FromLang): CSSProperties => ({
    background: from === l ? 'var(--primary-50)' : 'transparent',
    color: from === l ? 'var(--primary-700)' : 'var(--text-muted)',
    border: from === l ? '1px solid transparent' : '1px solid var(--border)',
    fontWeight: from === l ? 700 : 600,
    cursor: 'pointer',
  });

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
      {/* lang switch bar */}
      <div className="tr-langbar">
        <div style={{ padding: '14px 22px', display: 'flex', gap: 6 }}>
          {(['ru', 'en', 'mn'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setFrom(l)}
              className="chip"
              style={fromChip(l)}
            >
              {langLabel(l)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFrom('auto')}
            className="chip"
            style={{
              border: '1px dashed var(--border-strong)',
              color: from === 'auto' ? 'var(--primary-700)' : 'var(--text-soft)',
              background: from === 'auto' ? 'var(--primary-50)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <Icon name="plus" size={12} /> Авто
          </button>
        </div>
        <button
          type="button"
          onClick={swap}
          className="btn-icon"
          style={{
            width: 40,
            height: 40,
            alignSelf: 'center',
            margin: '0 6px',
            background: 'var(--primary-50)',
            color: 'var(--primary)',
          }}
          aria-label="Поменять языки местами"
        >
          <Icon name="swap" size={18} />
        </button>
        <div
          style={{
            padding: '14px 22px',
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
      <div className="tr-cols">
        <div style={{ padding: 24, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            onBlur={() => void runTranslate(src)}
            placeholder="Введите текст…"
            style={{
              width: '100%',
              height: 150,
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 22,
              lineHeight: 1.4,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
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
              height: 150,
              fontSize: 22,
              lineHeight: 1.4,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            {tgt}
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
                style={{ width: 34, height: 34 }}
                aria-label="Поделиться"
              >
                <Icon name="share" size={16} />
              </button>
            </div>
            <button type="button" className="chip chip-primary" style={{ cursor: 'pointer' }}>
              <Icon name="book" size={12} /> Открыть в словаре
            </button>
          </div>
        </div>
      </div>

      {/* AI suggest */}
      <div
        style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background:
            'linear-gradient(90deg, var(--primary-50) 0%, transparent 70%)',
          borderRadius: '0 0 28px 28px',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background:
              'linear-gradient(135deg, var(--primary) 0%, var(--accent-warm) 100%)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
          }}
        >
          <Icon name="sparkles" size={14} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI-помощник нашёл{' '}
          <b style={{ color: 'var(--text)' }}>3 диалектных варианта</b> и{' '}
          <b style={{ color: 'var(--text)' }}>культурный контекст</b> для этого
          приветствия.
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12 }}
        >
          Показать
        </button>
      </div>
    </div>
  );
}
