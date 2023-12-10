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