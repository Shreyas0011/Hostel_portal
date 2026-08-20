import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: 'superadmin' | 'admin' | 'faculty' | 'viewer' | 'student' | 'parent' | 'warden' | 'messmanager';
  department?: string;
  avatar?: string;
  isActive: boolean;
  firstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Student specific fields
  usn?: string;
  division?: string;
  room?: string;
  block?: string;
  bed?: string;
  sharing?: number;
  course?: string;
  dept?: string;
  year?: number;
  phone?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentName?: string;
  parentRelation?: string;
  gender?: string;
  dob?: string;
  address?: string;
  allergies?: string;
  isNewStudent?: boolean;
  studentId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },          // hidden by default
    googleId:   { type: String, sparse: true, unique: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'faculty', 'viewer', 'student', 'parent', 'warden', 'messmanager'],
      default: 'faculty',
    },
    department: { type: String, trim: true },
    avatar:     { type: String },
    isActive:   { type: Boolean, default: true },
    firstLogin: { type: Boolean, default: true },
    // Student specific fields
    usn:            { type: String, sparse: true, unique: true },
    division:       { type: String, trim: true },
    room:           { type: String, trim: true },
    block:          { type: String, trim: true },
    bed:            { type: String, trim: true },
    sharing:        { type: Number },
    course:         { type: String, trim: true },
    dept:           { type: String, trim: true },
    year:           { type: Number },
    phone:          { type: String, trim: true },
    parentPhone:    { type: String, trim: true },
    parentEmail:    { type: String, trim: true },
    parentName:     { type: String, trim: true },
    parentRelation: { type: String, trim: true },
    gender:         { type: String, trim: true },
    dob:            { type: String, trim: true },
    address:        { type: String, trim: true },
    allergies:      { type: String, trim: true },
    isNewStudent:   { type: Boolean, default: false },
    studentId:      { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.first_login = ret.firstLogin; // Map to what frontend expects
        delete ret._id;
        delete ret.__v;
        delete ret.password; // never leak password in JSON
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
