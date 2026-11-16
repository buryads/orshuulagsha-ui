'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { getKudos, markKudosSeen, type Kudos } from '@/lib/api/studio-board';

const TOAST_MS = 7000;

export function KudosInbox(): ReactElement {
  const t = useTranslations('studio.kudos');
  const [items, setItems] = useState<Kudos[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    getKudos()
      .then((list) => {
        setItems(list.items);
        setUnseen(list.unseen);
        const fresh = list.items.filter((k) => !k.seen);
        const first = fresh[0];
        if (list.unseen > 0 && first) {
          const rest = list.unseen - 1;
          setToast(
            rest > 0
              ? t('toastMore', { emoji: first.emoji, name: first.from.name, count: rest })
              : t('toast', { emoji: first.emoji, name: first.from.name }),
          );
        }
      })
      .catch(() => setFailed(true));
  }, [t]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  function toggle() {
    setToast(null);
    if (!open && unseen > 0) {
      setUnseen(0);
      void markKudosSeen().catch(() => undefined);
    }
    setOpen(!open);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} data-testid="kudos-inbox">
      <button
        type="button"
        className="btn btn-ghost"
        aria-expanded={open}
        onClick={toggle}
        style={{ padding: '8px 14px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <span aria-hidden>🙌</span>
        {t('inbox')}
        {unseen > 0 && (
          <span
            data-testid="kudos-unseen"
            style={{
              background: 'var(--tertiary)',
              color: 'var(--text-inv)',
              borderRadius: 999,
              minWidth: 20,
              height: 20,
              padding: '0 6px',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unseen}
          </span>
        )}
      </button>
      {open && (
        <div
          className="card"
          role="region"
          aria-label={t('inboxTitle')}
          data-testid="kudos-list"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 50,
            width: 'min(340px, calc(100vw - 32px))',
            maxHeight: 360,
            overflowY: 'auto',
            padding: 12,
            background: 'var(--surface-elev)',
            boxShadow: '0 8px 24px rgba(14,16,19,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>{t('inboxTitle')}</strong>
            <button type="button" className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 10px', fontSize: 12 }} onClick={() => setOpen(false)}>
              {t('close')}
            </button>
          </div>
          {failed && <p style={{ margin: 0, fontSize: 13, color: 'var(--tertiary-700)' }}>{t('inboxLoadFailed')}</p>}
          {!failed && items.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('inboxEmpty')}</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((k) => (
              <li
                key={k.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: k.seen ? 'var(--surface-2)' : 'var(--accent-warm-soft)',
                }}
              >
                <span style={{ fontSize: 22 }} aria-hidden>
                  {k.emoji}
                </span>
                <span style={{ fontSize: 13, minWidth: 0, overflowWrap: 'anywhere' }}>
                  <strong>{k.from.name}</strong>
                  {!k.seen && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--tertiary-700)' }}>{t('newLabel')}</span>}
                  {k.message && <span style={{ display: 'block', color: 'var(--text-muted)' }}>{k.message}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {toast &&
        createPortal(
        <div
          role="status"
          data-testid="kudos-toast"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            left: 16,
            maxWidth: 360,
            marginLeft: 'auto',
            zIndex: 120,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'var(--neutral-900)',
            color: 'var(--text-inv)',
            fontSize: 14,
            boxShadow: '0 8px 24px rgba(14,16,19,0.3)',
          }}
        >
          {toast}
        </div>,
          document.body,
        )}
    </div>
  );
}
