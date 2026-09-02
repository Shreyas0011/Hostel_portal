import mongoose, { Schema, Document } from 'mongoose';

export interface IInstallment {
  label: string;   // e.g. "First", "Second"
  amount: number;
  paidOn: Date | null;
}

export interface IHostelFee extends Document {
  studentId: string;      // FK -> User.usn
  academicYear: string;   // e.g. "2026-27"
  installments: IInstallment[];
  depositAmount: number | null;
  depositRefunded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    label:  { type: String, required: true },
    amount: { type: Number, required: true },
    paidOn: { type: Date, default: null },
  },
  { _id: false }
);

const HostelFeeSchema = new Schema<IHostelFee>(
  {
    studentId:       { type: String, required: true },  // FK -> User.usn
    academicYear:    { type: String, required: true },  // e.g. "2026-27"
    installments:    { type: [InstallmentSchema], default: [] },
    depositAmount:   { type: Number, default: null },
    depositRefunded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One fee record per student per academic year
HostelFeeSchema.index({ studentId: 1, academicYear: 1 }, { unique: true });

export const HostelFee = mongoose.model<IHostelFee>('HostelFee', HostelFeeSchema, 'hostelfees');
