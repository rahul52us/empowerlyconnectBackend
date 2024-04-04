import mongoose, { Schema, Document } from "mongoose";

interface CompanyI extends Document {
  company_name: string;
  companyOrg:mongoose.Schema.Types.ObjectId,
  companyType:string;
  verified_email_allowed: boolean;
  is_active?: boolean;
  logo?: string;
  bio?: string;
  mobileNo?: string;
  workNo?: string;
  facebookLink?: string;
  instagramLink?: string;
  linkedInLink?: string;
  twitterLink?: string;
  githubLink?: string;
  telegramLink?: string;
  otherLinks?: string[];
  webLink?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  country?: string;
  state?: string;
  city?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const companySchema = new mongoose.Schema<CompanyI>({
  company_name: {
    type: String,
    unique: true,
    index: true,
    trim: true,
  },
  companyOrg : {
    type : mongoose.Schema.Types.ObjectId,
  },
  companyType:{
    type : String,
    default : 'company'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  verified_email_allowed: {
    type: Boolean,
    default: false,
  },
  logo: {
    type: String,
  },
  bio: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  workNo: {
    type: String,
  },
  facebookLink: {
    type: String,
  },
  instagramLink: {
    type: String,
  },
  twitterLink: {
    type: String,
  },
  githubLink: {
    type: String,
  },
  telegramLink: {
    type: String,
  },
  linkedInLink: {
    type: String,
  },
  otherLinks: {
    type: [{ type: String }],
  },
  address1: {
    type: String,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  pinCode: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
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

export default mongoose.model<CompanyI>("Company", companySchema);
