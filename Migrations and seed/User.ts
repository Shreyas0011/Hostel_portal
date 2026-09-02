import mongoose from 'mongoose';

/**
 * users collection — v2 schema
 *
 * CHANGES FROM v1:
 *   - Login `email` for students is now their ORIGINAL personal email
 *     (from "Student Email ID" in the source CSV), not their USN.
 *     `usn` remains a separate unique identifier used as the FK for every
 *     other collection (hostelleaves, gatelogs, mealbookings, ...), so no
 *     downstream collection needs to change.
 *   - Added: section, roomBedRaw, block/room/bed now populated (not blank),
 *     house, foodStatus, doj.
 *   - parentName is now the real parent name from "PPOC Name" instead of
 *     the placeholder "Parent of {student}".
 */

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Login identity. For students this is their real personal email.
    // For parents/staff, unchanged from before.
    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, select: false },
    googleId: { type: String, sparse: true, unique: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'faculty', 'viewer', 'student', 'parent', 'warden', 'messmanager'],
      default: 'faculty',
    },
    isActive: { type: Boolean, default: true },
    firstLogin: { type: Boolean, default: true },
    department: { type: String },

    // ── student-only fields ────────────────────────────────────────────
    usn: { type: String, sparse: true, unique: true }, // identifier / FK for other collections, no longer the login
    studentId: { type: String }, // mirrors usn, kept for backward compatibility with existing FKs
    division: { type: String },
    section: { type: String, default: '' }, // NEW — "Sec" column, e.g. "12CA"

    // Room allocation — now actually populated instead of left blank
    roomBedRaw: { type: String, default: '' }, // NEW — verbatim source value, e.g. "8G2"
    block: { type: String, default: '' }, // parsed wing letter, e.g. "G"
    room: { type: String, default: '' }, // parsed floor+wing, e.g. "8G"
    bed: { type: String, default: '' }, // parsed bed number, e.g. "2"

    sharing: { type: Number },
    course: { type: String },
    dept: { type: String },
    year: { type: Number },
    phone: { type: String },
    parentPhone: { type: String },
    parentEmail: { type: String },
    parentName: { type: String }, // now sourced from "PPOC Name", not a placeholder
    parentRelation: { type: String },
    gender: { type: String },
    dob: { type: String },
    address: { type: String },
    allergies: { type: String },
    isNewStudent: { type: Boolean, default: false },

    house: { type: String, default: '' }, // NEW — e.g. "GC" | "SS" | "RS"
    foodStatus: {
      // NEW — normalized from "Food status" column
      type: String,
      enum: ['WITH_FOOD', 'WITHOUT_FOOD', 'UNSPECIFIED'],
      default: 'UNSPECIFIED',
    },
    doj: { type: String, default: '' }, // NEW — date of joining, plain string like `dob`

    // NEW — set only when `email` had to be an alias because the real
    // address collided with another account (see seedHostelDB.v2.ts). The
    // true, unaliased address is preserved here so it's never lost.
    contactEmail: { type: String, default: '' },

    // NEW — parent role only. Handles the sibling case (one parent, two+
    // children): rather than creating a duplicate parent account, the
    // second+ child's usn is appended here instead of erroring or
    // duplicating the login.
    linkedStudentIds: { type: [String], default: undefined },
    // ────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
