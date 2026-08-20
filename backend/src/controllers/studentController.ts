import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { HostelLeave } from '../models/HostelLeave';
import { MealBooking } from '../models/MealBooking';
import { MealAttendance } from '../models/MealAttendance';
import { HostelComplaint } from '../models/HostelComplaint';
import { GateLog } from '../models/GateLog';
import { BehaviourLog } from '../models/BehaviourLog';
import { AppError } from '../middleware/errorHandler';

export const getStudents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const students = await User.find({ role: 'student', isActive: true }).lean();

    // Attach hostel sub-data dynamically per student
    const studentIds = students.map((s) => s.studentId || s.usn || s._id.toString());
    const dbUserIds = students.map((s) => s._id.toString());

    const [leaves, mealBookings, mealAttendance, complaints, gateLogs, behaviourLogs] = await Promise.all([
      HostelLeave.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
      MealBooking.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
      MealAttendance.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
      HostelComplaint.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
      GateLog.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
      BehaviourLog.find({ studentId: { $in: [...studentIds, ...dbUserIds] } }).lean(),
    ]);

    const formattedStudents = students.map((s) => {
      const key = s.studentId || s.usn || s._id.toString();
      const dbId = s._id.toString();

      return {
        id: s.studentId || s._id.toString(),
        name: s.name,
        usn: s.usn || '',
        room: s.room || 'A-101',
        block: s.block || 'A',
        bed: s.bed || 'Bed A',
        sharing: s.sharing || 2,
        division: s.division || 'II PU - Com',
        course: s.course || 'Pre-University',
        dept: s.dept || 'Commerce',
        year: s.year || 1,
        email: s.email,
        phone: s.phone || '',
        parentPhone: s.parentPhone || '',
        parentEmail: s.parentEmail || '',
        parentName: s.parentName || `Parent of ${s.name}`,
        parentRelation: s.parentRelation || 'Parent',
        gender: s.gender || 'Female',
        dob: s.dob || '',
        address: s.address || '',
        allergies: s.allergies || '',
        photo: s.avatar || '',
        isNew: !!s.isNewStudent,
        leaves: leaves.filter((l) => l.studentId === key || l.studentId === dbId),
        mealBookings: mealBookings.filter((m) => m.studentId === key || m.studentId === dbId),
        mealAttendance: mealAttendance.filter((a) => a.studentId === key || a.studentId === dbId),
        complaints: complaints.filter((c) => c.studentId === key || c.studentId === dbId),
        entryExitLogs: gateLogs.filter((g) => g.studentId === key || g.studentId === dbId),
        behaviourLogs: behaviourLogs.filter((b) => b.studentId === key || b.studentId === dbId),
      };
    });

    res.json({ success: true, students: formattedStudents });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paramId = String(req.params.id);
    const isValidObjId = mongoose.Types.ObjectId.isValid(paramId);
    const student = await User.findOne({
      $or: [
        ...(isValidObjId ? [{ _id: paramId }] : []),
        { studentId: paramId },
        { usn: paramId }
      ],
      role: 'student',
    }).lean();

    if (!student) throw new AppError('Student not found', 404);

    const key = student.studentId || student.usn || student._id.toString();
    const dbId = student._id.toString();

    const [leaves, mealBookings, mealAttendance, complaints, gateLogs, behaviourLogs] = await Promise.all([
      HostelLeave.find({ studentId: { $in: [key, dbId] } }).lean(),
      MealBooking.find({ studentId: { $in: [key, dbId] } }).lean(),
      MealAttendance.find({ studentId: { $in: [key, dbId] } }).lean(),
      HostelComplaint.find({ studentId: { $in: [key, dbId] } }).lean(),
      GateLog.find({ studentId: { $in: [key, dbId] } }).lean(),
      BehaviourLog.find({ studentId: { $in: [key, dbId] } }).lean(),
    ]);

    res.json({
      success: true,
      student: {
        id: student.studentId || student._id.toString(),
        name: student.name,
        usn: student.usn || '',
        room: student.room || '',
        block: student.block || '',
        bed: student.bed || 'Bed A',
        sharing: student.sharing || 2,
        division: student.division || '',
        course: student.course || '',
        dept: student.dept || '',
        year: student.year || 1,
        email: student.email,
        phone: student.phone || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        parentName: student.parentName || '',
        parentRelation: student.parentRelation || 'Parent',
        gender: student.gender || '',
        dob: student.dob || '',
        address: student.address || '',
        allergies: student.allergies || '',
        isNew: !!student.isNewStudent,
        leaves,
        mealBookings,
        mealAttendance,
        complaints,
        entryExitLogs: gateLogs,
        behaviourLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
