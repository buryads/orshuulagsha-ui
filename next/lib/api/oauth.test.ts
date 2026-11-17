import { describe, expect, it } from 'vitest';
import { buildOAuthRedirectUrl } from './oauth';

describe('buildOAuthRedirectUrl', () => {
  it('omits email_opt_in by default', () => {
    expect(buildOAuthRedirectUrl('https://api.example.com/', 'google', 'ru', 'abc')).toBe(
      'https://api.example.com/api/auth/google/redirect?locale=ru&challenge=abc',
    );
  });

  it('appends email_opt_in=1 when opted in', () => {
    expect(buildOAuthRedirectUrl('https://api.example.com', 'apple', 'en', 'abc', true)).toBe(
      'https://api.example.com/api/auth/apple/redirect?locale=en&challenge=abc&email_opt_in=1',
    );
  });
});
