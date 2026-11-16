import { describe, expect, it } from 'vitest';
import { isPlainShortcut, isTypingTarget } from './shortcuts';

describe('isTypingTarget', () => {
  it('detects text fields', () => {
    expect(isTypingTarget({ tagName: 'INPUT', type: 'text' })).toBe(true);
    expect(isTypingTarget({ tagName: 'input' })).toBe(true);
    expect(isTypingTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTypingTarget({ tagName: 'SELECT' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('ignores buttons, checkboxes and plain elements', () => {
    expect(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' })).toBe(false);
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false);
    expect(isTypingTarget({ tagName: 'DIV' })).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe('isPlainShortcut', () => {
  it('rejects modifiers and typing targets', () => {
    expect(isPlainShortcut({ key: 'j', target: null })).toBe(true);
    expect(isPlainShortcut({ key: 'j', ctrlKey: true, target: null })).toBe(false);
    expect(isPlainShortcut({ key: 'j', target: { tagName: 'INPUT', type: 'search' } as unknown as EventTarget })).toBe(false);
  });
});
