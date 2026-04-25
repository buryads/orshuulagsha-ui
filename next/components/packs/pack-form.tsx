// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import * as user from '@/lib/api/user';
import type { Pack } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

interface PackFormProps {
  initial?: Pack;
  mode: 'create' | 'edit';
}

export function PackForm({ initial, mode }: PackFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isPrivate, setIsPrivate] = useState(Boolean(initial?.is_private));
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Название обязательно');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'edit' && initial) {
        const updated = await user.updatePack(initial.id, {
          name: name.trim(),
          description: description.trim(),
          is_private: isPrivate,
        });
        router.push(`/packs/${updated.slug}`);
        router.refresh();
      } else {
        await user.createPack({
          name: name.trim(),
          description: description.trim(),
          is_private: isPrivate,
        });
        router.push('/packs');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setError('Не удалось сохранить пакет');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm('Удалить пакет? Это действие необратимо.')) return;

    setDeleting(true);
    try {
      await user.deletePack(initial.id);
      router.push('/packs');
      router.refresh();
    } catch (e) {
      console.error(e);
      setError('Не удалось удалить пакет');
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        maxWidth: 640,
      }}
    >
      <Field label="Название пакета">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting || deleting}
          style={inputStyle}
          maxLength={120}
          required
        />
      </Field>

      <Field label="Описание">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting || deleting}
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
          maxLength={1000}
        />
      </Field>

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          disabled={submitting || deleting}
          style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
        />
        Приватный пакет
      </label>

      {error ? (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: 'var(--tertiary-soft)',
            color: 'var(--tertiary-700)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || deleting}
        >
          <Icon name="check" size={16} />
          {submitting
            ? 'Сохраняем...'
            : mode === 'edit'
              ? 'Сохранить'
              : 'Создать'}
        </button>

        {mode === 'edit' ? (
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary"
            style={{ color: 'var(--tertiary-700)' }}
            disabled={submitting || deleting}
          >
            <Icon name="x" size={16} />
            {deleting ? 'Удаляем...' : 'Удалить пакет'}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--r-md)',
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};
