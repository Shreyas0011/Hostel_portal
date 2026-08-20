import mongoose, { Schema, Document } from 'mongoose';

export type GatePassType = 'entry' | 'exit';

export interface IGateLog extends Document {
  logId: string;
  studentId: string;
  type: GatePassType;
  timestamp: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GateLogSchema = new Schema<IGateLog>(
  {
    logId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    note: { type: String, trim: true },
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

GateLogSchema.index({ studentId: 1, timestamp: -1 });

export const GateLog = mongoose.model<IGateLog>('GateLog', GateLogSchema, 'gatelogs');
