import { Request, Response, NextFunction } from 'express';
import { HostelComplaint } from '../models/HostelComplaint';
import { AppError } from '../middleware/errorHandler';

export const getComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.query;
    const filter: any = {};
    if (studentId) filter.studentId = studentId;

    const complaints = await HostelComplaint.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, category, subject, details, attachments } = req.body;
    if (!studentId || !category || !subject || !details) {
      throw new AppError('Missing required complaint fields', 400);
    }

    const complaintId = `CMP-${Date.now()}`;
    const dateReported = new Date().toISOString().split('T')[0];

    const complaint = await HostelComplaint.create({
      complaintId,
      studentId,
      category,
      subject,
      details,
      status: 'Pending',
      dateReported,
      attachments: attachments || [],
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const { responseText } = req.body;

    const complaint = await HostelComplaint.findOne({ complaintId });
    if (!complaint) throw new AppError('Complaint ticket not found', 404);

    complaint.status = 'Closed';
    complaint.response = responseText || 'Resolved by Administrator';
    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};
