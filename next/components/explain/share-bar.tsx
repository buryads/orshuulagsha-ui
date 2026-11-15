'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ExplainResponse } from '@/lib/api/types';
import { renderShareCard, shareCardLimits, type ShareCardData } from './share-card';

const FILE_NAME = 'buryads-explain.png';

export function ShareBar({ result, source }: { result: ExplainResponse; source: string }) {
  const t = useTranslations('explain');
  const [file, setFile] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const sharing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let alive = true;
    const r = result;
    const tag = (code: string) => (t.has(`tags.${code}`) ? t(`tags.${code}`) : code);
    const words = r.words.slice(0, shareCardLimits.words).map((w) => {
      const reading = w.readings[0];
      return {
        surface: w.surface,
        detail: reading ? [reading.lemma, ...reading.tags.map(tag)].join(' · ') : w.meanings.join('; '),
      };
    });
    const hidden = r.words.length - words.length + r.omitted;
    const meaning = r.ai_status === 'ok' ? (r.explanation_meaning ?? r.explanation) : null;
    const data: ShareCardData = {
      phrase: (r.from === 'bur' ? source : (r.phrase ?? t('phraseFailed'))),
      source: r.from === 'bur' ? null : source,
      meaning: meaning ?? null,
      points: r.ai_status === 'ok' ? (r.explanation_points ?? []).slice(0, shareCardLimits.points) : [],
      words,
      moreWords: hidden > 0 ? t('more', { n: hidden }) : null,
      wordsTitle: t('words'),
      aiLabel: r.ai_status === 'ok' || r.from !== 'bur' ? t('aiBeta') : null,
      warning: r.reliability === 'low' ? t('lowReliability') : null,
    };
    setFile(null);
    setFailed(false);
    renderShareCard(data)
      .then((blob) => alive && setFile(new File([blob], FILE_NAME, { type: 'image/png' })))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [result, source, t]);

  useEffect(() => {
    setCanCopy(typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write);
  }, []);

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
    if (!file) return;
    if (sharing.current) return;
    sharing.current = true;
    try {
      await navigator.share({
        files: [file],
        title: t('shareTitle'),
        text: window.location.href,
      });
    } catch (err) {
      if (err instanceof TypeError) download();
    } finally {
      sharing.current = false;
    }
  };

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': Promise.resolve(file) })]);
      say(t('copied'));
    } catch {
      download();
      say(t('copyFailed'));
    }
  };

  const busy = !file && !failed;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {canShare && (
        <button type="button" className="btn btn-primary" onClick={share} disabled={busy}>
          {t('share')}
        </button>
      )}
      {canCopy && (
        <button type="button" className={canShare ? 'btn btn-secondary' : 'btn btn-primary'} onClick={copy} disabled={!file}>
          {t('copyImage')}
        </button>
      )}
      <button
        type="button"
        className={canShare || canCopy ? 'btn btn-secondary' : 'btn btn-primary'}
        onClick={download}
        disabled={!file}
      >
        {t('downloadImage')}
      </button>
      {busy && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('imagePreparing')}</span>}
      {failed && (
        <span role="alert" style={{ fontSize: 13, color: 'var(--tertiary-700)' }}>
          {t('imageFailed')}
        </span>
      )}
      <span role="status" aria-live="polite" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {toast}
      </span>
    </div>
  );
}
