import { formatLotDateToken } from './date.js';

export const buildLotCode = (date) => `LOT-${formatLotDateToken(date)}`;

export const buildSerialNumber = (lotCode, sequence) => {
  return `${lotCode}-${String(sequence).padStart(4, '0')}`;
};

export const buildSerialDocuments = ({ lotId, lotCode, date, yard, meter }) => {
  return Array.from({ length: yard }, (_, index) => {
    const sequence = index + 1;

    return {
      serialNumber: buildSerialNumber(lotCode, sequence),
      lotId,
      lotCode,
      date,
      yard,
      meter,
      rollNumber: '',
      status: 'Generated'
    };
  });
};
