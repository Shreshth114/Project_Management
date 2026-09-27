const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});

export const parseDate = value => {
  if (value == null || value === '') return new Date(NaN);
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);

  const str = String(value).trim();
  const dateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  // If already has explicit timezone (Z, +HH:MM, -HH:MM)
  if (/Z|[+-]\d{2}(?::?\d{2})?$/i.test(str)) {
    return new Date(str);
  }

  // If database UTC timestamp without timezone indicator (e.g. "2026-09-27 18:45:00" or "2026-09-27T18:45:00")
  // PostgreSQL stores CURRENT_TIMESTAMP in UTC, so treat unadorned DB timestamps as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(str)) {
    let normalized = str.replace(' ', 'T');
    if (!normalized.endsWith('Z')) {
      normalized += 'Z';
    }
    return new Date(normalized);
  }

  return new Date(str);
};

export const formatDate = value => {
  if (value == null || value === '') return '';
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
};

export const getTodayISO = () => new Date().toISOString().split('T')[0];

export const formatDateTime = value => {
  if (value == null || value === '') return '';
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateTimeFormatter.format(date);
};