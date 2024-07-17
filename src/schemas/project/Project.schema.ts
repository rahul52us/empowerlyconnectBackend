import mongoose, { Document, Schema } from "mongoose";

interface ProjectI extends Document {
  project_name: string;
  subtitle?: string;
  description?: string;
  logo?: string;
  is_active?: boolean;
  createdBy: mongoose.Schema.Types.ObjectId;
  dueDate?: Date;
  company: mongoose.Schema.Types.ObjectId;
  priority?: string;
  project_manager?: mongoose.Schema.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  status?: string;
  customers?: mongoose.Schema.Types.ObjectId[];
  followers?: mongoose.Schema.Types.ObjectId[];
  team_members?: mongoose.Schema.Types.ObjectId[];
  approval?: string;
  attach_files?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const AttachFiles = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      trim: true,
    },
    file: {
      type: String,
      trim: true
    },
    createdAt:{
      type :Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    }
  }
);

const ProjectSchema = new mongoose.Schema<ProjectI>({
  project_name: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    trim: true,
  },
  logo: {
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
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Company",
  },
  project_manager: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  status: {
    type: String,
    enum: ["BackLog", "Todo", "In Progress", "Done", "Completed"],
    default: "BackLog",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  customers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  team_members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  followers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  approval: {
    type: String,
    enum: ["Satisfactory", "Unsatisfactory"],
  },
  attach_files: [AttachFiles],
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

export default mongoose.model<ProjectI>("Project", ProjectSchema);
