import mongoose from 'mongoose';

/**
 * hostelfees collection — NEW
 *
 * Fee/deposit data was previously discarded during seeding. It's modeled as
 * its own collection (not fields on `users`) because:
 *   - it has its own lifecycle (installments get added/paid over time)
 *   - it needs a per-payment history, not flat "installment1/installment2" fields
 *   - it follows the same pattern already used across the app: hostelleaves,
 *     gatelogs, mealbookings, etc. are all separate collections keyed by
 *     studentId rather than fields bolted onto User.
 */

const installmentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "First", "Second"
    amount: { type: Number, required: true },
    paidOn: { type: Date, default: null },
  },
  { _id: false }
);

const hostelFeeSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true }, // FK -> User.usn
    academicYear: { type: String, required: true }, // e.g. "2026-27"
    installments: { type: [installmentSchema], default: [] },
    depositAmount: { type: Number, default: null },
    depositRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hostelFeeSchema.index({ studentId: 1, academicYear: 1 }, { unique: true });

export const HostelFee = mongoose.model('HostelFee', hostelFeeSchema);
