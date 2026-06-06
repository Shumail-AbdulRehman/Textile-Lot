import mongoose from 'mongoose';
import Serial from '../models/Serial.js';
import { formatISODate, getDateRange } from '../utils/date.js';

const serializeSerial = (serial) => ({
  _id: serial._id,
  serialNumber: serial.serialNumber,
  lotId: serial.lotId,
  lotCode: serial.lotCode,
  date: formatISODate(serial.date),
  yard: serial.yard,
  meter: serial.meter,
  rollNumber: serial.rollNumber,
  status: serial.status,
  createdAt: serial.createdAt,
  updatedAt: serial.updatedAt
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSerialQuery = (query) => {
  const filter = {};

  if (query.serialNumber) {
    filter.serialNumber = { $regex: escapeRegex(query.serialNumber.trim()), $options: 'i' };
  }

  if (query.lotCode) {
    filter.lotCode = { $regex: escapeRegex(query.lotCode.trim()), $options: 'i' };
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.date) {
    const { start, end } = getDateRange(query.date);
    filter.date = { $gte: start, $lt: end };
  }

  if (query.search) {
    const searchRegex = { $regex: escapeRegex(query.search.trim()), $options: 'i' };
    filter.$or = [{ serialNumber: searchRegex }, { lotCode: searchRegex }, { rollNumber: searchRegex }];
  }

  return filter;
};

export const getSerials = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 500);
    const skip = (page - 1) * limit;
    const allowedSortFields = new Set([
      'serialNumber',
      'lotCode',
      'date',
      'yard',
      'meter',
      'rollNumber',
      'status',
      'createdAt'
    ]);
    const sortBy = allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const filter = buildSerialQuery(req.query);

    const [serials, total] = await Promise.all([
      Serial.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      Serial.countDocuments(filter)
    ]);

    res.json({
      data: serials.map(serializeSerial),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSerialById = async (req, res, next) => {
  try {
    const idOrSerial = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(idOrSerial)
      ? { _id: idOrSerial }
      : { serialNumber: idOrSerial };
    const serial = await Serial.findOne(query).lean();

    if (!serial) {
      return res.status(404).json({ message: 'Serial not found.' });
    }

    res.json(serializeSerial(serial));
  } catch (error) {
    next(error);
  }
};

export const assignRoll = async (req, res, next) => {
  try {
    const { rollNumber } = req.body;

    if (!rollNumber || typeof rollNumber !== 'string' || !rollNumber.trim()) {
      return res.status(400).json({ message: 'Roll number is required.' });
    }

    const idOrSerial = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(idOrSerial)
      ? { _id: idOrSerial }
      : { serialNumber: idOrSerial };
    const serial = await Serial.findOneAndUpdate(
      query,
      {
        rollNumber: rollNumber.trim(),
        status: 'Assigned'
      },
      { new: true, runValidators: true }
    ).lean();

    if (!serial) {
      return res.status(404).json({ message: 'Serial not found.' });
    }

    res.json({
      message: 'Roll number assigned successfully.',
      serial: serializeSerial(serial)
    });
  } catch (error) {
    next(error);
  }
};
