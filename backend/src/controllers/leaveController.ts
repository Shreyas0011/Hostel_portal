import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
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

    const leaveObj: any = newLeave.toObject();
    leaveObj.id = leaveObj.leaveId || leaveObj._id.toString();

    res.status(201).json({ success: true, leave: leaveObj });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leaveId } = req.params;
    if (!leaveId || leaveId === 'undefined') {
      throw new AppError('Invalid leave ID', 400);
    }
    const leave = await HostelLeave.findOne({
      $or: [
        { leaveId },
        ...(mongoose.isValidObjectId(leaveId) ? [{ _id: leaveId }] : [])
      ]
    });
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
    if (!leaveId || leaveId === 'undefined') {
      throw new AppError('Invalid leave ID', 400);
    }
    const leave = await HostelLeave.findOne({
      $or: [
        { leaveId },
        ...(mongoose.isValidObjectId(leaveId) ? [{ _id: leaveId }] : [])
      ]
    });
    if (!leave) throw new AppError('Leave request not found', 404);

    leave.status = 'approved';
    await leave.save();

    if (leave.startDate && leave.endDate) {
      await MealBooking.deleteMany({
        studentId: leave.studentId,
        date: { $gte: leave.startDate, $lte: leave.endDate }
      });
    }

    res.json({ success: true, message: 'Leave request approved', leave });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leaveId } = req.params;
    if (!leaveId || leaveId === 'undefined') {
      throw new AppError('Invalid leave ID', 400);
    }
    const leave = await HostelLeave.findOne({
      $or: [
        { leaveId },
        ...(mongoose.isValidObjectId(leaveId) ? [{ _id: leaveId }] : [])
      ]
    });
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

    const rawLeaves = await HostelLeave.find(filter).sort({ createdAt: -1 }).lean();
    const leaves = rawLeaves.map((l: any) => ({
      ...l,
      id: l.leaveId || l._id?.toString(),
      leaveId: l.leaveId || l._id?.toString(),
    }));

    res.json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};
