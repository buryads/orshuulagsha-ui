// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface WordHeroProps {
  word: string;
  ipa?: string;
  pos?: string;
  level?: string;
  difficulty?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export function WordHero({
  word,
  ipa,
  pos,
  level,
  difficulty,
  audioUrl,
  imageUrl,
}: WordHeroProps): ReactElement {
  const [favorited, setFavorited] = useState(false);
  const [recording, setRecording] = useState(false);

  const speak = () => {
    if (typeof window === 'undefined' || !word) return;
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        void audio.play();
        return;
      } catch {
        // fall through to speech synthesis
      }
    }
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    // Buryad text — fall back to Mongolian (closest available browser voice).
    utter.lang = 'mn-MN';
    synth.speak(utter);
  };

  const copyWord = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(word);
    } catch {
      // ignore
    }
  };

  const share = async () => {
    if (typeof navigator === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({ title: word, text: word, url: window.location.href });
      } catch {
        // ignore
      }
    } else {
      void copyWord();
    }
  };

  return (
    <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'var(--primary-50)',
          opacity: 0.7,
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="chip chip-primary">{pos ?? 'часть речи'}</span>
          <span className="chip chip-warm">{difficulty ?? 'базовая лексика'}</span>
          <span className="chip">{level ?? 'A1 · начальный'}</span>
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 8,
            fontFamily: 'var(--font-bur)',
          }}
        >
          {word}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {ipa ?? '/—/'}
          </span>
          <button
            type="button"
            onClick={speak}
            className="btn-icon"
            style={{ background: 'var(--primary)', color: 'white', width: 38, height: 38 }}
            aria-label="Прослушать произношение"
          >
            <Icon name="play" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setRecording((v) => !v)}
            className="btn-icon"
            style={{
              width: 38,
              height: 38,
              background: recording ? 'var(--tertiary)' : 'var(--surface-2)',
              color: recording ? 'white' : 'var(--text-muted)',
            }}
            aria-label="Записать и сравнить произношение"
          >
            <Icon name="mic" size={14} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
            Запиши и сравни произношение
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFavorited((v) => !v)}
            className="btn btn-secondary"
            style={{
              background: favorited ? 'var(--tertiary-soft)' : 'var(--surface-2)',
              color: favorited ? 'var(--tertiary-700)' : 'var(--text)',
              border: favorited ? '1px solid transparent' : '1px solid var(--border)',
            }}
          >
            <Icon name={favorited ? 'heart-fill' : 'heart'} size={14} />
            {favorited ? 'В избранном' : 'В избранное'}
          </button>
          <button type="button" className="btn btn-secondary">
            <Icon name="bookmark" size={14} /> В коллекцию
          </button>
          <button type="button" onClick={() => void share()} className="btn btn-secondary">
            <Icon name="share" size={14} /> Поделиться
          </button>
          <button
            type="button"
            onClick={() => void copyWord()}
            className="btn btn-secondary"
            aria-label="Скопировать слово"
          >
            <Icon name="copy" size={14} />
          </button>
        </div>

        {imageUrl ? (
          <div style={{ marginTop: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={word}
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
