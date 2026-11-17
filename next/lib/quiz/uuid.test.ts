import { describe, expect, it } from 'vitest';
import { uuidV4 } from './listen-session';

describe('uuidV4', () => {
  it('produces RFC 4122 version 4 identifiers', () => {
    const id = uuidV4();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(uuidV4()).not.toBe(id);
  });
});
