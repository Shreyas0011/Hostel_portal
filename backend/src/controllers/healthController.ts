import { Request, Response, NextFunction } from 'express';
import { HealthRecord } from '../models/HealthRecord';
import { AppError } from '../middleware/errorHandler';

export const saveHealthRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, recordId, symptoms, temperature, status, note } = req.body;
    if (!studentId || !symptoms) {
      throw new AppError('Missing studentId or symptoms', 400);
    }

    let record;
    if (recordId) {
      record = await HealthRecord.findOne({ recordId });
      if (record) {
        record.symptoms = symptoms;
        record.temperature = temperature || record.temperature;
        record.status = status || record.status;
        record.note = note || record.note;
        await record.save();
      }
    }

    if (!record) {
      const d = new Date();
      const newRecordId = recordId || `HR-${Date.now()}`;
      record = await HealthRecord.create({
        recordId: newRecordId,
        studentId,
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        symptoms,
        temperature: temperature || '98.6 °F',
        status: status || 'Under Observation',
        note: note || '',
      });
    }

    res.status(201).json({ success: true, healthRecord: record });
  } catch (error) {
    next(error);
  }
};

export const deleteHealthRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recordId } = req.params;
    await HealthRecord.deleteOne({ recordId });
    res.json({ success: true, message: 'Health record deleted' });
  } catch (error) {
    next(error);
  }
};

export const getHealthRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const records = await HealthRecord.find({ studentId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, records });
  } catch (error) {
    next(error);
  }
};
