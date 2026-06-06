import XLSX from 'xlsx';
import Serial from '../models/Serial.js';
import { toCSV } from '../utils/csv.js';
import { formatISODate } from '../utils/date.js';

const getExportRows = async () => {
  const serials = await Serial.find()
    .sort({ lotCode: 1, serialNumber: 1 })
    .select('serialNumber lotCode date yard meter rollNumber status')
    .lean();

  return serials.map((serial) => ({
    'Serial Number': serial.serialNumber,
    'Lot Code': serial.lotCode,
    Date: formatISODate(serial.date),
    Yard: serial.yard,
    Meter: serial.meter,
    'Roll Number': serial.rollNumber,
    Status: serial.status
  }));
};

export const exportExcel = async (_req, res, next) => {
  try {
    const rows = await getExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Serials');

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });

    res.setHeader('Content-Disposition', 'attachment; filename="serials-export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (_req, res, next) => {
  try {
    const rows = await getExportRows();
    const csv = toCSV(rows);

    res.setHeader('Content-Disposition', 'attachment; filename="serials-export.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
