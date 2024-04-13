import mongoose, { Schema, Document } from "mongoose";

interface DocumentInfo {
  name: string;
  url: string;
  type: string;
  validTill?: Date;
  effectiveFrom?: Date;
}

export interface DocumentInterface extends Document {
  user: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  companyOrg: mongoose.Schema.Types.ObjectId;
  documents: {
    [key: string]: DocumentInfo;
  };
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DocumentSchema: Schema<DocumentInterface> = new Schema<DocumentInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    companyOrg: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    documents: {
      type: Map,
      of: {
        name: String,
        url: String,
        type: String,
        validTill: Date,
        effectiveFrom: Date,
      },
      default: {},
    },
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
  }
);

const DocumentModel = mongoose.model<DocumentInterface>(
  "Document",
  DocumentSchema
);

export default DocumentModel;
