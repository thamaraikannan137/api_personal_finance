import mongoose, { Schema, Document } from "mongoose";
import type { UserRole } from "../config/constants.js";
import { USER_ROLES } from "../config/constants.js";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [100, "Password must be less than 100 characters"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name must be at least 1 character"],
      maxlength: [50, "First name must be less than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name must be at least 1 character"],
      maxlength: [50, "Last name must be less than 50 characters"],
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Create index on email for better query performance
userSchema.index({ email: 1 }, { unique: true });

// Export model
const User = mongoose.model<IUser>("User", userSchema);

export default User;