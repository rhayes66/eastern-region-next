import { Schema, model, models, Document, Types } from "mongoose";
import { EVENT_TYPES } from "@/lib/constants";

export { EVENT_TYPES } from "@/lib/constants";

/**
 * Association events — meetings and team events (requirement 6).
 */
export interface IEvent extends Document {
  title: string;
  eventType: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  createdBy?: Types.ObjectId;
  attendees: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    eventType: { type: String, enum: EVENT_TYPES, default: "Meeting" },
    description: { type: String },
    location: { type: String },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false }
);

export const Event = models.Event || model<IEvent>("Event", EventSchema);
