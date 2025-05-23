import mongoose, { Schema, Document } from "mongoose";

export interface DepartmentI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  category:mongoose.Schema.Types.ObjectId;
  title:string;
  code:string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DepartmentSchema: Schema<DepartmentI> = new Schema<DepartmentI>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required : true
  },
  category:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'DepartmentCategory',
    required : true
  },
  title : {
    type : String,
    required : true
  },
  code: {
    type : String,
    required : true
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

const Department = mongoose.model<DepartmentI>(
  "Department",
  DepartmentSchema
);

export default Department;
