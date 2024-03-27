import mongoose, { Schema, Document } from "mongoose";

export interface WorkExperienceI extends Document {
  user:mongoose.Schema.Types.ObjectId;
  pastEmployer?:String;
  startDate?:String;
  endDate?:String;
  relevantExperience?:String;
  designation?:string;
  jobProfile: string;
  Lastctc?:string;
  leavingReason?: string;
  certificate?:any;
  deletedAt?:Date,
  createdAt?:Date,
  updatedAt?:Date
}

const WorkExperienceSchema: Schema<WorkExperienceI> = new Schema<WorkExperienceI>(
  {
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    pastEmployer: { type: String, trim: true },
    startDate: { type: Date, trim: true },
    endDate: {type : Date},
    relevantExperience: { type: String, trim: true },
    designation: { type: String, trim: true },
    jobProfile: { type: String, trim: true },
    Lastctc: { type: String, trim: true },
    leavingReason:{type : String},
    certificate: {
        name : {
          type : String
        },
        url : {
          type : String
        },
        type : {
          type : String
        }
      },
    deletedAt:{
      type : Date
    },
    createdAt:{
      type : Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    }
  }
);

const WorkExperience = mongoose.model<WorkExperienceI>("WorkExperience", WorkExperienceSchema);

export default WorkExperience;
