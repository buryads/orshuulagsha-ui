'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { BurField } from './bur-field';
import { submitContribution } from '@/lib/api/contributions';
import { getAuthToken } from '@/lib/api/cookies';
import type {
  ContributionType,
  ContribPayloadNewWord,
  ContribPayloadTranslation,
  ContribPayloadCorrection,
} from '@/lib/api/types';

type TabId = ContributionType;

// Optional prefill — used both from reader's "suggest translation" chip (bur only)
// and from "Edit and resubmit" on a rejected contribution (full payload).
export interface ContribPrefill {
  type?: ContributionType;
  burword_id?: number | null;
  // new_word / translation
  bur?: string;
  ru?: string;
  // new_word only
  example?: string;
  // correction only
  target?: 'translation' | 'word' | 'example';
  suggested?: string;
  note?: string;
}

interface ContributionFormProps {
  prefill?: ContribPrefill;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'guest';

// ----- new_word form state -----
interface NewWordFields {
  bur: string;
  ru: string;
  example: string;
}
// ----- translation form state -----
interface TranslationFields {
  bur: string;
  ru: string;
}
// ----- correction form state -----
interface CorrectionFields {
  target: 'translation' | 'word' | 'example';
  suggested: string;
  note: string;
}

function emptyNewWord(prefill?: ContribPrefill): NewWordFields {
  return {
    bur: prefill?.bur ?? '',
    ru: prefill?.ru ?? '',
    example: prefill?.example ?? '',
  };
}
function emptyTranslation(prefill?: ContribPrefill): TranslationFields {
  return {
    bur: prefill?.bur ?? '',
    ru: prefill?.ru ?? '',
  };
}
function emptyCorrection(prefill?: ContribPrefill): CorrectionFields {
  return {
    target: prefill?.target ?? 'translation',
    suggested: prefill?.suggested ?? '',
    note: prefill?.note ?? '',
  };
}

type FieldErrors = Record<string, string>;

export function ContributionForm({
  prefill,
  onSuccess,
  onCancel,
}: ContributionFormProps): ReactElement {
  const t = useTranslations('learn.contrib');

  // Determine initial tab from prefill
  const initialTab: TabId = prefill?.type ?? 'new_word';
  const [tab, setTab] = useState<TabId>(initialTab);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Per-tab field states — seeded from prefill (full payload on resubmit, or
  // bur-word-only when opened from the reader chip).
  const [newWord, setNewWord] = useState<NewWordFields>(() => emptyNewWord(prefill));
  const [translation, setTranslation] = useState<TranslationFields>(() =>
    emptyTranslation(prefill),
  );
  const [correction, setCorrection] = useState<CorrectionFields>(() =>
    emptyCorrection(prefill),
  );

  // Re-seed all tab states when prefill prop identity changes (e.g. user clicks
  // "resubmit" on a different rejected item without unmounting the form).
  useEffect(() => {
    if (!prefill) return;
    if (prefill.type) setTab(prefill.type);
    setNewWord(emptyNewWord(prefill));
    setTranslation(emptyTranslation(prefill));
    setCorrection(emptyCorrection(prefill));
  }, [prefill]);

  // ----- validation -----
  function validateNewWord(): FieldErrors {
    const errs: FieldErrors = {};
    if (!newWord.bur.trim()) errs.bur = t('validationRequired');
    else if (newWord.bur.trim().length < 2) errs.bur = t('validationTooShort', { min: 2 });
    if (!newWord.ru.trim()) errs.ru = t('validationRequired');
    return errs;
  }

  function validateTranslation(): FieldErrors {
    const errs: FieldErrors = {};
    if (!translation.bur.trim()) errs.bur = t('validationRequired');
    else if (translation.bur.trim().length < 2) errs.bur = t('validationTooShort', { min: 2 });
    if (!translation.ru.trim()) errs.ru = t('validationRequired');
    return errs;
  }

  function validateCorrection(): FieldErrors {
    const errs: FieldErrors = {};
    if (!correction.suggested.trim()) errs.suggested = t('validationRequired');
    return errs;
  }

  const validate = useCallback((): FieldErrors => {
    if (tab === 'new_word') return validateNewWord();
    if (tab === 'translation') return validateTranslation();
    return validateCorrection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, newWord, translation, correction]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Guest check
    if (!getAuthToken()) {
      setFormState('guest');
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setFormState('submitting');

    try {
      let payload: ContribPayloadNewWord | ContribPayloadTranslation | ContribPayloadCorrection;

      if (tab === 'new_word') {
        const nw: ContribPayloadNewWord = {
          bur: newWord.bur.trim(),
          ru: newWord.ru.trim(),
        };
        if (newWord.example.trim()) nw.example = newWord.example.trim();
        payload = nw;
      } else if (tab === 'translation') {
        const tr: ContribPayloadTranslation = {
          burword_id: prefill?.burword_id ?? null,
          bur: translation.bur.trim(),
          ru: translation.ru.trim(),
        };
        payload = tr;
      } else {
        const cr: ContribPayloadCorrection = {
          burword_id: prefill?.burword_id ?? null,
          target: correction.target,
          suggested: correction.suggested.trim(),
        };
        if (correction.note.trim()) cr.note = correction.note.trim();
        payload = cr;
      }

      await submitContribution({ type: tab, payload });
      setFormState('success');
      onSuccess?.();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setFormState('guest');
      } else {
        setFormState('error');
      }
    }
  }

  function handleReset() {
    setFormState('idle');
    setErrors({});
    setNewWord(emptyNewWord());
    setTranslation(emptyTranslation());
    setCorrection(emptyCorrection());
  }

  // ---- render states ----

  if (formState === 'guest') {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <Icon name="lock" size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('guestTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('guestBody')}</p>
        <Link href="/signin" className="btn btn-primary">
          {t('guestBtn')}
        </Link>
      </div>
    );
  }

  if (formState === 'success') {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <span className="chip chip-green" style={{ fontSize: 13 }}>
            <Icon name="check" size={14} />
            {t('successChip')}
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('successTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('successBody')}</p>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          {t('submitAnotherBtn')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card" style={{ padding: 24 }}>
        {/* Tab selector */}
        <div
          role="tablist"
          aria-label="Тип вклада"
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 24,
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          {(
            [
              ['new_word', t('tabNewWord')] as const,
              ['translation', t('tabTranslation')] as const,
              ['correction', t('tabCorrection')] as const,
            ] as [TabId, string][]
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`contrib-panel-${id}`}
                id={`contrib-tab-${id}`}
                onClick={() => {
                  setTab(id);
                  setErrors({});
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: active
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
                  marginBottom: -1,
                  background: 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* new_word panel */}
        <div
          role="tabpanel"
          id="contrib-panel-new_word"
          aria-labelledby="contrib-tab-new_word"
          hidden={tab !== 'new_word'}
        >
          {tab === 'new_word' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <BurField
                id="nw-bur"
                label={t('fieldBur')}
                placeholder={t('fieldBurPlaceholder')}
                value={newWord.bur}
                onChange={(v) => setNewWord((prev) => ({ ...prev, bur: v }))}
                error={errors.bur}
                required
              />
              <TextareaField
                id="nw-ru"
                label={t('fieldRu')}
                placeholder={t('fieldRuPlaceholder')}
                value={newWord.ru}
                onChange={(v) => setNewWord((prev) => ({ ...prev, ru: v }))}
                error={errors.ru}
                required
              />
              <TextareaField
                id="nw-example"
                label={t('fieldExample')}
                placeholder={t('fieldExamplePlaceholder')}
                value={newWord.example}
                onChange={(v) => setNewWord((prev) => ({ ...prev, example: v }))}
              />
            </div>
          )}
        </div>

        {/* translation panel */}
        <div
          role="tabpanel"
          id="contrib-panel-translation"
          aria-labelledby="contrib-tab-translation"
          hidden={tab !== 'translation'}
        >
          {tab === 'translation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <BurField
                id="tr-bur"
                label={t('fieldBur')}
                placeholder={t('fieldBurPlaceholder')}
                value={translation.bur}
                onChange={(v) => setTranslation((prev) => ({ ...prev, bur: v }))}
                error={errors.bur}
                required
              />
              <TextareaField
                id="tr-ru"
                label={t('fieldRu')}
                placeholder={t('fieldRuPlaceholder')}
                value={translation.ru}
                onChange={(v) => setTranslation((prev) => ({ ...prev, ru: v }))}
                error={errors.ru}
                required
              />
            </div>
          )}
        </div>

        {/* correction panel */}
        <div
          role="tabpanel"
          id="contrib-panel-correction"
          aria-labelledby="contrib-tab-correction"
          hidden={tab !== 'correction'}
        >
          {tab === 'correction' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FieldSelect
                id="cr-target"
                label={t('fieldTarget')}
                value={correction.target}
                options={[
                  { value: 'translation', label: t('fieldTargetTranslation') },
                  { value: 'word', label: t('fieldTargetWord') },
                  { value: 'example', label: t('fieldTargetExample') },
                ]}
                onChange={(v) =>
                  setCorrection((prev) => ({
                    ...prev,
                    target: v as 'translation' | 'word' | 'example',
                  }))
                }
              />
              <TextareaField
                id="cr-suggested"
                label={t('fieldSuggested')}
                placeholder={t('fieldSuggestedPlaceholder')}
                value={correction.suggested}
                onChange={(v) => setCorrection((prev) => ({ ...prev, suggested: v }))}
                error={errors.suggested}
                required
              />
              <TextareaField
                id="cr-note"
                label={t('fieldNote')}
                placeholder={t('fieldNotePlaceholder')}
                value={correction.note}
                onChange={(v) => setCorrection((prev) => ({ ...prev, note: v }))}
              />
            </div>
          )}
        </div>

        {/* Error banner */}
        {formState === 'error' ? (
          <div
            role="alert"
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'var(--tertiary-soft)',
              border: '1px solid var(--tertiary)',
              borderRadius: 'var(--r-sm)',
              fontSize: 14,
            }}
          >
            <strong style={{ color: 'var(--tertiary-700)' }}>{t('errorTitle')}.</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>{t('errorBody')}</span>
          </div>
        ) : null}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 24,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {onCancel ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={formState === 'submitting'}
            >
              {t('btnCancel')}
            </button>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formState === 'submitting'}
          >
            {formState === 'submitting' ? (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                {t('btnSubmitting')}
              </>
            ) : (
              <>
                <Icon name="arrow-right" size={14} />
                {formState === 'error' ? t('retryBtn') : t('btnSubmit')}
              </>
            )}
          </button>
        </div>
      </div>
      {/* spin keyframe injected inline (small, single-use) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

// ---- sub-components ----

interface TextareaFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

function TextareaField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  rows = 3,
}: TextareaFieldProps): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
      >
        {label}
        {required ? (
          <span aria-hidden="true" style={{ color: 'var(--tertiary)', marginLeft: 2 }}>
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          border: `1px solid ${error ? 'var(--tertiary)' : 'var(--border)'}`,
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 14,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--tertiary)'
            : 'var(--primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--tertiary)'
            : 'var(--border)';
        }}
      />
      {error ? (
        <span
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: 12, color: 'var(--tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Icon name="x" size={12} />
          {error}
        </span>
      ) : null}
    </div>
  );
}

interface FieldSelectProps {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (val: string) => void;
}

function FieldSelect({ id, label, value, options, onChange }: FieldSelectProps): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: 14,
          outline: 'none',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
