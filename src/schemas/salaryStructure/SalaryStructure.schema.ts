import mongoose, { Document, Schema } from 'mongoose';

interface Component {
  name: string;
  monthlyValue: number;
  yearlyValue: number;
  frequency: 'Monthly' | 'Yearly';
}

interface SalaryStructureDocument extends Document {
  components: Component[];
  gross: {
    monthlyValue: number;
    yearlyValue: number;
  };
  ctc: {
    monthlyValue: number;
    yearlyValue: number;
  };
  inHandSalary: {
    monthlyValue: number;
    yearlyValue: number;
  };
  remark : String;
  effectiveFrom: Date;
  disbursementFrom: Date;
  createdAt:Date;
  updatedAt:Date;
}

const componentSchema = new Schema<Component>({
  name: { type: String, required: true },
  monthlyValue: { type: Number, required: true },
  yearlyValue: { type: Number, required: true },
  frequency: { type: String, enum: ['Monthly', 'Yearly'], required: true },
});

const salaryStructureSchema = new Schema<SalaryStructureDocument>({
  components: [componentSchema],
  gross: {
    monthlyValue: { type: Number, required: true },
    yearlyValue: { type: Number, required: true },
  },
  ctc: {
    monthlyValue: { type: Number, required: true },
    yearlyValue: { type: Number, required: true },
  },
  inHandSalary: {
    monthlyValue: { type: Number, required: true },
    yearlyValue: { type: Number, required: true },
  },
  effectiveFrom: { type: Date, required: true },
  disbursementFrom: { type: Date, required: true },
  remark : {
    type : String
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  }
}
);

const SalaryStructureSchema = mongoose.model<SalaryStructureDocument>('SalaryStructure', salaryStructureSchema);

export default SalaryStructureSchema;