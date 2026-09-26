import { describe, it, expect } from 'vitest';
import {
  createId,
  normalizeName,
  toLocale,
  parseParticipantRows,
  findDuplicates,
  formatNames,
  filterParticipants,
  sortParticipants,
  computeStats,
  computeProgressSeries,
  buildExportRows,
  buildExportFileName,
  getDrawEligible,
  secureRandom,
  pickRandom,
  shuffle,
  buildReel,
  reelLength,
} from './participants';
import { translations } from '../translations';

const participant = (overrides = {}) => ({
  id: 'p',
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie@example.com',
  checkedIn: false,
  checkedInAt: null,
  absent: false,
  manuallyAdded: false,
  ...overrides,
});

describe('createId', () => {
  it('prefixes and produces distinct values', () => {
    const a = createId('manual');
    const b = createId('manual');
    expect(a).toMatch(/^manual-\d+-[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});

describe('normalizeName', () => {
  it.each([
    ['DUPONT', 'Dupont'],
    ['marie', 'Marie'],
    ['JEAN-PIERRE', 'Jean-Pierre'],
    ["O'BRIEN", "O'Brien"],
    ['d’ARTAGNAN', 'D’Artagnan'],
    ['de la FONTAINE', 'De La Fontaine'],
    ['  élodie  ', 'Élodie'],
    ['anne   marie', 'Anne Marie'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });

  it('returns an empty string for empty values', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName(undefined)).toBe('');
    expect(normalizeName('   ')).toBe('');
  });

  it('accepts non-string values from spreadsheets', () => {
    expect(normalizeName(42)).toBe('42');
  });
});

describe('toLocale', () => {
  it('converts app language codes to BCP 47 tags', () => {
    expect(toLocale('fr_FR')).toBe('fr-FR');
    expect(toLocale('en_US')).toBe('en-US');
  });

  it('falls back to French for Klingon', () => {
    expect(toLocale('tlh_TLH')).toBe('fr-FR');
  });
});

describe('parseParticipantRows', () => {
  it('maps French and English column names', () => {
    const { participants, skipped } = parseParticipantRows(
      [
        { Prénom: 'MARIE', Nom: 'DUPONT', Email: ' marie@example.com ' },
        { 'First Name': 'john', 'Last Name': 'smith', email: 'john@example.com' },
        { Prenom: 'léa', nom: 'martin' },
      ],
      1000
    );
    expect(skipped).toBe(0);
    expect(participants).toEqual([
      participant({ id: 'participant-0-1000', email: 'marie@example.com' }),
      participant({
        id: 'participant-1-1000',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
      }),
      participant({ id: 'participant-2-1000', firstName: 'Léa', lastName: 'Martin', email: '' }),
    ]);
  });

  it('keeps rows with only a first or a last name', () => {
    const { participants } = parseParticipantRows([{ Nom: 'Dupont' }, { Prénom: 'Marie' }]);
    expect(participants).toHaveLength(2);
  });

  it('skips rows without first and last name', () => {
    const { participants, skipped } = parseParticipantRows([
      { Prénom: 'Marie', Nom: 'Dupont' },
      { Email: 'orphan@example.com' },
      { Other: 'x' },
    ]);
    expect(participants).toHaveLength(1);
    expect(skipped).toBe(2);
  });

  it('returns no participants when name columns are not recognized', () => {
    const { participants, skipped } = parseParticipantRows([{ Name: 'Marie Dupont' }]);
    expect(participants).toEqual([]);
    expect(skipped).toBe(1);
  });
});

describe('findDuplicates', () => {
  it('flags repeated names case-insensitively, keeping the first occurrence', () => {
    const list = [
      participant({ id: '1', email: 'a@x.io' }),
      participant({ id: '2', firstName: 'MARIE', lastName: 'dupont', email: 'b@x.io' }),
      participant({ id: '3', firstName: 'Jean', email: 'c@x.io' }),
    ];
    expect(findDuplicates(list).map((p) => p.id)).toEqual(['2']);
  });

  it('flags repeated emails, ignoring empty ones', () => {
    const list = [
      participant({ id: '1', firstName: 'Marie', email: 'Same@x.io' }),
      participant({ id: '2', firstName: 'Jean', email: 'same@x.io' }),
      participant({ id: '3', firstName: 'Léa', email: '' }),
      participant({ id: '4', firstName: 'Paul', email: '' }),
    ];
    expect(findDuplicates(list).map((p) => p.id)).toEqual(['2']);
  });

  it('returns nothing for a clean list', () => {
    expect(
      findDuplicates([
        participant({ id: '1' }),
        participant({ id: '2', firstName: 'Jean', email: '' }),
      ])
    ).toEqual([]);
  });
});

describe('formatNames', () => {
  it('joins names and truncates after the limit', () => {
    const list = ['A', 'B', 'C'].map((firstName) => participant({ firstName, lastName: 'X' }));
    expect(formatNames(list)).toBe('A X, B X, C X');
    expect(formatNames(list, 2)).toBe('A X, B X…');
  });
});

describe('filterParticipants', () => {
  const list = [
    participant({ id: '1', firstName: 'Marie', lastName: 'Dupont', checkedIn: true }),
    participant({ id: '2', firstName: 'Jean', lastName: 'Martin', email: 'jm@corp.io' }),
    participant({ id: '3', firstName: 'Léa', lastName: 'Durand', absent: true }),
  ];
  const ids = (items) => items.map((p) => p.id);

  it('returns everything by default', () => {
    expect(ids(filterParticipants(list))).toEqual(['1', '2', '3']);
  });

  it('filters by status', () => {
    expect(ids(filterParticipants(list, { status: 'checkedIn' }))).toEqual(['1']);
    expect(ids(filterParticipants(list, { status: 'notCheckedIn' }))).toEqual(['2', '3']);
    expect(ids(filterParticipants(list, { status: 'absent' }))).toEqual(['3']);
  });

  it('searches first name, last name and email, case-insensitively', () => {
    expect(ids(filterParticipants(list, { text: 'DU' }))).toEqual(['1', '3']);
    expect(ids(filterParticipants(list, { text: 'corp' }))).toEqual(['2']);
  });

  it('combines status and text filters', () => {
    expect(ids(filterParticipants(list, { status: 'notCheckedIn', text: 'du' }))).toEqual(['3']);
  });
});

describe('sortParticipants', () => {
  const list = [
    participant({ id: 'b', lastName: 'martin', checkedIn: true }),
    participant({ id: 'a', lastName: 'Dupont', manuallyAdded: true }),
    participant({ id: 'c', lastName: 'Durand' }),
  ];
  const ids = (items) => items.map((p) => p.id);

  it('sorts text fields case-insensitively', () => {
    expect(ids(sortParticipants(list, 'lastName'))).toEqual(['a', 'c', 'b']);
    expect(ids(sortParticipants(list, 'lastName', false))).toEqual(['b', 'c', 'a']);
  });

  it('sorts by check-in status and type', () => {
    expect(ids(sortParticipants(list, 'checkedIn', false))[0]).toBe('b');
    expect(ids(sortParticipants(list, 'type', false))[0]).toBe('a');
  });

  it('does not mutate the input', () => {
    const copy = [...list];
    sortParticipants(list, 'lastName');
    expect(list).toEqual(copy);
  });
});

describe('computeStats', () => {
  it('counts total, checked-in and manual participants', () => {
    expect(
      computeStats([
        participant({ checkedIn: true }),
        participant({ manuallyAdded: true, checkedIn: true }),
        participant(),
      ])
    ).toEqual({ total: 3, checkedIn: 2, manual: 1 });
  });
});

describe('computeProgressSeries', () => {
  const at = (minutes) => new Date(Date.UTC(2026, 0, 1, 9, minutes)).toISOString();

  it('returns null when nobody is checked in', () => {
    expect(computeProgressSeries([participant()])).toBeNull();
  });

  it('builds cumulative check-ins and expected totals', () => {
    const series = computeProgressSeries([
      participant({ checkedIn: true, checkedInAt: at(10) }),
      participant({ checkedIn: true, checkedInAt: at(0) }),
      participant(),
      participant({ manuallyAdded: true, checkedIn: true, checkedInAt: at(5) }),
    ]);
    expect(series.checkedIn.map((p) => p.y)).toEqual([1, 2, 3]);
    expect(series.checkedIn[0].x).toEqual(new Date(at(0)));
    // 3 registered at start, +1 when the manual participant checks in, then flat
    expect(series.expected.map((p) => p.y)).toEqual([3, 4, 4]);
    expect(series.expected.at(-1).x).toEqual(new Date(at(10)));
  });
});

describe('buildExportRows', () => {
  it('uses translated headers and values', () => {
    const t = translations.en_US;
    const [row] = buildExportRows(
      [participant({ checkedIn: true, checkedInAt: '2026-01-01T09:00:00.000Z', absent: true })],
      t,
      'en-US'
    );
    expect(Object.keys(row)).toEqual([
      t.columnFirstName,
      t.columnLastName,
      t.columnEmail,
      t.columnType,
      t.columnStatus,
      t.columnCheckedInAt,
      t.columnAbsent,
    ]);
    expect(row[t.columnStatus]).toBe(t.statusCheckedIn);
    expect(row[t.columnType]).toBe(t.typeRegistered);
    expect(row[t.columnAbsent]).toBe(t.absent);
    expect(row[t.columnCheckedInAt]).not.toBe('-');
  });

  it('uses dashes for missing check-in time and absent flag', () => {
    const t = translations.fr_FR;
    const [row] = buildExportRows([participant({ manuallyAdded: true })], t, 'fr-FR');
    expect(row[t.columnCheckedInAt]).toBe('-');
    expect(row[t.columnAbsent]).toBe('-');
    expect(row[t.columnType]).toBe(t.typeManual);
  });
});

describe('buildExportFileName', () => {
  const date = new Date('2026-09-26T10:00:00Z');

  it('prefixes the sanitized event name', () => {
    expect(buildExportFileName('Gala 2026 / Paris', date)).toBe(
      'Gala_2026___Paris_participants_2026-09-26.xlsx'
    );
  });

  it('omits the prefix without event name', () => {
    expect(buildExportFileName('', date)).toBe('participants_2026-09-26.xlsx');
  });
});

describe('getDrawEligible', () => {
  it('keeps checked-in, non-absent participants, registered or manual', () => {
    const list = [
      participant({ id: '1', checkedIn: true }),
      participant({ id: '2', checkedIn: true, manuallyAdded: true }),
      participant({ id: '3', checkedIn: true, absent: true }),
      participant({ id: '4' }),
    ];
    expect(getDrawEligible(list).map((p) => p.id)).toEqual(['1', '2']);
  });
});

describe('secureRandom', () => {
  it('returns numbers in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const value = secureRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('pickRandom', () => {
  it('returns null for an empty list', () => {
    expect(pickRandom([])).toBeNull();
  });

  it('maps the random number to an index', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(pickRandom(items, () => 0)).toBe('a');
    expect(pickRandom(items, () => 0.5)).toBe('c');
    expect(pickRandom(items, () => 0.999999)).toBe('d');
  });

  it('can pick every item', () => {
    const items = ['a', 'b', 'c'];
    const picked = new Set(Array.from({ length: 300 }, () => pickRandom(items)));
    expect(picked).toEqual(new Set(items));
  });
});

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items);
    expect([...shuffled].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('buildReel', () => {
  const people = Array.from({ length: 50 }, (_, i) => participant({ id: `p${i}` }));
  const ids = (items) => items.map((p) => p.id);

  it('uses each participant at most once, winner included', () => {
    const { items } = buildReel(people, people[7], 30);
    expect(items).toHaveLength(30);
    expect(new Set(ids(items)).size).toBe(30);
  });

  it('places the winner with exactly one name after it', () => {
    const { items, winnerIndex } = buildReel(people, people[7], 30);
    expect(items[winnerIndex].id).toBe('p7');
    expect(winnerIndex).toBe(items.length - 2);
  });

  it('is limited by the number of eligible participants', () => {
    const { items, winnerIndex } = buildReel(people.slice(0, 4), people[0], 30);
    expect(ids(items).sort()).toEqual(['p0', 'p1', 'p2', 'p3']);
    expect(items[winnerIndex].id).toBe('p0');
  });

  it('adds placeholders around the winner when too few are eligible', () => {
    expect(buildReel([people[0]], people[0], 30)).toEqual({
      items: [
        expect.objectContaining({ placeholder: true }),
        people[0],
        expect.objectContaining({ placeholder: true }),
      ],
      winnerIndex: 1,
    });
    const two = buildReel(people.slice(0, 2), people[0], 30);
    expect(ids(two.items)).toEqual(['placeholder-before', 'p0', 'p1']);
  });

  it('has one name on each side of the winner without animation', () => {
    const { items, winnerIndex } = buildReel(people, people[3], 3);
    expect(items).toHaveLength(3);
    expect(winnerIndex).toBe(1);
  });
});

describe('reelLength', () => {
  it('scales with the duration within bounds', () => {
    expect(reelLength(2)).toBe(30);
    expect(reelLength(0.1)).toBe(3);
    expect(reelLength(10)).toBe(80);
  });
});
