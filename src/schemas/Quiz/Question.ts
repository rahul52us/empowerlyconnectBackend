import mongoose from "mongoose";

const QuizQuestionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },
  question: {
    type: String,
    trim: true,
    required: true
  },
  questionType: {
    type: String,
    enum: ["text", "image", "video"],
    default: "text",
  },
  answers: [{
    answerType: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    answer: {
      type: String,
      trim: true,
      required: true,
    },
    correct: {
      type: Boolean,
      default: false,
      required: true,
    },
  }],
  explanation: {
    type: String,
    trim: true,
  },
  difficultyLevel: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  tags: [{
    type: String,
    trim: true,
  }],
  analytics: {
    attempts: {
      type: Number,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

QuizQuestionSchema.index({ question: "text", tags: "text" });

export default mongoose.model("QuizQuestion", QuizQuestionSchema);
