import mongoose, { Schema, Document } from "mongoose";

export interface VideoI extends Document {
  title: string;
  company: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  category:mongoose.Schema.Types.ObjectId;
  thumbnail:string;
  details: string;
  description?: string;
  videoLink: string;
  videoType?: string;
  discountPrice: string;
  originalPrice: string;
  pricingType: string;
  amountType: string;
  rating: string;
  createdAt : Date,
  updatedAt : Date,
  deletedAt : Date
}

export const VideoSchema = new Schema<VideoI>(
  {
    title: {
      type: String,
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoCategory",
      required: true,
    },

    thumbnail : {
      type : String,
      trim : true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    details : {
      type : String,
      trim : true
    },

    videoLink: {
      type: String,
      trim: true,
    },

    videoType: {
      type: String,
      required: true,
      default: "youtube",
    },

    discountPrice: {
      type: String,
      trim: true,
    },

    originalPrice: {
      type: String,
      trim: true,
    },

    rating: {
      type: String,
      trim: true,
      default:'2'
    },

    amountType: {
      type: String,
      trim: true,
      default:'Rs'
    },

    pricingType: {
      type: String,
      enum: ["paid", "free"],
      default: "free",
    },
    createdAt : {
      type : Date,
      default : new Date()
    },
    updatedAt : {
      type : Date
    },
    deletedAt : {
      type : Date
    }
  },
);

export default mongoose.model<VideoI>("Video", VideoSchema);
