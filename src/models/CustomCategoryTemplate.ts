import mongoose, { Schema, Document } from "mongoose";

export type CustomCategoryType = "asset" | "liability";

export interface ICustomCategoryField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

export interface ICustomCategoryTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  categoryType: CustomCategoryType;
  description?: string;
  icon?: string;
  fields: ICustomCategoryField[];
  createdAt: Date;
  updatedAt: Date;
}

const customCategoryFieldSchema = new Schema<ICustomCategoryField>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, required: true, trim: true, maxlength: 50 },
    required: { type: Boolean, default: false },
    placeholder: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const customCategoryTemplateSchema = new Schema<ICustomCategoryTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [1, "Name must be at least 1 character"],
      maxlength: [100, "Name must be less than 100 characters"],
    },
    categoryType: {
      type: String,
      enum: ["asset", "liability"],
      required: [true, "Category type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be less than 500 characters"],
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [100, "Icon must be less than 100 characters"],
    },
    fields: {
      type: [customCategoryFieldSchema],
      validate: [
        (fields: ICustomCategoryField[]) => Array.isArray(fields) && fields.length > 0,
        "At least one custom field is required",
      ],
    },
  },
  {
    timestamps: true,
    collection: "custom_category_templates",
  }
);

customCategoryTemplateSchema.index(
  { userId: 1, categoryType: 1, name: 1 },
  { unique: true }
);

customCategoryTemplateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

customCategoryTemplateSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

const CustomCategoryTemplate = mongoose.model<ICustomCategoryTemplate>(
  "CustomCategoryTemplate",
  customCategoryTemplateSchema
);

export default CustomCategoryTemplate;


