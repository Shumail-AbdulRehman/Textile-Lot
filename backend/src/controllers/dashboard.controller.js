import Lot from '../models/Lot.js';
import Serial from '../models/Serial.js';

export const getDashboardSummary = async (_req, res, next) => {
  try {
    const [totalLots, totalSerials, assignedRolls, unassignedRolls] = await Promise.all([
      Lot.countDocuments(),
      Serial.countDocuments(),
      Serial.countDocuments({ rollNumber: { $ne: '' } }),
      Serial.countDocuments({ rollNumber: '' })
    ]);

    res.json({
      totalLots,
      totalSerials,
      assignedRolls,
      unassignedRolls
    });
  } catch (error) {
    next(error);
  }
};
