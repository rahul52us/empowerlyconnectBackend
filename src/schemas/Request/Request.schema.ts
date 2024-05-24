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

const RequestSchema = new mongoose.Schema({
  companyDetail : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'CompanyDetail'
  },
  workingLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "workLocation",
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    reqiured: true
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
  sendTo : [{
    type : mongoose.Schema.Types.ObjectId
  }],
  status: {
    type: String,
  },
  approvals: [ApprovalSchema],
  deletedAt : {
    type : Date
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

export default mongoose.model("Request", RequestSchema);