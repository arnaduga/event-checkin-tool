export const STORAGE_KEY = 'event-checkin-participants';
export const SETTINGS_KEY = 'event-checkin-settings';
export const LAST_LOAD_KEY = 'event-checkin-last-load';

// Read and parse a JSON value from localStorage, returning the fallback when it is
// missing, unreadable or when storage is not available (e.g. private browsing).
export const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage:`, e);
    return fallback;
  }
};

export const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage:`, e);
  }
};

export const writeText = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage:`, e);
  }
};

export const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove ${key} from localStorage:`, e);
  }
};
