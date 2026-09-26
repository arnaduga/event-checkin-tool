import { describe, it, expect, vi, afterEach } from 'vitest';
import { readJSON, writeJSON, writeText, removeKey } from './storage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storage', () => {
  it('round-trips JSON values', () => {
    writeJSON('k', { a: 1 });
    expect(readJSON('k', null)).toEqual({ a: 1 });
  });

  it('returns the fallback for missing keys', () => {
    expect(readJSON('missing', [])).toEqual([]);
  });

  it('returns the fallback for invalid JSON', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('broken', '{not json');
    expect(readJSON('broken', 'fallback')).toBe('fallback');
  });

  it('writes raw text and removes keys', () => {
    writeText('text', '2026-09-26T10:00:00.000Z');
    expect(localStorage.getItem('text')).toBe('2026-09-26T10:00:00.000Z');
    removeKey('text');
    expect(localStorage.getItem('text')).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => writeJSON('k', 1)).not.toThrow();
    expect(readJSON('k', 'fallback')).toBe('fallback');
  });
});
