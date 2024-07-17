import mongoose, { Document, Schema } from "mongoose";

interface SubtaskI extends Document {
  title: string;
  description?: mongoose.Schema.Types.Mixed;
  status: string;
  createdBy : mongoose.Schema.Types.ObjectId;
  duedate?: Date;
  startDate?: Date;
  endDate?: Date;
  assignee?: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt:Date;
}

interface CommentI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt:Date;
  deletedAt:Date
}

interface ActivityLogI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  action: string;
  createdAt: Date;
  updatedAt:Date;
  deletedAt:Date
}

interface TaskI extends Document {
  projectId: mongoose.Schema.Types.ObjectId;
  title: string;
  createdBy?: mongoose.Schema.Types.ObjectId;
  description?: mongoose.Schema.Types.Mixed;
  assignee?: mongoose.Schema.Types.ObjectId[];
  assigner: mongoose.Schema.Types.ObjectId;
  status: string;
  priority?: string;
  duedate?: Date;
  startDate?: Date;
  endDate?: Date;
  subtasks?: SubtaskI[];
  comments?: CommentI[];
  activityLog?: ActivityLogI[];
  labels?: string[];
  dependencies?: mongoose.Schema.Types.ObjectId[];
  reminders?: Date[];
  attach_files?: any[];
  approval?: string;
  progress?: number;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt:Date;
  deletedAt:Date
}

// Schemas for Subtask, Comment, and Activity Log
const SubtaskSchema = new Schema<SubtaskI>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required : true
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Backlog", "To Do", "In Progress", "Done"],
      default: "Backlog",
    },
    duedate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    assignee: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    createdAt : {
      type : Date,
      default : new Date()
    },
    updatedAt : {
      type : Date
    }
  },
);

const CommentSchema = new Schema<CommentI>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt :{
      type : Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    },
    deletedAt:{
      type : Date
    }
  },
);

const ActivityLogSchema = new Schema<ActivityLogI>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    createdAt :{
      type : Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    },
    deletedAt:{
      type : Date
    }
  },
);

// Main Task Schema
const TaskSchema = new Schema<TaskI>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User',
      required : true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      trim: true,
    },
    assignee: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    assigner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reminders: [Date],
    status: {
      type: String,
      enum: ["Backlog", "To Do", "In Progress", "Done"],
      default: "Backlog",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    duedate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    subtasks: [SubtaskSchema],
    comments: [CommentSchema],
    activityLog: [ActivityLogSchema],
    labels: [String],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }],
    approval: {
      type: String,
      enum: ["Satisfactory", "Unsatisfactory"],
    },
    attach_files: [{
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
    }],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    createdAt :{
      type : Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    },
    deletedAt:{
      type : Date
    }
  }
);

TaskSchema.index({ projectId: 1, title: 1 });

export default mongoose.model<TaskI>("Task", TaskSchema);
