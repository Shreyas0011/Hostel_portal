import mongoose, { Schema, Document } from 'mongoose';

export type ComplaintStatus = 'Pending' | 'Closed';

export interface IHostelComplaint extends Document {
  complaintId: string;
  studentId: string;
  category: string;
  subject: string;
  details: string;
  status: ComplaintStatus;
  response?: string;
  dateReported: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HostelComplaintSchema = new Schema<IHostelComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Closed'], default: 'Pending', index: true },
    response: { type: String, trim: true },
    dateReported: { type: String, required: true },
    attachments: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.complaintId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

HostelComplaintSchema.index({ studentId: 1, createdAt: -1 });

export const HostelComplaint = mongoose.model<IHostelComplaint>('HostelComplaint', HostelComplaintSchema, 'hostelcomplaints');
