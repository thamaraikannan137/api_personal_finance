import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;
  auditorId: mongoose.Types.ObjectId;
  name: string;
  pan?: string;
  dateOfBirth?: Date;
  permanentAddress?: IAddress;
  officeAddress?: IAddress;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const clientSchema = new Schema<IClient>(
  {
    auditorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Auditor ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: [200, "Name must be less than 200 characters"],
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
    },
    dateOfBirth: { type: Date },
    permanentAddress: { type: addressSchema },
    officeAddress: { type: addressSchema },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

clientSchema.index({ auditorId: 1, pan: 1 }, { unique: true, sparse: true });
clientSchema.index({ auditorId: 1, name: 1 });

const Client = mongoose.model<IClient>("Client", clientSchema);

export default Client;
