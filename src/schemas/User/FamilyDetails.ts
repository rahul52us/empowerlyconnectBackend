import mongoose, { Schema, Document } from "mongoose";

interface FamilyDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  createdBy:mongoose.Schema.Types.ObjectId;
  company:mongoose.Schema.Types.ObjectId;
  companyOrg:mongoose.Schema.Types.ObjectId;
  relations:mongoose.Schema.Types.Mixed;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const FamilyDetails = new mongoose.Schema<FamilyDetailsI>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required:true
  },
  companyOrg: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required:true
  },
  relations:[{
    type : mongoose.Schema.Types.Mixed
  }],
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

export default mongoose.model<FamilyDetailsI>(
  "FamilyDetails",
  FamilyDetails
);