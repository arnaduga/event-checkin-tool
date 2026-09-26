import { describe, it, expect } from 'vitest';
import { translations } from './translations';

const reference = Object.keys(translations.en_US).sort();

// Sentence fragments around a name may legitimately be empty depending on word order
const MAY_BE_EMPTY = ['confirmCheckOutPrefix', 'confirmCheckOutSuffix'];

describe('translations', () => {
  it.each(Object.keys(translations))('%s defines exactly the same keys as en_US', (lang) => {
    expect(Object.keys(translations[lang]).sort()).toEqual(reference);
  });

  it.each(Object.keys(translations))('%s has no empty strings', (lang) => {
    const empty = Object.entries(translations[lang]).filter(
      ([k, v]) => typeof v !== 'string' || (v === '' && !MAY_BE_EMPTY.includes(k))
    );
    expect(empty).toEqual([]);
  });
});
