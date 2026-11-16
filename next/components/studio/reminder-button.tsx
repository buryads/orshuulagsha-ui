'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { buildIcs } from '@/lib/studio/ics';
import {
  parseCustom,
  presetTime,
  REMINDER_STORAGE_KEY,
  restoreReminder,
  serializeReminder,
  type ReminderPreset,
} from '@/lib/studio/reminder';
import { inputStyle } from './field';

type Outcome = 'scheduled' | 'denied' | 'unsupported';

const MAX_TIMEOUT_MS = 3_600_000;

function readStored(): string | null {
  try {
    return localStorage.getItem(REMINDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(REMINDER_STORAGE_KEY);
    else localStorage.setItem(REMINDER_STORAGE_KEY, value);
  } catch {
    return;
  }
}

function downloadIcs(content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'studio-reminder.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReminderButton(): ReactElement {
  const t = useTranslations('studio.reminder');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Date | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [custom, setCustom] = useState('');
  const [invalid, setInvalid] = useState(false);
  const timer = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const flowUrl = useCallback(() => `${window.location.origin}/${locale}/studio/flow`, [locale]);

  const arm = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    const state = restoreReminder(readStored(), new Date());
    if (state.kind === 'none') {
      writeStored(null);
      return;
    }
    if (state.kind === 'wait') {
      timer.current = window.setTimeout(arm, Math.min(state.ms, MAX_TIMEOUT_MS));
      return;
    }
    writeStored(null);
    try {
      const n = new Notification(t('notifTitle'), { body: t('notifBody') });
      n.onclick = () => {
        window.focus();
        window.location.assign(flowUrl());
        n.close();
      };
    } catch {
      return;
    }
  }, [t, flowUrl]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') arm();
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [arm]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function choose(at: Date) {
    setChosen(at);
    setInvalid(false);
    if (typeof Notification === 'undefined') {
      setOutcome('unsupported');
      return;
    }
    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = 'denied';
      }
    }
    if (permission !== 'granted') {
      setOutcome('denied');
      return;
    }
    writeStored(serializeReminder(at));
    arm();
    setOutcome('scheduled');
  }

  function pick(preset: ReminderPreset) {
    void choose(presetTime(preset, new Date()));
  }

  function pickCustom() {
    const at = parseCustom(custom, new Date());
    if (!at) {
      setInvalid(true);
      return;
    }
    void choose(at);
  }

  function addToCalendar() {
    if (!chosen) return;
    const now = new Date();
    downloadIcs(
      buildIcs({
        uid: `studio-reminder-${chosen.getTime()}-${now.getTime()}@buryads.com`,
        start: chosen,
        now,
        title: t('calendarTitle'),
        description: t('calendarBody'),
        url: flowUrl(),
      }),
    );
  }

  const timeLabel = chosen ? chosen.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '';
  const presetStyle = { padding: '8px 12px', fontSize: 14, textAlign: 'left' as const };

  return (
    <div ref={root} style={{ position: 'relative', display: 'inline-block' }} data-testid="reminder">
      <button
        type="button"
        className="btn btn-ghost"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{ padding: '8px 14px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <span aria-hidden>⏰</span>
        {t('button')}
      </button>
      {open && (
        <div
          className="card"
          role="dialog"
          aria-label={t('title')}
          data-testid="reminder-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 50,
            width: 'min(320px, calc(100vw - 32px))',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'var(--surface-elev)',
            boxShadow: '0 8px 24px rgba(14,16,19,0.18)',
          }}
        >
          <strong style={{ fontSize: 14 }}>{t('title')}</strong>
          <button type="button" className="btn btn-ghost" style={presetStyle} onClick={() => pick('hour')}>
            {t('hour')}
          </button>
          <button type="button" className="btn btn-ghost" style={presetStyle} onClick={() => pick('tomorrow')}>
            {t('tomorrow')}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="datetime-local"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              aria-label={t('custom')}
              style={{ ...inputStyle, flex: '1 1 auto' }}
            />
            <button type="button" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 13 }} onClick={pickCustom}>
              {t('customSet')}
            </button>
          </div>
          {invalid && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--tertiary-700)' }}>
              {t('invalid')}
            </p>
          )}
          {outcome && (
            <p role="status" data-testid="reminder-outcome" style={{ margin: 0, fontSize: 13 }}>
              {outcome === 'scheduled' ? t('scheduled', { time: timeLabel }) : t(outcome)}
            </p>
          )}
          {chosen && (
            <button type="button" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 14 }} onClick={addToCalendar}>
              {t('calendar')}
            </button>
          )}
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{t('honest')}</p>
        </div>
      )}
    </div>
  );
}
