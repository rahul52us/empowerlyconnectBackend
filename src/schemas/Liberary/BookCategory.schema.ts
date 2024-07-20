import mongoose, { Schema, Document } from "mongoose";

export interface BookCategoryI extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookCategorySchema: Schema<BookCategoryI> = new Schema<BookCategoryI>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    trim: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date
  }
});

const BookCategoryModel = mongoose.model<BookCategoryI>("BookCategory", BookCategorySchema);
export default BookCategoryModel;
