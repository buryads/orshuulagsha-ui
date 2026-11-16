'use client';

import { useRef, useState } from 'react';

interface PostActionsProps {
  text: string;
  copyLabel: string;
  copiedLabel: string;
  copyFailLabel: string;
}

export function PostActions({ text, copyLabel, copiedLabel, copyFailLabel }: PostActionsProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(copiedLabel);
    } catch {
      const node = ref.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setStatus(copyFailLabel);
    }
  };

  return (
    <>
      <pre
        ref={ref}
        className="card"
        style={{ whiteSpace: 'pre-wrap', padding: 18, margin: 0, font: 'inherit', fontSize: 15 }}
      >
        {text}
      </pre>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={copy}>
          {copyLabel}
        </button>
        <span role="status" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {status}
        </span>
      </div>
    </>
  );
}
