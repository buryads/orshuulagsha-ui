'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import {
  getModerationQueue,
  approveContribution,
  rejectContribution,
} from '@/lib/api/contributions';
import type { ModerationContribution } from '@/lib/api/types';

type PanelState = 'loading' | 'error' | 'forbidden' | 'empty' | 'ready';
type ActionState = 'idle' | 'approving' | 'rejecting';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ModerationPanel(): ReactElement {
  const t = useTranslations('moderation');
  const tc = useTranslations('learn.contrib');

  const [panelState, setPanelState] = useState<PanelState>('loading');
  const [items, setItems] = useState<ModerationContribution[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<ModerationContribution | null>(null);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const load = useCallback(async () => {
    setPanelState('loading');
    setSelected(null);
    try {
      const res = await getModerationQueue({ status: 'pending', limit: 50 });
      setItems(res.data);
      setTotal(res.meta.count);
      setPanelState(res.data.length === 0 ? 'empty' : 'ready');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setPanelState('forbidden');
      } else {
        setPanelState('error');
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApprove() {
    if (!selected) return;
    setActionState('approving');
    try {
      await approveContribution(selected.id);
      const next = items.filter((i) => i.id !== selected.id);
      setItems(next);
      setTotal((c) => c - 1);
      setSelected(next[0] ?? null);
      setPanelState(next.length === 0 ? 'empty' : 'ready');
    } catch {
      // Non-fatal — keep UI intact, action state returns to idle
    } finally {
      setActionState('idle');
    }
  }

  function openRejectModal() {
    setRejectModalOpen(true);
  }

  async function handleReject(note: string) {
    if (!selected) return;
    setActionState('rejecting');
    setRejectModalOpen(false);
    try {
      await rejectContribution(selected.id, { note });
      const next = items.filter((i) => i.id !== selected.id);
      setItems(next);
      setTotal((c) => c - 1);
      setSelected(next[0] ?? null);
      setPanelState(next.length === 0 ? 'empty' : 'ready');
    } catch {
      // Non-fatal
    } finally {
      setActionState('idle');
    }
  }

  // ---- render states ----

  if (panelState === 'loading') {
    return <PanelSkeleton />;
  }

  if (panelState === 'forbidden') {
    return (
      <div
        className="card fade-up"
        style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}
      >
        <Icon name="lock" size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('accessDenied')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('accessDeniedBody')}</p>
      </div>
    );
  }

  if (panelState === 'error') {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t('error')}</p>
        <button type="button" className="btn btn-secondary" onClick={load}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (panelState === 'empty') {
    return (
      <div
        className="card fade-up"
        style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '40px auto' }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{t('queueEmpty')}</h2>
      </div>
    );
  }

  return (
    <>
      <div
        className="fade-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 1.6fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left: queue list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            {t('pendingCount', { count: total })}
          </div>
          <ul role="listbox" aria-label={t('pageTitle')} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item) => {
              const isSelected = selected?.id === item.id;
              return (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setSelected(item)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-50)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="chip" style={{ fontSize: 10, padding: '2px 6px' }}>
                      {typeLabel(item.type, tc)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {extractWord(item)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>
                    {item.user_name}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: preview */}
        <div aria-live="polite" aria-atomic="true">
          {selected ? (
            <div className="card" style={{ padding: 24 }}>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>
                    {extractWord(selected)}
                  </h2>
                  <span className="chip" style={{ fontSize: 11 }}>
                    {typeLabel(selected.type, tc)}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {t('submittedBy', { name: selected.user_name })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                    {t('submittedAt', { date: formatDate(selected.created_at) })}
                  </div>
                </div>
              </div>

              {/* Payload detail */}
              <PayloadDetail item={selected} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionState !== 'idle'}
                  onClick={handleApprove}
                  aria-label={t('approveBtn')}
                >
                  <Icon name="check" size={14} />
                  {actionState === 'approving' ? t('approving') : t('approveBtn')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={actionState !== 'idle'}
                  onClick={openRejectModal}
                  aria-label={t('rejectBtn')}
                  style={{ color: 'var(--tertiary-700)' }}
                >
                  <Icon name="x" size={14} />
                  {actionState === 'rejecting' ? t('rejecting') : t('rejectBtn')}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: 40,
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}
            >
              {t('selectToPreview')}
            </div>
          )}
        </div>
      </div>

      {rejectModalOpen ? (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => setRejectModalOpen(false)}
        />
      ) : null}

      {/* Responsive: stack on narrow screens */}
      <style>{`
        @media (max-width: 720px) {
          .mod-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

// ---- PayloadDetail: renders different contribution types ----

function PayloadDetail({ item }: { item: ModerationContribution }): ReactElement {
  const p = item.payload as unknown as Record<string, unknown>;

  if (item.type === 'new_word') {
    return (
      <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0 }}>
        <Row label="Бурятское слово" value={String(p.word ?? '')} />
        <Row label="Перевод" value={`${String(p.translation ?? '')} (${String(p.lang ?? '')})`} />
        {p.example ? <Row label="Пример" value={String(p.example)} /> : null}
      </dl>
    );
  }
  if (item.type === 'translation') {
    return (
      <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0 }}>
        <Row label="Бурятское слово" value={String(p.word ?? '')} />
        <Row label="Перевод" value={`${String(p.translation ?? '')} (${String(p.lang ?? '')})`} />
        {p.burword_id ? <Row label="ID слова" value={String(p.burword_id)} /> : null}
      </dl>
    );
  }
  // correction
  return (
    <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0 }}>
      <Row label="Слово" value={String(p.word ?? '')} />
      <Row label="Поле" value={String(p.field ?? '')} />
      <Row label="Предлагаемая замена" value={String(p.suggestion ?? '')} />
      {p.comment ? <Row label="Комментарий" value={String(p.comment)} /> : null}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
      <dt style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', paddingTop: 2 }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontSize: 14, color: 'var(--text)', wordBreak: 'break-word' }}>
        {value}
      </dd>
    </div>
  );
}

// ---- RejectModal with focus trap ----

interface RejectModalProps {
  onConfirm: (note: string) => void;
  onClose: () => void;
}

const PRESETS = [
  'rejectPresetDuplicate',
  'rejectPresetQuality',
  'rejectPresetOfftopic',
  'rejectPresetError',
] as const;

function RejectModal({ onConfirm, onClose }: RejectModalProps): ReactElement {
  const t = useTranslations('moderation');
  const [preset, setPreset] = useState<string>('');
  const [custom, setCustom] = useState('');
  const [validationErr, setValidationErr] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus trap + initial focus
  useEffect(() => {
    firstFocusRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const note = preset || custom.trim();
    if (!note) {
      setValidationErr(t('rejectNoteRequired'));
      return;
    }
    const combined = preset && custom.trim() ? `${preset}: ${custom.trim()}` : note;
    onConfirm(combined);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="card fade-up"
        style={{ padding: 28, maxWidth: 420, width: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <h2 id="reject-modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {t('rejectModalTitle')}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label={t('rejectCancelBtn')}
            ref={firstFocusRef}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-muted)' }}>
          {t('rejectModalBody')}
        </p>
        <form onSubmit={handleSubmit}>
          {/* Preset chips */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
              {t('rejectModalTitle')}
            </legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((key) => {
                const label = t(key);
                const active = preset === label;
                return (
                  <label
                    key={key}
                    className={active ? 'chip chip-rose' : 'chip'}
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="reject-preset"
                      value={label}
                      checked={active}
                      onChange={() => {
                        setPreset(label);
                        setValidationErr('');
                      }}
                      style={{ display: 'none' }}
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Custom text */}
          <label
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
            htmlFor="reject-custom"
          >
            {t('rejectCustomLabel')}
          </label>
          <textarea
            id="reject-custom"
            rows={3}
            value={custom}
            placeholder={t('rejectCustomPlaceholder')}
            onChange={(e) => {
              setCustom(e.target.value);
              if (e.target.value.trim()) setValidationErr('');
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--r-sm)',
              border: `1px solid ${validationErr ? 'var(--tertiary)' : 'var(--border)'}`,
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 14,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          {validationErr ? (
            <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--tertiary)' }}>
              {validationErr}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('rejectCancelBtn')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: 'var(--tertiary)', boxShadow: 'none' }}
            >
              <Icon name="x" size={14} />
              {t('rejectSubmitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Skeleton ----

function PanelSkeleton(): ReactElement {
  const t = useTranslations('moderation');
  return (
    <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              background: i % 2 ? 'var(--surface-2)' : 'transparent',
            }}
          >
            <div
              style={{
                height: 12,
                width: '60%',
                borderRadius: 6,
                background: 'var(--border)',
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 10,
                width: '40%',
                borderRadius: 6,
                background: 'var(--border)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        {t('loading')}
      </div>
    </div>
  );
}

// ---- Helpers ----

function typeLabel(
  type: string,
  t: ReturnType<typeof useTranslations<'learn.contrib'>>,
): string {
  if (type === 'new_word') return t('typeNewWord');
  if (type === 'translation') return t('typeTranslation');
  return t('typeCorrection');
}

function extractWord(item: ModerationContribution): string {
  const p = item.payload as unknown as Record<string, unknown>;
  return typeof p.word === 'string' ? p.word : `#${item.id}`;
}
