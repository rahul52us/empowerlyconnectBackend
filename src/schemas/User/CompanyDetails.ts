import mongoose, { Schema, Document } from "mongoose";

export interface CompanyDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  companyOrg: mongoose.Schema.Types.ObjectId;
  details: {
    doj: Date;
    confirmationDate: Date;
    confirmationDueDate: Date;
    managers: {
      user: mongoose.Schema.Types.ObjectId;
      active: boolean;
      createdAt: Date;
      deletedAt?: Date;
    }[];
    department: mongoose.Schema.Types.ObjectId;
    designation: mongoose.Schema.Types.ObjectId;
    noticePeriod: string;
    workingLocation: string;
    workTiming: string;
    eCode: string;
    eType: string;
    eCategory: string;
    description: string;
  }[];
  workHistory: any[];
  is_active: boolean;
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
      required: true,
    },
    companyOrg: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    details: [
      {
        doj: {
          type: Date,
        },
        confirmationDate: {
          type: Date,
        },
        confirmationDueDate: {
          type: Date,
        },
        managers: [
          {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            active: { type: Boolean, default: false },
            createdAt: { type: Date, default: new Date() },
            deletedAt: { type: Date },
          },
        ],
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
        },
        designation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DepartmentCategory',
        },
        noticePeriod: {
          type: String,
        },
        workingLocation: {
          type: String,
        },
        workTiming: {
          type: String,
        },
        eCode: {
          type: String,
        },
        eType: {
          type: String,
        },
        eCategory: {
          type: String,
        },
        description : {
          type : String
        }
      },
    ],
    workHistory: {
      type: [],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: false,
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
