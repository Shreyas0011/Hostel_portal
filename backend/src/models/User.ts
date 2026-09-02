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
  // Student-specific fields
  usn?: string;
  studentId?: string;
  division?: string;
  section?: string;        // NEW — "Sec" column, e.g. "12CA"
  // Room allocation — now populated from parsed roomBedRaw
  roomBedRaw?: string;     // NEW — verbatim source value e.g. "8G2"
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
  house?: string;          // NEW — e.g. "GC" | "SS" | "RS"
  foodStatus?: 'WITH_FOOD' | 'WITHOUT_FOOD' | 'UNSPECIFIED'; // NEW
  doj?: string;            // NEW — date of joining
  // Parent-specific fields
  contactEmail?: string;        // NEW — real address when login email was aliased due to collision
  linkedStudentIds?: string[];  // NEW — sibling support: one parent, multiple children
  // Demo/UAT flag
  isDemo?: boolean;             // NEW — true on demo accounts; excluded from all reporting queries
}

const UserSchema = new Schema<IUser>(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },   // hidden by default; optional for Google OAuth users
    googleId:   { type: String, sparse: true, unique: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'faculty', 'viewer', 'student', 'parent', 'warden', 'messmanager'],
      default: 'faculty',
    },
    department:  { type: String, trim: true },
    avatar:      { type: String },
    isActive:    { type: Boolean, default: true },
    firstLogin:  { type: Boolean, default: true },

    // ── Student-only fields ──────────────────────────────────────────────
    usn:            { type: String, sparse: true, unique: true },
    studentId:      { type: String, trim: true },  // mirrors usn; kept for backward-compat with existing FKs
    division:       { type: String, trim: true },
    section:        { type: String, trim: true, default: '' },  // NEW
    roomBedRaw:     { type: String, trim: true, default: '' },  // NEW — verbatim source, e.g. "8G2"
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
    house:          { type: String, trim: true, default: '' },  // NEW — "GC" | "SS" | "RS"
    foodStatus: {                                                // NEW
      type: String,
      enum: ['WITH_FOOD', 'WITHOUT_FOOD', 'UNSPECIFIED'],
      default: 'UNSPECIFIED',
    },
    doj:            { type: String, trim: true, default: '' },  // NEW — date of joining

    // ── Parent-only fields ───────────────────────────────────────────────
    contactEmail:     { type: String, trim: true, default: '' },  // NEW — real address if login was aliased
    linkedStudentIds: { type: [String], default: undefined },     // NEW — sibling support

    // ── Demo / UAT flag ──────────────────────────────────────────────────
    // Set true on demo accounts seeded for UAT. All reporting queries,
    // occupancy counts, meal totals, and admin dashboards should filter
    // { isDemo: { $ne: true } } to exclude these from real operational data.
    isDemo: { type: Boolean, default: false },
    // ────────────────────────────────────────────────────────────────────
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.first_login = ret.firstLogin; // frontend expects snake_case alias
        delete ret._id;
        delete ret.__v;
        delete ret.password; // never leak password in JSON responses
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
