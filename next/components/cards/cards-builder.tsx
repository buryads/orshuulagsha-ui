'use client';

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { renderShareCard } from '@/components/explain/share-card';
import { AudioButton } from '@/components/marathon/audio-button';
import { getGreetings, type GreetingItem, type GreetingList } from '@/lib/api/greetings';
import { clampName, nameCounter, NAME_LIMIT, pickOccasion } from '@/lib/cards/card-text';

const FILE_NAME = 'buryads-card.png';
const DEFAULT_OCCASION = 'sagaalgan';

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: GreetingList };

const input = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid var(--border-strong)',
  background: 'var(--surface)',
  color: 'var(--text)',
  width: '100%',
} as const;

export function CardsBuilder(): ReactElement {
  const t = useTranslations('cards');
  const locale = useLocale();
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [occasion, setOccasion] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');

  const fetchList = useCallback(() => {
    setLoad({ status: 'loading' });
    getGreetings()
      .then((data) => setLoad({ status: 'ready', data }))
      .catch(() => setLoad({ status: 'error' }));
  }, []);

  useEffect(fetchList, [fetchList]);

  const data = load.status === 'ready' ? load.data : null;
  const occasions = data ? data.occasions.filter((o) => data.items.some((i) => i.occasion === o)) : [];
  const active = data ? pickOccasion(occasions, occasion || null, DEFAULT_OCCASION) : '';
  const items = data ? data.items.filter((i) => i.occasion === active) : [];
  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null;
  const label = (code: string) => (t.has(`occasions.${code}`) ? t(`occasions.${code}`) : code);

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{t('title')}</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('intro')}</p>
      </header>

      {load.status === 'loading' && <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {load.status === 'error' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{t('loadFailed')}</span>
          <button type="button" className="btn btn-secondary" onClick={fetchList}>
            {t('retry')}
          </button>
        </div>
      )}

      {data && occasions.length === 0 && (
        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{t('empty.title')}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('empty.text')}</p>
        </section>
      )}

      {data && occasions.length > 0 && (
        <>
          <div role="group" aria-label={t('occasion')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {occasions.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={active === o}
                className={active === o ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => {
                  setOccasion(o);
                  setSelectedId(null);
                }}
              >
                {label(o)}
              </button>
            ))}
          </div>

          <div role="radiogroup" aria-label={t('phrases')} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item) => (
              <PhraseOption
                key={item.id}
                item={item}
                checked={selected?.id === item.id}
                selectedLabel={t('selected')}
                onSelect={() => setSelectedId(item.id)}
              />
            ))}
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
              {t('to')}
              <input style={input} value={to} onChange={(e) => setTo(clampName(e.target.value))} maxLength={NAME_LIMIT * 2} autoComplete="off" />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textAlign: 'right' }}>{nameCounter(to)}</span>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>
              {t('from')}
              <input style={input} value={from} onChange={(e) => setFrom(clampName(e.target.value))} maxLength={NAME_LIMIT * 2} autoComplete="off" />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textAlign: 'right' }}>{nameCounter(from)}</span>
            </label>
            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('localNote')}</p>
          </section>

          {selected && <Preview item={selected} to={to.trim()} from={from.trim()} locale={locale} />}
        </>
      )}
    </div>
  );
}

function PhraseOption({
  item,
  checked,
  selectedLabel,
  onSelect,
}: {
  item: GreetingItem;
  checked: boolean;
  selectedLabel: string;
  onSelect: () => void;
}): ReactElement {
  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        borderColor: checked ? 'var(--primary)' : 'var(--border)',
        borderWidth: checked ? 2 : 1,
        background: checked ? 'var(--primary-50)' : 'var(--surface)',
      }}
    >
      <input type="radio" name="greeting" checked={checked} onChange={onSelect} aria-label={item.bur} style={{ marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button type="button" onClick={onSelect} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, color: 'var(--primary-900)' }}>{item.bur}</span>
          <span style={{ fontSize: 15 }}>{item.ru}</span>
        </button>
        <div>
          <AudioButton url={item.audio_url} compact />
        </div>
      </div>
      {checked && (
        <span className="chip chip-primary" aria-hidden>
          ✔ {selectedLabel}
        </span>
      )}
    </div>
  );
}

function Preview({ item, to, from, locale }: { item: GreetingItem; to: string; from: string; locale: string }): ReactElement {
  const t = useTranslations('cards');
  const [file, setFile] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState('');
  const [canShare, setCanShare] = useState(false);
  const sharing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const link = typeof window === 'undefined' ? '' : `${window.location.origin}/${locale}/card/${item.id}`;

  useEffect(() => {
    let alive = true;
    setFile(null);
    setFailed(false);
    renderShareCard({
      phrase: item.bur,
      source: null,
      meaning: item.ru,
      points: [],
      words: [],
      moreWords: null,
      wordsTitle: '',
      aiLabel: null,
      warning: null,
    })
      .then((blob) => {
        if (!alive) return;
        setFile(new File([blob], FILE_NAME, { type: 'image/png' }));
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [item.bur, item.ru]);

  useEffect(() => {
    setCanShare(!!file && !!navigator.canShare?.({ files: [file] }));
  }, [file]);

  const say = (msg: string) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2500);
  };

  const download = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_NAME;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const share = async () => {
    if (!file || sharing.current) return;
    sharing.current = true;
    try {
      await navigator.share({ files: [file], title: t('shareTitle'), text: link });
    } catch (err) {
      if (err instanceof TypeError) download();
    } finally {
      sharing.current = false;
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      say(t('linkCopied'));
    } catch {
      say(t('copyManual'));
    }
  };

  const busy = !file && !failed;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('preview')}</h2>
      <div
        style={{
          borderRadius: 20,
          border: '1px solid var(--border)',
          borderTop: '6px solid #0066B3',
          background: '#F5F8FB',
          color: '#1A1C1E',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {to && <p style={{ margin: 0, fontWeight: 700, color: '#5C6470' }}>{`${t('to')}: ${to}`}</p>}
        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.25, color: '#002E54' }}>{item.bur}</p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{item.ru}</p>
        {from && <p style={{ margin: 0, fontWeight: 700, color: '#5C6470' }}>{`${t('from')}: ${from}`}</p>}
        <p style={{ margin: 0, fontWeight: 800, color: '#0066B3' }}>buryads.com</p>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('previewHint')}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {canShare && (
          <button type="button" className="btn btn-primary" onClick={share}>
            {t('send')}
          </button>
        )}
        <button type="button" className={canShare ? 'btn btn-secondary' : 'btn btn-primary'} onClick={download} disabled={!file}>
          {t('download')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={copyLink}>
          {t('copyLink')}
        </button>
        {busy && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('imagePreparing')}</span>}
        <span role="status" aria-live="polite" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {toast}
        </span>
      </div>
      {failed && (
        <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontSize: 14 }}>
          {t('imageFailed')}
        </p>
      )}
    </section>
  );
}
