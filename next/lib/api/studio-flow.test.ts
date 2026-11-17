import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiCall } = vi.hoisted(() => ({ apiCall: vi.fn() }));

vi.mock('./client', () => ({ apiCall }));

import {
  agreeWordRequest,
  answerWordRequest,
  getFlowNext,
  rejectWordRequest,
  touchWordRequest,
  undoRejectWordRequest,
} from './studio-flow';

beforeEach(() => {
  apiCall.mockReset();
});

describe('words flow API', () => {
  it('maps the card key to item_key for the queue', async () => {
    apiCall.mockResolvedValue({
      data: {
        key: 'wr:7',
        kind: 'word_request',
        id: 7,
        query: 'сагаан',
        direction: 'ru2bur',
        demand: 15,
        contexts: ['в песне'],
        suggestion: null,
        moderator_note: null,
      },
      meta: { remaining: 3, from_skipped: false },
    });
    const res = await getFlowNext('words');
    expect(apiCall).toHaveBeenCalledWith('GET', '/api/studio/flow/next', {
      params: { mode: 'words' },
    });
    expect(res.item?.item_key).toBe('wr:7');
    expect(res.item?.id).toBe(7);
    expect(res.item?.mode).toBe('words');
    expect(res.remaining).toBe(3);
  });

  it('returns a null item when the words queue is empty', async () => {
    apiCall.mockResolvedValue({ data: null, meta: { remaining: 0 } });
    const res = await getFlowNext('words');
    expect(res.item).toBeNull();
  });

  it('posts answers to the word request', async () => {
    apiCall.mockResolvedValue({ data: { status: 'answered' } });
    await answerWordRequest(7, { translations: ['сагаан', 'цагаан'], example: 'пример' });
    expect(apiCall).toHaveBeenCalledWith('POST', '/api/studio/word-requests/7/answer', {
      data: { translations: ['сагаан', 'цагаан'], example: 'пример' },
    });
  });

  it('posts agreement with the suggestion id', async () => {
    apiCall.mockResolvedValue({ data: { status: 'answered', confirmations: 2 } });
    await agreeWordRequest(7, 42);
    expect(apiCall).toHaveBeenCalledWith('POST', '/api/studio/word-requests/7/agree', {
      data: { suggestion_id: 42 },
    });
  });

  it('posts rejection and undoes it with DELETE on the same url', async () => {
    apiCall.mockResolvedValue({ data: { status: 'open' } });
    await rejectWordRequest(7, { reason: 'typo', hint: 'правильно' });
    expect(apiCall).toHaveBeenCalledWith('POST', '/api/studio/word-requests/7/reject', {
      data: { reason: 'typo', hint: 'правильно' },
    });
    await undoRejectWordRequest(7);
    expect(apiCall).toHaveBeenLastCalledWith('DELETE', '/api/studio/word-requests/7/reject');
  });

  it('touches the claim', async () => {
    apiCall.mockResolvedValue(undefined);
    await touchWordRequest(7);
    expect(apiCall).toHaveBeenCalledWith('POST', '/api/studio/word-requests/7/touch');
  });
});
