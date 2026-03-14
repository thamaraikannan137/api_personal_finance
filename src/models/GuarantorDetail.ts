import mongoose, { Schema, Document } from "mongoose";

export interface IGuarantorItem {
  _id?: mongoose.Types.ObjectId;
  guaranteedTo?: string;
  borrowingsBy?: string;
  purpose?: string;
  amountGuaranteed?: number;
}

export interface IGuarantorDetail extends Document {
  _id: mongoose.Types.ObjectId;
  certificateId: mongoose.Types.ObjectId;
  items: IGuarantorItem[];
  createdAt: Date;
  updatedAt: Date;
}

const guarantorItemSchema = new Schema<IGuarantorItem>({
  guaranteedTo: { type: String, trim: true },
  borrowingsBy: { type: String, trim: true },
  purpose: {
    type: String,
    enum: ["Term Loan", "Vehicles", "Cash Credit", "Other"],
    trim: true,
  },
  amountGuaranteed: { type: Number, default: 0 },
});

const guarantorDetailSchema = new Schema<IGuarantorDetail>(
  {
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: "NetWorthCertificate",
      required: [true, "Certificate ID is required"],
      unique: true,
      index: true,
    },
    items: { type: [guarantorItemSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "guarantor_details",
  }
);

const GuarantorDetail = mongoose.model<IGuarantorDetail>(
  "GuarantorDetail",
  guarantorDetailSchema
);

export default GuarantorDetail;
