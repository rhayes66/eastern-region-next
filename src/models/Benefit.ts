import { Schema, model, models, Document, Types } from "mongoose";
import { BENEFIT_CATEGORIES, BENEFIT_STATUSES } from "@/lib/constants";

export { BENEFIT_CATEGORIES, BENEFIT_STATUSES } from "@/lib/constants";

/**
 * A support/benefit granted to a member when they are in need
 * (requirement 5). New entity — the legacy app only modelled loans.
 */
export interface IBenefit extends Document {
  member: Types.ObjectId;
  category: string;
  amount: number;
  description?: string;
  status: string;
  requestedDate: Date;
  approvedDate?: Date;
  disbursedDate?: Date;
  rejectedDate?: Date;
  approvedBy?: Types.ObjectId;
  addedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BenefitSchema = new Schema<IBenefit>(
  {
    member: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: BENEFIT_CATEGORIES, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: BENEFIT_STATUSES,
      default: "Requested",
      index: true,
    },
    requestedDate: { type: Date, required: true, default: Date.now },
    approvedDate: { type: Date },
    disbursedDate: { type: Date },
    rejectedDate: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

export const Benefit =
  models.Benefit || model<IBenefit>("Benefit", BenefitSchema);
