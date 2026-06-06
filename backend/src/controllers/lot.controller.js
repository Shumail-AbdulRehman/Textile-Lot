import Lot from '../models/Lot.js';
import Serial from '../models/Serial.js';
import { formatISODate, parseLotDate } from '../utils/date.js';
import { buildLotCode, buildSerialDocuments } from '../utils/serial.js';

const serializeLot = (lot) => ({
  _id: lot._id,
  lotCode: lot.lotCode,
  date: formatISODate(lot.date),
  yard: lot.yard,
  meter: lot.meter,
  createdAt: lot.createdAt,
  updatedAt: lot.updatedAt
});

const validateLotPayload = ({ date, yard, meter }) => {
  const parsedDate = parseLotDate(date);
  const yardCount = Number(yard);
  const meterCount = Number(meter);

  if (!Number.isInteger(yardCount) || yardCount < 1 || yardCount > 10000) {
    throw Object.assign(new Error('Yard must be an integer from 1 to 10000.'), { statusCode: 400 });
  }

  if (!Number.isFinite(meterCount) || meterCount < 0) {
    throw Object.assign(new Error('Meter must be a number greater than or equal to 0.'), {
      statusCode: 400
    });
  }

  return { parsedDate, yardCount, meterCount };
};

export const generateLot = async (req, res, next) => {
  try {
    const { date, yard, meter } = req.body;
    const { parsedDate, yardCount, meterCount } = validateLotPayload({ date, yard, meter });

    const lotCode = buildLotCode(parsedDate);
    const existingLot = await Lot.findOne({ lotCode }).lean();

    if (existingLot) {
      return res.status(409).json({
        message: `${lotCode} already exists. Serial numbers must remain unique for each lot code.`
      });
    }

    const lot = await Lot.create({
      lotCode,
      date: parsedDate,
      yard: yardCount,
      meter: meterCount
    });

    try {
      const serialDocs = buildSerialDocuments({
        lotId: lot._id,
        lotCode,
        date: parsedDate,
        yard: yardCount,
        meter: meterCount
      });

      await Serial.insertMany(serialDocs, { ordered: true });
    } catch (error) {
      await Lot.findByIdAndDelete(lot._id);
      throw error;
    }

    res.status(201).json({
      message: 'Lot and serial numbers generated successfully.',
      lot: serializeLot(lot),
      generatedSerials: yardCount
    });
  } catch (error) {
    next(error);
  }
};

export const getLots = async (_req, res, next) => {
  try {
    const lots = await Lot.find().sort({ createdAt: -1 }).lean();
    res.json(lots.map(serializeLot));
  } catch (error) {
    next(error);
  }
};

export const getLotById = async (req, res, next) => {
  try {
    const lot = await Lot.findById(req.params.id).lean();

    if (!lot) {
      return res.status(404).json({ message: 'Lot not found.' });
    }

    const [serialCount, assignedRolls] = await Promise.all([
      Serial.countDocuments({ lotId: lot._id }),
      Serial.countDocuments({ lotId: lot._id, rollNumber: { $ne: '' } })
    ]);

    res.json({
      ...serializeLot(lot),
      serialCount,
      assignedRolls,
      unassignedRolls: serialCount - assignedRolls
    });
  } catch (error) {
    next(error);
  }
};

export const updateLot = async (req, res, next) => {
  try {
    const lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ message: 'Lot not found.' });
    }

    const { date, yard, meter } = req.body;
    const { parsedDate, yardCount, meterCount } = validateLotPayload({ date, yard, meter });
    const nextLotCode = buildLotCode(parsedDate);
    const duplicateLot = await Lot.findOne({
      lotCode: nextLotCode,
      _id: { $ne: lot._id }
    }).lean();

    if (duplicateLot) {
      return res.status(409).json({
        message: `${nextLotCode} already exists. Lot codes must remain unique.`
      });
    }

    const identityChanged = lot.lotCode !== nextLotCode || lot.yard !== yardCount;
    const assignedRolls = await Serial.countDocuments({
      lotId: lot._id,
      rollNumber: { $ne: '' }
    });

    if (identityChanged && assignedRolls > 0) {
      return res.status(409).json({
        message:
          'This lot has assigned rolls. Date or yard changes would regenerate serial numbers, so remove assignments or create a new lot instead.'
      });
    }

    lot.lotCode = nextLotCode;
    lot.date = parsedDate;
    lot.yard = yardCount;
    lot.meter = meterCount;
    await lot.save();

    if (identityChanged) {
      await Serial.deleteMany({ lotId: lot._id });
      const serialDocs = buildSerialDocuments({
        lotId: lot._id,
        lotCode: nextLotCode,
        date: parsedDate,
        yard: yardCount,
        meter: meterCount
      });
      await Serial.insertMany(serialDocs, { ordered: true });
    } else {
      await Serial.updateMany(
        { lotId: lot._id },
        {
          $set: {
            lotCode: nextLotCode,
            date: parsedDate,
            yard: yardCount,
            meter: meterCount
          }
        }
      );
    }

    res.json({
      message: 'Lot updated successfully.',
      lot: serializeLot(lot),
      regeneratedSerials: identityChanged ? yardCount : 0
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLot = async (req, res, next) => {
  try {
    const lot = await Lot.findById(req.params.id).lean();

    if (!lot) {
      return res.status(404).json({ message: 'Lot not found.' });
    }

    const serialDeleteResult = await Serial.deleteMany({ lotId: lot._id });
    await Lot.findByIdAndDelete(lot._id);

    res.json({
      message: 'Lot and related serials deleted successfully.',
      lot: serializeLot(lot),
      deletedSerials: serialDeleteResult.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
