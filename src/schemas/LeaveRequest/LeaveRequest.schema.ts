import mongoose, { Schema } from "mongoose";

const ApprovalSchema: Schema = new mongoose.Schema(
    {
      reason: {
        type: String,
        default: "",
      },
      status: {
        type: String,
      },
      user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
      createdAt : {
        type : Date,
        default : new Date()
      }
    },
);

const LeaveRequestSchema = new mongoose.Schema({
  companyDetail : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'CompanyDetail'
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    reqiured: true,
  },
  leaveType: {
    type : String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sendTo: {},
  status: {
    type: String,
  },
  approval: [ApprovalSchema],
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

export default mongoose.model("LeaveRequest", LeaveRequestSchema);