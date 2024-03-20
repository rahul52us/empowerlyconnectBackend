import mongoose, { Schema, Document } from "mongoose";

export interface DocumentInterface extends Document {
  user: mongoose.Schema.Types.ObjectId;
  qualificationCertificate?: String;
  panCard?: any;
  aadharCard?: any;
  highMarksheet?: any;
  intermediateMarksheet?: any;
  passport?: any;
  drivingLicence?: any;
  graduationMarksheet?: any;
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
    qualificationCertificate: {
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
    panCard: {
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
    aadharCard: {
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
    highMarksheet: {
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
    intermediateMarksheet: {
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
    passport: {
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
    drivingLicence: {
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
    graduationMarksheet: {
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
