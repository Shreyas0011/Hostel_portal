import mongoose, { Schema, Document } from 'mongoose';

export type BehaviourSeverity = 'positive' | 'neutral' | 'warning' | 'critical';

export interface IBehaviourLog extends Document {
  logId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  category: string;
  severity: BehaviourSeverity;
  description: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BehaviourLogSchema = new Schema<IBehaviourLog>(
  {
    logId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['positive', 'neutral', 'warning', 'critical'], default: 'neutral' },
    description: { type: String, required: true, trim: true },
    recordedBy: { type: String, default: 'System' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.logId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

BehaviourLogSchema.index({ studentId: 1, date: -1 });

export const BehaviourLog = mongoose.model<IBehaviourLog>('BehaviourLog', BehaviourLogSchema, 'behaviourlogs');
