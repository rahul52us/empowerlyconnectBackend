import mongoose, { Document } from "mongoose";

interface WorkTiming {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

interface CompanyPolicyI extends Document {
  company: mongoose.Schema.Types.ObjectId;
  createdBy:mongoose.Schema.Types.ObjectId;
  workLocations: {
    ipAddress: string;
    locationName: string;
  }[];
  workTiming: WorkTiming[];
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
  is_active : {
    type : Boolean,
    default : true
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
