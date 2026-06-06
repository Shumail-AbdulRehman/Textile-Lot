export const parseLotDate = (value) => {
  if (!value || typeof value !== 'string') {
    throw Object.assign(new Error('Date is required.'), { statusCode: 400 });
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const displayMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (displayMatch) {
    const [, day, month, year] = displayMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  throw Object.assign(new Error('Date must be YYYY-MM-DD or DD-MM-YYYY.'), { statusCode: 400 });
};

export const formatISODate = (date) => {
  const safeDate = new Date(date);
  return safeDate.toISOString().slice(0, 10);
};

export const formatLotDateToken = (date) => {
  const safeDate = new Date(date);
  const day = String(safeDate.getUTCDate()).padStart(2, '0');
  const month = String(safeDate.getUTCMonth() + 1).padStart(2, '0');
  const year = String(safeDate.getUTCFullYear());

  return `${day}${month}${year}`;
};

export const getDateRange = (value) => {
  const start = parseLotDate(value);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 1);

  return { start, end };
};
