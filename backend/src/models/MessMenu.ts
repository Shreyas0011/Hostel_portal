import mongoose, { Schema, Document } from 'mongoose';

export interface IMessMenu extends Document {
  key: string; // 'default' or day name like 'Monday'
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessMenuSchema = new Schema<IMessMenu>(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    snacks: { type: String, required: true },
    dinner: { type: String, required: true },
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

export const MessMenu = mongoose.model<IMessMenu>('MessMenu', MessMenuSchema, 'messmenus');
