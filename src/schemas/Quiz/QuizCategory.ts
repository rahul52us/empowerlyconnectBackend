import mongoose from "mongoose";

const QuizCategorySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    quiz : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Quiz'
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt:{
      type : Date,
      default: new Date()
    },
    updatedAt:{
      type : Date
    }
  },
);

export default mongoose.model("QuizCategory", QuizCategorySchema);