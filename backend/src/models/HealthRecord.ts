import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  recordId: string;
  studentId: string;
  date: string;
  time: string;
  symptoms: string;
  temperature?: string;
  status: string; // 'Normal' | 'Under Observation' | 'Hospitalized' | 'Recovered'
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    symptoms: { type: String, required: true, trim: true },
    temperature: { type: String, trim: true },
    status: { type: String, default: 'Under Observation' },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.recordId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

HealthRecordSchema.index({ studentId: 1, createdAt: -1 });

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema, 'healthrecords');
