import mongoose, { Schema, Document } from "mongoose";

export interface LibraryBookI extends Document {
  title: string;
  user:mongoose.Schema.Types.ObjectId,
  company: mongoose.Schema.Types.ObjectId,
  author: string;
  isbn: string;
  publishedDate?: Date;
  categories: Schema.Types.ObjectId[];
  language: string;
  numberOfPages?: number;
  availableCopies: number;
  totalCopies: number;
  shelfLocation?: string;
  publisher?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  isAvailable?: boolean;
  description?: string;
  coverImage?: any;
  ratings?: {
    userId: Schema.Types.ObjectId;
    rating: number;
    review?: string;
  }[];
  tags?: string[];
  edition?: string;
  isReferenceOnly?: boolean;
}

// Mongoose schema definition
const LibraryBookSchema: Schema<LibraryBookI> = new Schema<LibraryBookI>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required:true
  },
  company : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Company',
    required:true
  },
  isbn: {
    type: String,
    required: true,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'BookCategory'
  }],
  language: {
    type: String,
    required: true,
    trim: true
  },
  numberOfPages: {
    type: Number
  },
  availableCopies: {
    type: Number,
    default: 0
  },
  totalCopies: {
    type: Number,
    default:1
  },
  shelfLocation: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    trim: true
  },
  coverImage: {
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
  ratings: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String, trim: true }
    }
  ],
  tags: {
    type: [String],
    default: []
  },
  edition: {
    type: String,
    trim: true
  },
  isReferenceOnly: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  },
});

LibraryBookSchema.index({ title: 1, author: 1 });

const LibraryBookModel = mongoose.model<LibraryBookI>("LibraryBook", LibraryBookSchema);
export default LibraryBookModel;
