import { Schema, model, models, Document, Types } from "mongoose";
import { TITLES, GENDERS, APPLICATION_STATUSES } from "@/lib/constants";

export { APPLICATION_STATUSES } from "@/lib/constants";
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/**
 * Applicant details. Mirrors the legacy YourDetails sub-schema plus the two
 * fields requested for the new app: gender and the Finland contact number.
 */
export interface IApplicantDetails {
  title?: string;
  firstname?: string;
  lastname?: string;
  gender?: string;
  dateOfBirth?: string;
  children?: string; // number of children, stored as string to match legacy
  fathersname?: string;
  mothersname?: string;
  spousename?: string;
  occupation?: string;
  address?: string; // location address
  postalCode?: string;
  city?: string; // city in Finland
  ghanacity?: string; // home town in Ghana
  finlandContact?: string; // Finland contact number
  email?: string;
}

const ApplicantDetailsSchema = new Schema<IApplicantDetails>(
  {
    title: { type: String, enum: TITLES },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, enum: GENDERS, required: true },
    dateOfBirth: { type: String },
    children: { type: String },
    fathersname: { type: String },
    mothersname: { type: String },
    spousename: { type: String },
    occupation: { type: String },
    address: { type: String },
    postalCode: { type: String },
    city: { type: String },
    ghanacity: { type: String },
    finlandContact: { type: String },
    email: { type: String, lowercase: true },
  },
  { _id: false }
);

export interface IMemberApplication extends Document {
  yourDetails: IApplicantDetails;
  passwordHash?: string; // bcrypt hash of the member's chosen password
  status: ApplicationStatus;
  applicationDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  acceptedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  member?: Types.ObjectId; // linked User once accepted
  createdAt: Date;
  updatedAt: Date;
}

const MemberApplicationSchema = new Schema<IMemberApplication>(
  {
    yourDetails: { type: ApplicantDetailsSchema, required: true },
    // Hashed at submission; copied to the User on accept. Never returned by default.
    passwordHash: { type: String, select: false },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Pending",
      index: true,
    },
    applicationDate: { type: Date, default: Date.now },
    acceptedDate: { type: Date },
    rejectedDate: { type: Date },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    member: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

export const MemberApplication =
  models.MemberApplication ||
  model<IMemberApplication>("MemberApplication", MemberApplicationSchema);
