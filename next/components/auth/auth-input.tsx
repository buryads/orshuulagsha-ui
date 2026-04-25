'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string | null;
  rightSlot?: ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ label, error, rightSlot, style, ...rest }, ref) {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
        <div style={{ position: 'relative', display: 'flex' }}>
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            style={{
              width: '100%',
              height: 44,
              padding: rightSlot ? '0 44px 0 14px' : '0 14px',
              borderRadius: 'var(--r-md)',
              border: `1px solid ${
                hasError ? 'var(--tertiary)' : 'var(--border)'
              }`,
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
              transition:
                'border-color 0.15s ease, box-shadow 0.15s ease',
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(0, 102, 179, 0.15)';
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = hasError
                ? 'var(--tertiary)'
                : 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              rest.onBlur?.(e);
            }}
            {...rest}
          />
          {rightSlot ? (
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightSlot}
            </div>
          ) : null}
        </div>
        {hasError ? (
          <span
            id={errorId}
            role="alert"
            style={{
              fontSize: 12,
              color: 'var(--tertiary-700)',
              fontWeight: 500,
            }}
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);
