import mongoose, { Schema, Document } from "mongoose";

export interface UserInterface extends Document {
  name: string;
  username: string;
  pic: string;
  bio?: string;
  position?: string[];
  company: Schema.Types.ObjectId;
  profile_details: Schema.Types.ObjectId;
  is_active: boolean;
  role: string;
  password: string;
  deletedAt?:Date,
  createdAt?:Date,
  updatedAt?:Date
}

const UserSchema: Schema<UserInterface> = new Schema<UserInterface>(
  {
    name: { type: String, trim: true },
    username: { type: String, required: true, index: true, trim: true },
    pic: { type: String, trim: true },
    position: {type: Array},
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    bio: { type: String, trim: true },
    profile_details: { type: Schema.Types.ObjectId, ref: "ProfileDetails" },
    is_active: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "manager", "customer", "support"],
      default: "user",
    },
    password: { type: String, trim: true },
    deletedAt:{
      type : Date
    },
    createdAt:{
      type : Date,
      default : new Date()
    },
    updatedAt:{
      type : Date
    }
  }
);

const UserModel = mongoose.model<UserInterface>("User", UserSchema);

export default UserModel;
