import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  company : {
    type : String,
    ref : 'Company'
  },
  phone: {
    type: String,
  },
  inquiryType : {
    type : String
  },
  email: {
    type: String,
  },
  hearFrom: {
    type: String,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model("Contact", contactSchema);
