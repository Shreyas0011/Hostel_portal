import mongoose, { Schema, Document } from 'mongoose';

export interface IMealCancellation {
  id: string;
  meal: string;
  reason: string;
  timestamp: Date;
}

export interface IMealBooking extends Document {
  studentId: string;
  date: string; // YYYY-MM-DD
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
  cancellations?: IMealCancellation[];
  createdAt: Date;
  updatedAt: Date;
}

const MealBookingSchema = new Schema<IMealBooking>(
  {
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    snacks: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    cancellations: [
      {
        id: { type: String },
        meal: { type: String },
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
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

MealBookingSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const MealBooking = mongoose.model<IMealBooking>('MealBooking', MealBookingSchema, 'mealbookings');
