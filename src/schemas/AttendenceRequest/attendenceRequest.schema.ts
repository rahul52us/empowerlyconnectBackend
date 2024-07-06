import mongoose from "mongoose";

const PunchRecordSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});

const AttendanceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  companyDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyDetail",
  },
  punchRecords: [PunchRecordSchema],
  date: {
    type: Date,
    default: Date.now,
  },
  officeStartTime: {
    type: String,
    required: true,
  },
  officeEndTime: {
    type: String,
    required: true,
  },
  gracePeriodMinutesLate: {
    type: Number,
    required: true,
    default :10
  },
  gracePeriodMinutesEarly: {
    type: Number,
    required: true,
    default:20
  },
});

export default mongoose.model("AttendanceRequest", AttendanceRequestSchema);
