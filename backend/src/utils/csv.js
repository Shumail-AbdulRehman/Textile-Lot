const escapeCSVValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
};

export const toCSV = (rows) => {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCSVValue(row[header])).join(','))
  ];

  return lines.join('\n');
};
