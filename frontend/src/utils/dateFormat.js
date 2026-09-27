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

const parseDate = value => {
  if (value instanceof Date) return value;

  const dateOnly = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  return new Date(value);
};

export const formatDate = value => {
  if (value == null || value === '') return '';
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
};

export const formatDateTime = value => {
  if (value == null || value === '') return '';
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateTimeFormatter.format(date);
};