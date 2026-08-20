import mongoose, { Schema, Document } from 'mongoose';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'leave' | 'outing';
export type SubmittedBy = 'student' | 'parent';

export interface IHostelLeave extends Document {
  leaveId: string;
  studentId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  type: LeaveType;
  reason: string;
  submittedBy: SubmittedBy;
  status: LeaveStatus;
  isOvernight: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HostelLeaveSchema = new Schema<IHostelLeave>(
  {
    leaveId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    type: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    submittedBy: { type: String, required: true },
    status: { type: String, default: 'pending', index: true },
    isOvernight: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.leaveId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

HostelLeaveSchema.index({ studentId: 1, startDate: 1, endDate: 1 });

export const HostelLeave = mongoose.model<IHostelLeave>('HostelLeave', HostelLeaveSchema, 'hostelleaves');
