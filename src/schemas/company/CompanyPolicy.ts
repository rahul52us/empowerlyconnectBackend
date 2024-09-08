import mongoose, { Document } from "mongoose";

interface WorkTiming {
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
}

interface CompanyPolicyI extends Document {
  company: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  officeStartTime: string;
  officeEndTime: string;
  gracePeriodMinutesLate: number;
  gracePeriodMinutesEarly: number;
  workLocations: {
    ipAddress: string;
    locationName: string;
  }[];
  workTiming: WorkTiming[];
  holidays: mongoose.Schema.Types.Mixed;
  ipAddressRange: mongoose.Schema.Types.Mixed;
  is_active?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const companyPolicySchema = new mongoose.Schema<CompanyPolicyI>({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  officeStartTime: {
    type: String,
    required: true
  },
  officeEndTime: {
    type: String,
    required: true
  },
  gracePeriodMinutesLate: {
    type: Number,
    required: true,
    default: 10
  },
  gracePeriodMinutesEarly: {
    type: Number,
    required: true,
    default: 20
  },
  workLocations: [
    {
      ipAddress: {
        type: String,
        required: true
      },
      locationName: {
        type: String,
        required: true
      }
    }
  ],
  workTiming: [
    {
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      daysOfWeek: {
        type: [String],
        required: true
      }
    }
  ],
  holidays: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  ipAddressRange: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

export default mongoose.model<CompanyPolicyI>("CompanyPolicy", companyPolicySchema);
