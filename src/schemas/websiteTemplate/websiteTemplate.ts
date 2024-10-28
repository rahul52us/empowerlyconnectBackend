import mongoose, { Schema, Document } from "mongoose";

interface WebsiteTemplateI extends Document {
    user: mongoose.Schema.Types.ObjectId;
    company: mongoose.Schema.Types.ObjectId;
    deletedAt?: Date;
    is_active: boolean;
    name: string;
    sectionLayouts: any;
    sections: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    websiteInfo: {
        links?: { [key: string]: string };
        logo?: string;
        colors?:mongoose.Schema.Types.Mixed
    };
}

const WebsiteTemplate = new Schema<WebsiteTemplateI>({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
    is_active: { type: Boolean, default: true },
    sectionLayouts: { type: [Schema.Types.Mixed], default: [] },
    sections: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    deletedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date},
    websiteInfo: {
        links: { type: mongoose.Schema.Types.Mixed, default: {} },
        logo: { type: String, default: '' },
        colors: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
});


export default mongoose.model<WebsiteTemplateI>('WebsiteTemplate', WebsiteTemplate);
