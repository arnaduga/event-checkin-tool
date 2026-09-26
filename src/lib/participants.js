// Pure participant logic, kept free of React so it can be unit tested.

const FIRST_NAME_COLUMNS = ['Prénom', 'First Name', 'Prenom', 'prénom'];
const LAST_NAME_COLUMNS = ['Nom', 'Last Name', 'nom'];
const EMAIL_COLUMNS = ['Email', 'email'];

const pickColumn = (row, columns) => {
  for (const column of columns) {
    if (row[column]) return row[column];
  }
  return '';
};

// Unique identifier such as manual-1727344800000-k3j9x2
export const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Normalize name: lowercase, then capitalize the first letter of each part
// (separated by spaces, hyphens or apostrophes), e.g. JEAN-PIERRE -> Jean-Pierre
export const normalizeName = (name) => {
  if (!name) return '';
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s\-'’])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
};

// Convert an app language code (fr_FR) to a BCP 47 tag usable by Intl (fr-FR).
// Klingon is not supported by Intl, so it falls back to French formatting.
export const toLocale = (languageValue) =>
  languageValue === 'tlh_TLH' ? 'fr-FR' : languageValue.replace('_', '-');

// Turn spreadsheet rows (as returned by XLSX.utils.sheet_to_json) into participants.
// Rows without first and last name are skipped.
export const parseParticipantRows = (rows, now = Date.now()) => {
  const participants = rows
    .map((row, index) => ({
      id: `participant-${index}-${now}`,
      firstName: normalizeName(pickColumn(row, FIRST_NAME_COLUMNS)),
      lastName: normalizeName(pickColumn(row, LAST_NAME_COLUMNS)),
      email: String(pickColumn(row, EMAIL_COLUMNS)).trim(),
      checkedIn: false,
      checkedInAt: null,
      absent: false,
      manuallyAdded: false,
    }))
    .filter((p) => p.firstName || p.lastName);
  return { participants, skipped: rows.length - participants.length };
};

// Participants that look like a duplicate of an earlier one in the list: same first and
// last name (case-insensitive), or same email address. The first occurrence is not returned.
export const findDuplicates = (participants) => {
  const seenNames = new Set();
  const seenEmails = new Set();
  const duplicates = [];
  for (const p of participants) {
    const nameKey = `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}`;
    const emailKey = p.email.toLowerCase();
    if (seenNames.has(nameKey) || (emailKey && seenEmails.has(emailKey))) {
      duplicates.push(p);
    }
    seenNames.add(nameKey);
    if (emailKey) seenEmails.add(emailKey);
  }
  return duplicates;
};

// "Marie Dupont, Jean Martin…" limited to `max` names
export const formatNames = (participants, max = 5) => {
  const names = participants.slice(0, max).map((p) => `${p.firstName} ${p.lastName}`.trim());
  return names.join(', ') + (participants.length > max ? '…' : '');
};

export const filterParticipants = (participants, { status = 'all', text = '' } = {}) => {
  let filtered = participants;

  if (status === 'checkedIn') {
    filtered = filtered.filter((p) => p.checkedIn);
  } else if (status === 'notCheckedIn') {
    filtered = filtered.filter((p) => !p.checkedIn);
  } else if (status === 'absent') {
    filtered = filtered.filter((p) => p.absent);
  }

  if (text) {
    const lowerFilter = text.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.firstName.toLowerCase().includes(lowerFilter) ||
        p.lastName.toLowerCase().includes(lowerFilter) ||
        p.email.toLowerCase().includes(lowerFilter)
    );
  }

  return filtered;
};

export const sortParticipants = (participants, field, ascending = true) => {
  if (!field) return participants;
  const sortValue = (p) => {
    if (field === 'checkedIn') return p.checkedIn ? 1 : 0;
    if (field === 'type') return p.manuallyAdded ? 1 : 0;
    return (p[field] || '').toString().toLowerCase();
  };
  return [...participants].sort((a, b) => {
    const aVal = sortValue(a);
    const bVal = sortValue(b);
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

export const computeStats = (participants) => ({
  total: participants.length,
  checkedIn: participants.filter((p) => p.checkedIn).length,
  manual: participants.filter((p) => p.manuallyAdded).length,
});

// Data points for the check-in progress chart, or null when nobody is checked in.
// "expected" starts at the first check-in with all registered participants (plus manual
// additions without check-in time) and grows with each checked-in manual addition.
export const computeProgressSeries = (participants) => {
  const checkedInTimes = participants
    .filter((p) => p.checkedIn && p.checkedInAt)
    .map((p) => new Date(p.checkedInAt).getTime())
    .sort((a, b) => a - b);

  if (checkedInTimes.length === 0) return null;

  const startTime = checkedInTimes[0];
  const endTime = checkedInTimes[checkedInTimes.length - 1];

  const totalAtStart = participants.filter((p) => !p.manuallyAdded).length;
  const manualWithoutTime = participants.filter((p) => p.manuallyAdded && !p.checkedInAt).length;
  const manualAdditions = participants
    .filter((p) => p.manuallyAdded && p.checkedInAt)
    .map((p) => new Date(p.checkedInAt).getTime())
    .sort((a, b) => a - b);

  const expected = [];
  let runningTotal = totalAtStart + manualWithoutTime;
  expected.push({ x: new Date(startTime), y: runningTotal });
  for (const ts of manualAdditions) {
    if (ts >= startTime) {
      runningTotal += 1;
      expected.push({ x: new Date(ts), y: runningTotal });
    }
  }
  if (endTime > startTime) {
    expected.push({ x: new Date(endTime), y: runningTotal });
  }

  const checkedIn = checkedInTimes.map((ts, i) => ({ x: new Date(ts), y: i + 1 }));

  return { expected, checkedIn };
};

// Rows for the Excel export, with headers and values in the current language.
export const buildExportRows = (participants, t, locale) =>
  participants.map((p) => ({
    [t.columnFirstName]: p.firstName,
    [t.columnLastName]: p.lastName,
    [t.columnEmail]: p.email,
    [t.columnType]: p.manuallyAdded ? t.typeManual : t.typeRegistered,
    [t.columnStatus]: p.checkedIn ? t.statusCheckedIn : t.statusNotCheckedIn,
    [t.columnCheckedInAt]: p.checkedInAt ? new Date(p.checkedInAt).toLocaleString(locale) : '-',
    [t.columnAbsent]: p.absent ? t.absent : '-',
  }));

export const buildExportFileName = (eventName, date = new Date()) => {
  const timestamp = date.toISOString().split('T')[0];
  const eventPrefix = eventName ? `${eventName.replace(/[^a-z0-9]/gi, '_')}_` : '';
  return `${eventPrefix}participants_${timestamp}.xlsx`;
};

// Participants who can win a random draw: checked in and not absent
export const getDrawEligible = (participants) =>
  participants.filter((p) => p.checkedIn && !p.absent);

// Uniform random number in [0, 1) from the Web Crypto API, for a fair draw
export const secureRandom = () => {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return value / 2 ** 32;
};

export const pickRandom = (items, random = secureRandom) =>
  items.length === 0 ? null : items[Math.floor(random() * items.length)];

// Fisher-Yates shuffle, returning a new array
export const shuffle = (items, random = secureRandom) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Empty reel row, used when there are not enough names around the winner
const reelPlaceholder = (position) => ({
  id: `placeholder-${position}`,
  firstName: '',
  lastName: '',
  placeholder: true,
});

// Names shown on the draw reel, slot-machine style: up to `length` distinct eligible
// participants, the winner being followed by one more name so the reel stops on it with a
// name visible above and below. Placeholders fill the gaps when too few are eligible.
export const buildReel = (eligible, winner, length, random = secureRandom) => {
  const others = shuffle(
    eligible.filter((p) => p.id !== winner.id),
    random
  ).slice(0, Math.max(2, length - 1));
  const after = others.pop() ?? reelPlaceholder('after');
  const before = others.length > 0 ? others : [reelPlaceholder('before')];
  const items = [...before, winner, after];
  return { items, winnerIndex: before.length };
};

// Number of reel items for an animation duration: more names for longer animations,
// so the scrolling speed stays similar
export const reelLength = (durationSeconds) =>
  Math.min(80, Math.max(3, Math.round(durationSeconds * 15)));
