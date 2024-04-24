import mongoose, { Document } from "mongoose";

interface CompanyPolicyI extends Document {
  company: mongoose.Schema.Types.ObjectId;
  createdBy:mongoose.Schema.Types.ObjectId;
  workLocations: mongoose.Schema.Types.Mixed;
  workTiming: mongoose.Schema.Types.Mixed;
  holidays:mongoose.Schema.Types.Mixed;
  ipAddressRange:mongoose.Schema.Types.Mixed;
  is_active?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const companyPolicySchema = new mongoose.Schema<CompanyPolicyI>({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Company'
  },
  createdBy:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  workLocations: {
    type: mongoose.Schema.Types.Mixed,
  },
  workTiming: {
    type: mongoose.Schema.Types.Mixed,
  },
  holidays: [{
    date: { type: Date, required: true },
    title: { type: String, required: true }
  }],
  ipAddressRange : {
    type : mongoose.Schema.Types.Mixed
  },
  is_active : {
    type : Boolean
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

export default mongoose.model<CompanyPolicyI>("CompanyPolicy", companyPolicySchema);
