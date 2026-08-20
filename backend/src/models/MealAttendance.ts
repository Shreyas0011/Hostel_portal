import mongoose, { Schema, Document } from 'mongoose';

export type AttendanceMark = 'yes' | 'no' | null;

export interface IMealAttendance extends Document {
  studentId: string;
  date: string; // YYYY-MM-DD
  breakfast?: AttendanceMark;
  lunch?: AttendanceMark;
  snacks?: AttendanceMark;
  dinner?: AttendanceMark;
  createdAt: Date;
  updatedAt: Date;
}

const MealAttendanceSchema = new Schema<IMealAttendance>(
  {
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    breakfast: { type: String, enum: ['yes', 'no', null], default: null },
    lunch: { type: String, enum: ['yes', 'no', null], default: null },
    snacks: { type: String, enum: ['yes', 'no', null], default: null },
    dinner: { type: String, enum: ['yes', 'no', null], default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

MealAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const MealAttendance = mongoose.model<IMealAttendance>('MealAttendance', MealAttendanceSchema, 'mealattendances');
