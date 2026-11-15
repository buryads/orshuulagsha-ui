import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'AI',
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://tt.buryads.com'
).replace(/\/$/, '');
const MCP_URL = `${API_BASE}/mcp`;

const CLI_SNIPPET = `claude mcp add --scope user --transport http buryads ${MCP_URL} --header "Authorization: Bearer YOUR_TOKEN"`;
const JSON_SNIPPET = JSON.stringify(
  {
    mcpServers: {
      buryads: {
        type: 'http',
        url: MCP_URL,
        headers: { Authorization: 'Bearer YOUR_TOKEN' },
      },
    },
  },
  null,
  2,
);

function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
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

function AiContent() {
  const t = useTranslations('ai');
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
          {t('subtitle')}
        </p>
      </div>

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
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t('mcpTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {t('mcpWhat')}
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            {t('toolsTitle')}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
            <li>
              <code>translate_word</code> — {t('toolWord')}
            </li>
            <li>
              <code>translate_text</code> — {t('toolText')}
            </li>
            <li>
              <code>lookup_word</code> — {t('toolLookup')}
            </li>
            <li>
              <code>pronounce</code> — {t('toolPronounce')}
            </li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            {t('limitsTitle')}
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
            <li>{t('limitWords')}</li>
            <li>{t('limitTexts')}</li>
            <li>{t('limitTokens')}</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t('connectTitle')}</h3>
          <Snippet title={t('snippetCli')} code={CLI_SNIPPET} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: -4 }}>
            {t('scopeHint')}
          </p>
          <Snippet title={t('snippetJson')} code={JSON_SNIPPET} />
        </div>

        <div>
          <Link href="/profile/mcp" className="btn btn-primary">
            {t('cta')}
          </Link>
        </div>
      </section>
    </div>
  );
}

interface AiPageProps {
  params: { locale: string };
}

export default function AiPage({ params }: AiPageProps) {
  setRequestLocale(params.locale);
  return <AiContent />;
}
