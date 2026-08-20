import { Request, Response, NextFunction } from 'express';
import { GateLog } from '../models/GateLog';
import { AppError } from '../middleware/errorHandler';

export const logScan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, type, note } = req.body;
    if (!studentId || !type) {
      throw new AppError('Missing studentId or scan type', 400);
    }

    const logId = `LOG-${studentId}-${Date.now()}`;
    const log = await GateLog.create({
      logId,
      studentId,
      type,
      timestamp: new Date(),
      note: note || (type === 'entry' ? 'Hostel entry' : 'Hostel exit'),
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

export const getGateLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const logs = await GateLog.find({ studentId }).sort({ timestamp: -1 }).lean();
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
