'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { BurField } from './bur-field';
import { submitContribution } from '@/lib/api/contributions';
import { getAuthToken } from '@/lib/api/cookies';
import type {
  ContributionType,
  ContributionLang,
  ContribPayloadNewWord,
  ContribPayloadTranslation,
  ContribPayloadCorrection,
} from '@/lib/api/types';

type TabId = ContributionType;

// Optional prefill — used both from reader's "suggest translation" chip (word only)
// and from "Edit and resubmit" on a rejected contribution (full payload).
export interface ContribPrefill {
  type?: ContributionType;
  burword_id?: number | null;
  word?: string;
  // new_word / translation
  translation?: string;
  lang?: ContributionLang;
  // new_word
  example?: string;
  // correction
  field?: 'translation' | 'example' | 'other';
  suggestion?: string;
  comment?: string;
}

interface ContributionFormProps {
  prefill?: ContribPrefill;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'guest';

// ----- new_word form state -----
interface NewWordFields {
  word: string;
  translation: string;
  lang: ContributionLang;
  example: string;
}
// ----- translation form state -----
interface TranslationFields {
  word: string;
  translation: string;
  lang: ContributionLang;
}
// ----- correction form state -----
interface CorrectionFields {
  word: string;
  field: 'translation' | 'example' | 'other';
  suggestion: string;
  comment: string;
}

function emptyNewWord(prefill?: ContribPrefill): NewWordFields {
  return {
    word: prefill?.word ?? '',
    translation: prefill?.translation ?? '',
    lang: prefill?.lang ?? 'ru',
    example: prefill?.example ?? '',
  };
}
function emptyTranslation(prefill?: ContribPrefill): TranslationFields {
  return {
    word: prefill?.word ?? '',
    translation: prefill?.translation ?? '',
    lang: prefill?.lang ?? 'ru',
  };
}
function emptyCorrection(prefill?: ContribPrefill): CorrectionFields {
  return {
    word: prefill?.word ?? '',
    field: prefill?.field ?? 'translation',
    suggestion: prefill?.suggestion ?? '',
    comment: prefill?.comment ?? '',
  };
}

type FieldErrors = Record<string, string>;

export function ContributionForm({
  prefill,
  onSuccess,
  onCancel,
}: ContributionFormProps): ReactElement {
  const t = useTranslations('learn.contrib');
  const router = useRouter();

  // Determine initial tab from prefill
  const initialTab: TabId = prefill?.type ?? 'new_word';
  const [tab, setTab] = useState<TabId>(initialTab);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Per-tab field states — seeded from prefill (full payload on resubmit, or
  // word-only when opened from the reader chip).
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
    if (!newWord.word.trim()) errs.word = t('validationRequired');
    else if (newWord.word.trim().length < 2) errs.word = t('validationTooShort', { min: 2 });
    if (!newWord.translation.trim()) errs.translation = t('validationRequired');
    return errs;
  }

  function validateTranslation(): FieldErrors {
    const errs: FieldErrors = {};
    if (!translation.word.trim()) errs.word = t('validationRequired');
    else if (translation.word.trim().length < 2) errs.word = t('validationTooShort', { min: 2 });
    if (!translation.translation.trim()) errs.translation = t('validationRequired');
    return errs;
  }

  function validateCorrection(): FieldErrors {
    const errs: FieldErrors = {};
    if (!correction.word.trim()) errs.word = t('validationRequired');
    else if (correction.word.trim().length < 2) errs.word = t('validationTooShort', { min: 2 });
    if (!correction.suggestion.trim()) errs.suggestion = t('validationRequired');
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
          word: newWord.word.trim(),
          translation: newWord.translation.trim(),
          lang: newWord.lang,
        };
        if (newWord.example.trim()) nw.example = newWord.example.trim();
        payload = nw;
      } else if (tab === 'translation') {
        const tr: ContribPayloadTranslation = {
          burword_id: prefill?.burword_id ?? null,
          word: translation.word.trim(),
          translation: translation.translation.trim(),
          lang: translation.lang,
        };
        payload = tr;
      } else {
        const cr: ContribPayloadCorrection = {
          burword_id: prefill?.burword_id ?? null,
          word: correction.word.trim(),
          field: correction.field,
          suggestion: correction.suggestion.trim(),
        };
        if (correction.comment.trim()) cr.comment = correction.comment.trim();
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
        <Link
          href="/signin"
          className="btn btn-primary"
        >
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
                id="nw-word"
                label={t('fieldWord')}
                placeholder={t('fieldWordPlaceholder')}
                value={newWord.word}
                onChange={(v) => setNewWord((prev) => ({ ...prev, word: v }))}
                error={errors.word}
                required
              />
              <TextareaField
                id="nw-translation"
                label={t('fieldTranslation')}
                placeholder={t('fieldTranslationPlaceholder')}
                value={newWord.translation}
                onChange={(v) => setNewWord((prev) => ({ ...prev, translation: v }))}
                error={errors.translation}
                required
              />
              <LangSelector
                label={t('fieldLang')}
                value={newWord.lang}
                onChange={(v) => setNewWord((prev) => ({ ...prev, lang: v }))}
                ruLabel={t('fieldLangRu')}
                enLabel={t('fieldLangEn')}
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
                id="tr-word"
                label={t('fieldWord')}
                placeholder={t('fieldWordPlaceholder')}
                value={translation.word}
                onChange={(v) => setTranslation((prev) => ({ ...prev, word: v }))}
                error={errors.word}
                required
              />
              <TextareaField
                id="tr-translation"
                label={t('fieldTranslation')}
                placeholder={t('fieldTranslationPlaceholder')}
                value={translation.translation}
                onChange={(v) => setTranslation((prev) => ({ ...prev, translation: v }))}
                error={errors.translation}
                required
              />
              <LangSelector
                label={t('fieldLang')}
                value={translation.lang}
                onChange={(v) => setTranslation((prev) => ({ ...prev, lang: v }))}
                ruLabel={t('fieldLangRu')}
                enLabel={t('fieldLangEn')}
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
              <BurField
                id="cr-word"
                label={t('fieldWord')}
                placeholder={t('fieldWordPlaceholder')}
                value={correction.word}
                onChange={(v) => setCorrection((prev) => ({ ...prev, word: v }))}
                error={errors.word}
                required
              />
              <FieldSelect
                id="cr-field"
                label={t('fieldField')}
                value={correction.field}
                options={[
                  { value: 'translation', label: t('fieldFieldTranslation') },
                  { value: 'example', label: t('fieldFieldExample') },
                  { value: 'other', label: t('fieldFieldOther') },
                ]}
                onChange={(v) =>
                  setCorrection((prev) => ({
                    ...prev,
                    field: v as 'translation' | 'example' | 'other',
                  }))
                }
              />
              <TextareaField
                id="cr-suggestion"
                label={t('fieldSuggestion')}
                placeholder={t('fieldSuggestionPlaceholder')}
                value={correction.suggestion}
                onChange={(v) => setCorrection((prev) => ({ ...prev, suggestion: v }))}
                error={errors.suggestion}
                required
              />
              <TextareaField
                id="cr-comment"
                label={t('fieldComment')}
                placeholder={t('fieldCommentPlaceholder')}
                value={correction.comment}
                onChange={(v) => setCorrection((prev) => ({ ...prev, comment: v }))}
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

interface LangSelectorProps {
  label: string;
  value: ContributionLang;
  onChange: (val: ContributionLang) => void;
  ruLabel: string;
  enLabel: string;
}

function LangSelector({ label, value, onChange, ruLabel, enLabel }: LangSelectorProps): ReactElement {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </legend>
      <div style={{ display: 'flex', gap: 8 }}>
        {(
          [
            ['ru', ruLabel] as const,
            ['en', enLabel] as const,
          ] as [ContributionLang, string][]
        ).map(([v, lbl]) => (
          <label
            key={v}
            className={value === v ? 'chip chip-primary' : 'chip'}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="radio"
              name="contrib-lang"
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              style={{ display: 'none' }}
            />
            {lbl}
          </label>
        ))}
      </div>
    </fieldset>
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
