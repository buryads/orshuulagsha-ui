'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { AuthInput } from '@/components/auth/auth-input';
import { getAuthToken } from '@/lib/api/cookies';
import * as mcp from '@/lib/api/mcp-tokens';
import type { McpToken, McpTokenCreated } from '@/lib/api/types';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://tt.buryads.com'
).replace(/\/$/, '');
const MCP_URL = `${API_BASE}/mcp`;
const NAME_MAX = 60;
const PLACEHOLDER = '<token>';

function CopyButton({ text, label }: { text: string; label: string }) {
  const t = useTranslations('mcp');
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={copy}
      aria-label={label}
      style={{ padding: '6px 12px', fontSize: 13 }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
        <CopyButton text={code} label={title} />
      </div>
      <pre
        style={{
          margin: 0,
          padding: 12,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          fontSize: 13,
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function McpTokens() {
  const t = useTranslations('mcp');
  const locale = useLocale();
  const router = useRouter();

  const [tokens, setTokens] = useState<McpToken[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<McpTokenCreated | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleString(locale === 'bur' ? 'ru' : locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  );

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      setTokens(await mcp.listMcpTokens());
    } catch (e) {
      console.error(e);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace('/signin');
      return;
    }
    load();
  }, [load, router]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await mcp.createMcpToken(trimmed);
      setCreated(res);
      setName('');
      await load();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setCreateError(t('errors.limit'));
      } else {
        setCreateError(t('errors.create'));
      }
    } finally {
      setCreating(false);
    }
  }

  async function onRevoke(token: McpToken) {
    if (!window.confirm(t('confirmRevoke', { name: token.name }))) return;
    setRevokingId(token.id);
    try {
      await mcp.revokeMcpToken(token.id);
      if (created?.id === token.id) setCreated(null);
      await load();
    } catch (err) {
      console.error(err);
      window.alert(t('errors.revoke'));
    } finally {
      setRevokingId(null);
    }
  }

  const shownToken = created?.token ?? PLACEHOLDER;
  const cliSnippet = `claude mcp add --transport http buryads ${MCP_URL} --header "Authorization: Bearer ${shownToken}"`;
  const jsonSnippet = JSON.stringify(
    {
      mcpServers: {
        buryads: {
          type: 'http',
          url: MCP_URL,
          headers: { Authorization: `Bearer ${shownToken}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <div
      className="container fade-up"
      style={{
        paddingTop: 32,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 800,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>
          {t('intro')}
        </p>
      </div>

      <section className="card" style={{ padding: 20 }}>
        <form
          onSubmit={onCreate}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <AuthInput
            label={t('nameLabel')}
            placeholder={t('namePlaceholder')}
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            error={createError}
          />
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !name.trim()}
            >
              <Icon name={creating ? 'loader' : 'plus'} size={16} />
              {creating ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </section>

      {created && (
        <section
          role="status"
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            border: '1px solid var(--primary)',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {t('createdTitle', { name: created.name })}
          </h2>
          <p style={{ color: 'var(--tertiary-700)', fontSize: 14 }}>
            {t('createdWarning')}
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code
              style={{
                flex: 1,
                padding: 12,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontSize: 13,
                wordBreak: 'break-all',
              }}
            >
              {created.token}
            </code>
            <CopyButton text={created.token} label={t('copyToken')} />
          </div>
          <div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCreated(null)}
            >
              {t('dismiss')}
            </button>
          </div>
        </section>
      )}

      <section className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          {t('listTitle')}
        </h2>
        {loadError ? (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--tertiary-700)',
            }}
          >
            {t('errors.load')}
            <button type="button" className="btn btn-secondary" onClick={load}>
              {t('retry')}
            </button>
          </div>
        ) : tokens === null ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
        ) : tokens.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t('empty')}</p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {tokens.map((tok) => (
              <li
                key={tok.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{tok.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {t('createdAt', { date: formatDate(tok.created_at) })}
                    {' · '}
                    {tok.last_used_at
                      ? t('lastUsed', { date: formatDate(tok.last_used_at) })
                      : t('neverUsed')}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onRevoke(tok)}
                  disabled={revokingId === tok.id}
                  aria-label={t('revokeAria', { name: tok.name })}
                  style={{ padding: '6px 12px', fontSize: 13 }}
                >
                  <Icon name="trash" size={14} />
                  {t('revoke')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="card"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {t('connectTitle')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {t('connectHint')}
          </p>
        </div>
        <Snippet title={t('snippetCli')} code={cliSnippet} />
        <Snippet title={t('snippetJson')} code={jsonSnippet} />
      </section>
    </div>
  );
}
