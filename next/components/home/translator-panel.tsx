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

// Empty initial state — no canned demo so we don't fire a wasted translate
// call on first mount. URL `?q=` still hydrates if shared.

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

// Pick the slug of a dictionary entry whose surface form matches what the user
// typed. Used to surface an "Open in dictionary" affordance on the source
// pane only when the term is actually catalogued (id > 0 + slug present).
function pickSourceSlug(
  r: TranslateResponse | null,
  src: string,
): string | undefined {
  if (!r) return undefined;
  const q = src.trim().toLowerCase();
  if (!q) return undefined;
  const buckets = [r.result, r.include, r.match, r.fuzzy];
  for (const bucket of buckets) {
    for (const item of bucket ?? []) {
      if (!item || !item.slug || item.id === 0) continue;
      const name = (item.name ?? '').trim().toLowerCase();
      if (name === q) return item.slug;
    }
  }
  return undefined;
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
  const initQ = sp.get('q') ?? '';

  const [from, setFrom] = useState<FromLang>(initFrom);
  const [to, setTo] = useState<ToLang>(initTo);
  const [src, setSrc] = useState<string>(initQ);
  const [tgt, setTgt] = useState<string>('');
  const [response, setResponse] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token used to ignore stale responses when src changes mid-flight.
  const requestIdRef = useRef(0);
  // Skip the first URL-write effect so we don't overwrite a clean URL on mount.
  const didMountRef = useRef(false);

  const direction: TranslationType | null = useMemo(
    () => pickTranslationType(from, to),
    [from, to],
  );

  const srcSlug = useMemo(() => pickSourceSlug(response, src), [response, src]);

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

  // Debounced translate on src change. Empty input skips the API call via
  // runTranslate's own guard.
  useEffect(() => {
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
    if (src.trim()) params.set('q', src);
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
        srcSlug={srcSlug}
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
