import { Request, Response, NextFunction } from 'express';
import { HostelLeave } from '../models/HostelLeave';
import { MealBooking } from '../models/MealBooking';
import { AppError } from '../middleware/errorHandler';

export const applyLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, startDate, endDate, reason, type, submittedBy, startTime, endTime, isOvernight } = req.body;
    if (!studentId || !startDate || !endDate || !reason || !type) {
      throw new AppError('Missing required leave request parameters', 400);
    }

    const leaveId = `LV-${Date.now()}`;
    const newLeave = await HostelLeave.create({
      leaveId,
      studentId,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      reason,
      submittedBy: submittedBy || 'student',
      status: submittedBy === 'parent' ? 'approved' : 'pending',
      isOvernight: !!isOvernight,
    });

    res.status(201).json({ success: true, leave: newLeave });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const leave = await HostelLeave.findOne({ leaveId });
    if (!leave) throw new AppError('Leave request not found', 404);

    leave.status = 'cancelled';
    await leave.save();

    res.json({ success: true, message: 'Leave request cancelled', leave });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const leave = await HostelLeave.findOne({ leaveId });
    if (!leave) throw new AppError('Leave request not found', 404);

    leave.status = 'approved';
    await leave.save();

    res.json({ success: true, message: 'Leave request approved', leave });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const leave = await HostelLeave.findOne({ leaveId });
    if (!leave) throw new AppError('Leave request not found', 404);

    leave.status = 'rejected';
    await leave.save();

    res.json({ success: true, message: 'Leave request rejected', leave });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.query;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;

    const leaves = await HostelLeave.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};
