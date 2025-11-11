import mongoose, { Schema, Document } from "mongoose";

export interface ILiability extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string; // Flexible - accepts any category string
  balance: number;
  interestRate?: number;
  dueDate?: string;
  institution?: string;
  owner: string;
  notes?: string;
  customFields?: {
    id: string;
    name: string;
    type: string;
    value: string | number | null;
    required: boolean;
  }[];
  customCategoryName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const liabilitySchema = new Schema<ILiability>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Liability name is required"],
      trim: true,
      minlength: [1, "Name must be at least 1 character"],
      maxlength: [100, "Name must be less than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      // No enum - allows any category including custom ones
    },
    balance: {
      type: Number,
      required: [true, "Balance is required"],
      min: [0, "Balance must be positive"],
    },
    interestRate: {
      type: Number,
      min: [0, "Interest rate must be positive"],
      max: [100, "Interest rate must be less than 100"],
    },
    dueDate: {
      type: String,
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [100, "Institution name must be less than 100 characters"],
    },
    owner: {
      type: String,
      required: [true, "Owner is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must be less than 500 characters"],
    },
    customFields: [{
      id: String,
      name: String,
      type: String,
      value: Schema.Types.Mixed,
      required: Boolean,
    }],
    customCategoryName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "liabilities",
  }
);

// Create indexes for better query performance
liabilitySchema.index({ userId: 1, category: 1 });
liabilitySchema.index({ userId: 1, createdAt: -1 });

const Liability = mongoose.model<ILiability>("Liability", liabilitySchema);

export default Liability;

