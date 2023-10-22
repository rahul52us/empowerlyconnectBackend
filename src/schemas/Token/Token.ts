import mongoose, { Schema, Document } from "mongoose";

export interface IEmailToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: string;
  createdAt: Date;
}

const Token: Schema<IEmailToken> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24vh",
  },
});

export default mongoose.model<IEmailToken>(
  "Token",
  Token
);