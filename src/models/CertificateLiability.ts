import mongoose, { Schema, Document } from "mongoose";

export interface ILiabilityItem {
  _id?: mongoose.Types.ObjectId;
  borrowedFrom?: string;
  amountBorrowed?: number;
  securitiesOffered?: string;
  purpose?: string;
  outstandingAmount?: number;
}

export interface ICertificateLiability extends Document {
  _id: mongoose.Types.ObjectId;
  certificateId: mongoose.Types.ObjectId;
  items: ILiabilityItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const liabilityItemSchema = new Schema<ILiabilityItem>({
  borrowedFrom: { type: String, trim: true },
  amountBorrowed: { type: Number, default: 0 },
  securitiesOffered: { type: String, trim: true },
  purpose: {
    type: String,
    enum: ["Housing", "Vehicle", "Business", "Personal", "Other"],
    trim: true,
  },
  outstandingAmount: { type: Number, default: 0 },
});

const certificateLiabilitySchema = new Schema<ICertificateLiability>(
  {
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: "NetWorthCertificate",
      required: [true, "Certificate ID is required"],
      unique: true,
      index: true,
    },
    items: { type: [liabilityItemSchema], default: [] },
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "certificate_liabilities",
  }
);

const CertificateLiability = mongoose.model<ICertificateLiability>(
  "CertificateLiability",
  certificateLiabilitySchema
);

export default CertificateLiability;
