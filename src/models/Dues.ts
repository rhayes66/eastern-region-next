import { Schema, model, models, Document, Types } from "mongoose";

export const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const DUES_TYPES = ["Monthly", "Yearly", "Donations"] as const;

export interface IDues extends Document {
  category?: string;
  amount: number;
  description?: string;
  month: string;
  year: string;
  duesType: string;
  paid: boolean;
  paidDate?: Date;
  addedDate: Date;
  addedBy?: Types.ObjectId;
  member: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DuesSchema = new Schema<IDues>(
  {
    category: { type: String },
    amount: { type: Number, required: true },
    description: { type: String },
    month: { type: String, required: true, enum: MONTHS },
    year: { type: String, required: true },
    duesType: { type: String, required: true, enum: DUES_TYPES },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
    addedDate: { type: Date, required: true, default: Date.now },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    member: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

// One dues record per member per month/year
DuesSchema.index({ month: 1, year: 1, member: 1 }, { unique: true });

export const Dues = models.Dues || model<IDues>("Dues", DuesSchema);
