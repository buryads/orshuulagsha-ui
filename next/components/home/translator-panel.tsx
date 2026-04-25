// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Translator, type FromLang, type ToLang } from './translator';
import { TranslationResults } from './translation-results';
import { translateWord } from '@/lib/api/translate';
import type { TranslateResponse, TranslationType } from '@/lib/api/types';
import { isNoTranslation, splitEnumerated, splitRemark } from './translation-text';

const VALID_FROM: ReadonlySet<FromLang> = new Set(['ru', 'bur', 'en', 'mn', 'auto']);
const VALID_TO: ReadonlySet<ToLang> = new Set(['ru', 'bur']);

function parseFrom(v: string | null): FromLang | null {
  return v && VALID_FROM.has(v as FromLang) ? (v as FromLang) : null;
}
function parseTo(v: string | null): ToLang | null {
  return v && VALID_TO.has(v as ToLang) ? (v as ToLang) : null;
}

const INITIAL_DEMO_SRC = 'Здравствуйте, как дела?';
const INITIAL_DEMO_TGT = 'Сайн байна, юу һонин бэ?';

function firstUsefulTranslation(items: TranslateResponse['result']): string | undefined {
  for (const item of items) {
    for (const tr of item.translations ?? []) {
      if (isNoTranslation(tr.name)) continue;
      // For enumerated AI lists ("1) X; 2) Y") show only the first variant in
      // the right pane; remaining variants surface as separate dictionary cards.
      const { main, remark } = splitRemark(tr.name);
      const pieces = splitEnumerated(main);
      if (pieces) return remark ? `${pieces[0]} (${remark})` : pieces[0];
      return tr.name;
    }
  }
  return undefined;
}

function pickPrimaryTranslation(r: TranslateResponse): string | undefined {
  return (
    firstUsefulTranslation(r.result) ??
    firstUsefulTranslation(r.match) ??
    firstUsefulTranslation(r.fuzzy) ??
    undefined
  );
}

function pickTranslationType(from: FromLang, to: ToLang): TranslationType | null {
  if (to === 'bur') {
    if (from === 'ru' || from === 'auto') return 'ru2bur';
    return null; // 'en' / 'mn' / 'bur' → 'bur' is unsupported
  }
  // to === 'ru'
  if (from === 'bur' || from === 'auto') return 'bur2ru';
  return null; // 'en' / 'mn' / 'ru' → 'ru' is unsupported
}

export function TranslatorPanel(): ReactElement {
  // Hydrate from URL query (?q=&from=&to=). Falls back to canned demo when
  // none of the params are present so the landing page still has content.
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initFrom = parseFrom(sp.get('from')) ?? 'ru';
  const initTo = parseTo(sp.get('to')) ?? 'bur';
  const initQ = sp.get('q');
  const initSrc = initQ ?? INITIAL_DEMO_SRC;
  const initTgt = initQ == null ? INITIAL_DEMO_TGT : '';

  const [from, setFrom] = useState<FromLang>(initFrom);
  const [to, setTo] = useState<ToLang>(initTo);
  const [src, setSrc] = useState<string>(initSrc);
  const [tgt, setTgt] = useState<string>(initTgt);
  const [response, setResponse] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token used to ignore stale responses when src changes mid-flight.
  const requestIdRef = useRef(0);
  // Skip the very first auto-translate call when the textarea still holds the
  // canned demo string — keeps curated `tgt` visible and avoids a wasted API hit.
  const isInitial = useRef(initQ == null);
  // Skip the first URL-write effect so we don't overwrite a clean URL with
  // demo defaults on mount. Subsequent state changes will sync.
  const didMountRef = useRef(false);

  const direction: TranslationType | null = useMemo(
    () => pickTranslationType(from, to),
    [from, to],
  );

  const runTranslate = useCallback(
    async (value: string, type: TranslationType) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResponse(null);
        setError(null);
        return;
      }
      const reqId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const result = await translateWord(type, value);
        if (reqId !== requestIdRef.current) return;
        setResponse(result);
        const picked = pickPrimaryTranslation(result);
        setTgt(picked ?? '');
      } catch {
        if (reqId !== requestIdRef.current) return;
        setError('Не удалось получить перевод');
        // Keep prior `tgt` visible so the UI doesn't blank out on transient errors.
      } finally {
        if (reqId === requestIdRef.current) setLoading(false);
      }
    },
    [],
  );

  const swap = useCallback(() => {
    // FROM chips were removed, so `from` is always 'ru' or 'bur' (a valid
    // ToLang). Symmetric flip: from↔to + src↔tgt with service remarks stripped.
    const newFrom: FromLang = to;
    const newTo: ToLang = from === 'bur' || from === 'ru' ? from : to === 'bur' ? 'ru' : 'bur';
    setFrom(newFrom);
    setTo(newTo);
    setSrc(splitRemark(tgt).main);
    setTgt(splitRemark(src).main);
  }, [from, to, src, tgt]);

  // Explicit "translate INTO X" handler. Sets `to` directly + pairs `from`
  // with the opposite, then swaps src/tgt so the input language matches the
  // new direction.
  const chooseTo = useCallback(
    (target: ToLang) => {
      if (target === to) return;
      const newFrom: FromLang = target === 'bur' ? 'ru' : 'bur';
      setFrom(newFrom);
      setTo(target);
      setSrc(splitRemark(tgt).main);
      setTgt(splitRemark(src).main);
    },
    [to, src, tgt],
  );

  // Debounced translate on src change. Skips the first effect run when the
  // textarea still holds the canned demo string so the curated `tgt` remains.
  useEffect(() => {
    if (isInitial.current && src === INITIAL_DEMO_SRC) {
      isInitial.current = false;
      return;
    }
    isInitial.current = false;
    if (!direction) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate(src, direction);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [src, direction, runTranslate]);

  const handleCommit = useCallback(() => {
    if (!direction) return;
    void runTranslate(src, direction);
  }, [direction, runTranslate, src]);

  // Mirror src/from/to into the URL so the page is shareable and back/forward
  // navigation restores the translator state. Skips first run to avoid
  // clobbering a clean URL on mount with the canned demo.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const params = new URLSearchParams();
    const trimmed = src.trim();
    if (trimmed && trimmed !== INITIAL_DEMO_SRC) params.set('q', src);
    params.set('from', from);
    params.set('to', to);
    const qs = params.toString();
    const current = sp.toString();
    if (qs === current) return;
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [src, from, to, pathname, router, sp]);

  return (
    <>
      <Translator
        from={from}
        to={to}
        setTo={chooseTo}
        src={src}
        setSrc={setSrc}
        tgt={tgt}
        loading={loading}
        onSwap={swap}
        onCommit={handleCommit}
      />
      <TranslationResults
        response={response}
        loading={loading}
        src={src}
        tgt={tgt}
        direction={direction ?? 'ru2bur'}
        error={error}
      />
    </>
  );
}
