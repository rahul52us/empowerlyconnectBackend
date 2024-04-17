import mongoose, { Schema, Document } from "mongoose";

export interface BankInterface extends Document {
  user: mongoose.Schema.Types.ObjectId;
  createdBy:mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  companyOrg: mongoose.Schema.Types.ObjectId;
  nameAsPerBank?: String;
  accountNo?: String;
  branch?: String;
  ifsc?: String;
  cancelledCheque?: any;
  name: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const BankDetailsSchema: Schema<BankInterface> = new Schema<BankInterface>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  companyOrg: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  nameAsPerBank: { type: String, trim: true },
  name: { type: String, trim: true },
  accountNo: { type: String, trim: true },
  branch: { type: String, trim: true },
  ifsc: { type: String, trim: true },
  cancelledCheque: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
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

const BankDetailModel = mongoose.model<BankInterface>(
  "BankDetail",
  BankDetailsSchema
);

export default BankDetailModel;