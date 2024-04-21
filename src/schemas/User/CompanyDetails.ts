import mongoose, { Schema, Document } from "mongoose";

export interface CompanyDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  company:mongoose.Schema.Types.ObjectId;
  workingLocation: string;
  workTiming: string;
  eCategory: string;
  eType: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const CompanyDetailsSchema: Schema<CompanyDetailsI> =
  new Schema<CompanyDetailsI>({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    company:{
      type : Schema.Types.ObjectId,
      ref : 'Company',
      required:true
    },
    workingLocation: {
        type : String
    },
    workTiming: {
      type: String,
    },
    eType: {
      type: String,
    },
    eCategory: {
        type: String,
      },
    deletedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
    },
  });

const CompanyDetails = mongoose.model<CompanyDetailsI>(
  "CompanyDetails",
  CompanyDetailsSchema
);
export default CompanyDetails;
