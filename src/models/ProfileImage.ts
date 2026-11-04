import { Schema, model, models, Types } from "mongoose";

/**
 * Uploaded profile photo, stored in MongoDB (the host has no writable disk).
 * One document per user; the browser downsizes before upload so these stay small.
 */
export interface IProfileImage {
  user: Types.ObjectId;
  contentType: string;
  data: Buffer;
}

const ProfileImageSchema = new Schema<IProfileImage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const ProfileImage =
  models.ProfileImage || model<IProfileImage>("ProfileImage", ProfileImageSchema);
