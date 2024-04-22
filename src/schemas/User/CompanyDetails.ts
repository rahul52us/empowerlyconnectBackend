import mongoose, { Schema, Document } from "mongoose";

export interface CompanyDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  companyOrg: mongoose.Schema.Types.ObjectId;
  workHistory:mongoose.Schema.Types.Mixed;
  eCode:string;
  position: string;
  department: string;
  designation: string;
  workingLocation: string;
  workTiming: string;
  eCategory: string;
  eType: string;
  is_active:boolean;
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
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    companyOrg: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    position: {
      type: mongoose.Schema.Types.Mixed,
    },
    department: {
      type: mongoose.Schema.Types.Mixed,
    },
    designation: {
      type: mongoose.Schema.Types.Mixed,
    },
    workingLocation: {
      type: String,
    },
    workTiming: {
      type: String,
    },
    eCode:{
      type : String
    },
    eType: {
      type: String,
    },
    eCategory: {
      type: String,
    },
    workHistory:{
      type : mongoose.Schema.Types.Mixed
    },
    is_active:{
      type : Boolean,
      default : false
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
  "CompanyDetail",
  CompanyDetailsSchema
);
export default CompanyDetails;
