// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { Translator, type FromLang, type ToLang } from './translator';
import { TranslationResults } from './translation-results';
import {
  AiTranslateResult,
  AiInlineMeta,
  AiStageText,
  AiInlineError,
} from './ai-translate-result';
import { translateWord } from '@/lib/api/translate';
import { aiTranslate, sendAiTranslateFeedback } from '@/lib/api/ai-translate';
import { getAuthToken } from '@/lib/api/cookies';
import type {
  AiTranslateResponse,
  TranslateResponse,
  TranslationType,
} from '@/lib/api/types';
import { isNoTranslation, splitEnumerated, splitRemark } from './translation-text';

const AI_ENABLED_STORAGE_KEY = 'ai-translate-enabled';
const AI_STAGE_INTERVAL_MS = 1500;
// Debounce before an AI-translate request auto-fires while typing. Longer
// than the dictionary's 400ms — each AI call costs money and eats into the
// per-day limit. Enter (no Shift) still submits immediately (see
// `handleTranslatorKeyDown`).
const AI_DEBOUNCE_MS = 1200;
// Below this length an AI request is almost certainly not useful yet — don't
// fire on the first keystroke or two.
const AI_MIN_LENGTH = 2;

function AiToggleSwitch({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
}): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        borderRadius: 999,
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        background: checked ? 'var(--primary)' : 'var(--surface-2)',
        transition: 'background-color 0.15s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  );
}

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

// Pick the slug of the Buryat dictionary entry that backs the translation
// shown on the right pane. Only meaningful when target language is Buryat —
// the detail page (`/words/[slug]`) currently resolves Bur slugs only.
//
// Strategy: scan the response buckets for a Ruword item whose surface form
// equals the typed source text; among its linked `bur_words` pick one whose
// name matches the rendered target text, falling back to the first entry
// with a slug. Synthetic id == 0 fallback rows are skipped.
function pickTargetBurSlug(
  r: TranslateResponse | null,
  src: string,
  tgt: string,
): string | undefined {
  if (!r) return undefined;
  const qSrc = src.trim().toLowerCase();
  const qTgt = tgt.trim().toLowerCase();
  if (!qSrc) return undefined;
  const buckets = [r.result, r.include, r.match, r.fuzzy];
  for (const bucket of buckets) {
    for (const item of bucket ?? []) {
      if (!item || item.id === 0) continue;
      const name = (item.name ?? '').trim().toLowerCase();
      if (name !== qSrc) continue;
      const burs = item.bur_words ?? [];
      if (burs.length === 0) continue;
      if (qTgt) {
        const exact = burs.find(
          (b) => b.slug && (b.name ?? '').trim().toLowerCase() === qTgt,
        );
        if (exact?.slug) return exact.slug;
      }
      const firstWithSlug = burs.find((b) => b.slug);
      if (firstWithSlug?.slug) return firstWithSlug.slug;
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

  // AI-translate mode — toggle beside the form (Task 12). Off by default;
  // gated on being signed in and restored from localStorage once mounted.
  const [aiEnabled, setAiEnabled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [showSignInCta, setShowSignInCta] = useState(false);
  const [aiResult, setAiResult] = useState<AiTranslateResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErrorKey, setAiErrorKey] = useState<string | null>(null);
  const [aiStage, setAiStage] = useState<0 | 1 | 2>(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token used to ignore stale responses when src changes mid-flight.
  const requestIdRef = useRef(0);
  const aiRequestIdRef = useRef(0);
  // Last trimmed text an AI request was fired for — dedupes accidental
  // re-submits of unchanged text (Enter mashing, double button clicks).
  const lastAiQueryRef = useRef<string | null>(null);
  // Skip the first URL-write effect so we don't overwrite a clean URL on mount.
  const didMountRef = useRef(false);

  const direction: TranslationType | null = useMemo(
    () => pickTranslationType(from, to),
    [from, to],
  );

  // Show the dictionary affordance only on the Bur target pane — Ru detail
  // pages aren't supported yet, so a button on the right side in bur2ru mode
  // would lead to a broken route.
  const tgtSlug = useMemo(
    () => (to === 'bur' ? pickTargetBurSlug(response, src, tgt) : undefined),
    [response, src, tgt, to],
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

  // Detect sign-in state once mounted (mirrors header.tsx's pattern) and
  // restore the AI toggle from localStorage — but only for signed-in users,
  // so a stale "on" flag from a previous session never auto-enables for a guest.
  useEffect(() => {
    const isSignedIn = Boolean(getAuthToken());
    setSignedIn(isSignedIn);
    if (!isSignedIn) return;
    try {
      setAiEnabled(localStorage.getItem(AI_ENABLED_STORAGE_KEY) === 'true');
    } catch {
      // localStorage unavailable — keep default off
    }
  }, []);

  const handleToggleAi = useCallback(() => {
    if (!signedIn) {
      setShowSignInCta(true);
      return;
    }
    setShowSignInCta(false);
    setAiEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AI_ENABLED_STORAGE_KEY, String(next));
      } catch {
        // ignore — toggle still works for this session
      }
      return next;
    });
  }, [signedIn]);

  const runAiTranslate = useCallback(async (value: string, type: TranslationType) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setAiResult(null);
      setAiErrorKey(null);
      setTgt('');
      return;
    }
    const reqId = ++aiRequestIdRef.current;
    setAiLoading(true);
    setAiErrorKey(null);
    try {
      const result = await aiTranslate(trimmed, type);
      if (reqId !== aiRequestIdRef.current) return;
      setAiResult(result);
      // Feeds the right output panel (via `tgt`) and the speak/copy toolbar
      // there, same as the dictionary path does with its own picked result.
      setTgt(result.translation);
    } catch (err: unknown) {
      if (reqId !== aiRequestIdRef.current) return;
      setAiResult(null);
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setAiErrorKey('limitReached');
      } else if (axios.isAxiosError(err) && err.response?.status === 422) {
        setAiErrorKey('errors.unrecognized');
      } else {
        setAiErrorKey('errors.generic');
      }
    } finally {
      if (reqId === aiRequestIdRef.current) setAiLoading(false);
    }
  }, []);

  // Cosmetic stage cycling while an AI request is in flight — purely visual,
  // does not reflect real backend progress.
  useEffect(() => {
    if (!aiLoading) {
      setAiStage(0);
      return;
    }
    const id = setInterval(() => {
      setAiStage((s) => ((s + 1) % 3) as 0 | 1 | 2);
    }, AI_STAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [aiLoading]);

  const handleAiFeedback = useCallback(
    async (helpful: boolean, suggestion?: string) => {
      if (!aiResult) return;
      await sendAiTranslateFeedback(aiResult.id, helpful, suggestion);
    },
    [aiResult],
  );

  // The only thing allowed to fire aiTranslate — from the auto-translate
  // debounce below or from Enter. Cost guards: minimum length, and dedup on
  // identical trimmed text (re-submitting text a request is already in
  // flight for, or already succeeded for, is a no-op — a failed request may
  // be retried with the same text).
  const submitAiTranslate = useCallback(() => {
    if (!direction || !aiEnabled || !signedIn) return;
    const trimmed = src.trim();
    if (trimmed.length < AI_MIN_LENGTH) return;
    const sameAsLast = trimmed === lastAiQueryRef.current;
    if (sameAsLast && (aiLoading || (aiResult && !aiErrorKey))) return;
    lastAiQueryRef.current = trimmed;
    void runAiTranslate(trimmed, direction);
  }, [direction, aiEnabled, signedIn, src, aiLoading, aiResult, aiErrorKey, runAiTranslate]);

  // Auto-translate in AI mode after typing pauses — mirrors the dictionary's
  // debounce but at a longer interval (AI_DEBOUNCE_MS) since each call costs
  // money and counts against the per-day limit. `submitAiTranslate`'s dedup
  // guard makes this a no-op when the text hasn't actually changed (e.g.
  // right after an Enter-triggered submit fires this same debounce).
  useEffect(() => {
    if (!aiEnabled || !signedIn || !direction) return;
    const id = setTimeout(() => {
      submitAiTranslate();
    }, AI_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [src, direction, aiEnabled, signedIn, submitAiTranslate]);

  // A new direction (language swap) invalidates the dedupe cache — same text
  // translated the other way is a different request.
  useEffect(() => {
    lastAiQueryRef.current = null;
  }, [direction]);

  // Enter (without Shift) inside the source textarea submits the AI request
  // while AI mode is on; Shift+Enter still inserts a newline. Attached on the
  // wrapping div rather than inside `Translator` — the keydown bubbles up
  // from the textarea, so no change to `translator.tsx` is needed.
  const handleTranslatorKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (!aiEnabled || !signedIn) return;
      if ((e.target as HTMLElement).tagName !== 'TEXTAREA') return;
      e.preventDefault();
      submitAiTranslate();
    },
    [aiEnabled, signedIn, submitAiTranslate],
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
  // runTranslate's own guard. Suppressed entirely in AI mode — AI mode owns
  // the right panel, and firing the legacy dictionary lookup there wastes a
  // request and used to leak its own crappy AI-fallback text into the right
  // pane, competing with the real AI result.
  useEffect(() => {
    if (!direction || (aiEnabled && signedIn)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate(src, direction);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [src, direction, runTranslate, aiEnabled, signedIn]);

  const handleCommit = useCallback(() => {
    if (!direction || (aiEnabled && signedIn)) return;
    void runTranslate(src, direction);
  }, [direction, runTranslate, src, aiEnabled, signedIn]);

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

  const tAi = useTranslations('aiTranslate');

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <AiToggleSwitch
          checked={aiEnabled}
          onClick={handleToggleAi}
          label={tAi('toggleLabel')}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="ai" size={14} />
          {tAi('toggleLabel')}
        </span>
        {showSignInCta && !signedIn && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {tAi('signInCta')}{' '}
            <Link
              href="/signin"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              →
            </Link>
          </span>
        )}
      </div>

      <div onKeyDown={handleTranslatorKeyDown}>
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
          tgtSlug={aiEnabled && signedIn ? undefined : tgtSlug}
          targetOverride={
            aiEnabled && signedIn
              ? aiLoading
                ? <AiStageText stage={aiStage} />
                : aiErrorKey
                  ? <AiInlineError messageKey={aiErrorKey} />
                  : undefined
              : undefined
          }
          targetMeta={
            aiEnabled && signedIn && !aiLoading && !aiErrorKey && aiResult
              ? <AiInlineMeta data={aiResult} />
              : undefined
          }
        />
      </div>

      {aiEnabled && signedIn ? (
        !aiLoading && !aiErrorKey && aiResult && (
          <AiTranslateResult data={aiResult} onFeedback={handleAiFeedback} />
        )
      ) : (
        <TranslationResults
          response={response}
          loading={loading}
          src={src}
          tgt={tgt}
          direction={direction ?? 'ru2bur'}
          error={error}
        />
      )}
    </>
  );
}
