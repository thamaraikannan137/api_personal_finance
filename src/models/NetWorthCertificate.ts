import mongoose, { Schema, Document } from "mongoose";

export type CertificateStatus = "draft" | "finalized";

export interface INetWorthCertificate extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  auditorId: mongoose.Types.ObjectId;
  financialYear: string;
  asOnDate: Date;
  status: CertificateStatus;
  totalImmovableProperty: number;
  totalMovableProperty: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthInWords?: string;
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
}

const netWorthCertificateSchema = new Schema<INetWorthCertificate>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required"],
      index: true,
    },
    auditorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Auditor ID is required"],
      index: true,
    },
    financialYear: {
      type: String,
      required: [true, "Financial year is required"],
      trim: true,
      match: [/^FY \d{4}-\d{2}$/, "Financial year must be in format FY YYYY-YY"],
    },
    asOnDate: {
      type: Date,
      required: [true, "As on date is required"],
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
    totalImmovableProperty: { type: Number, default: 0 },
    totalMovableProperty: { type: Number, default: 0 },
    totalLiabilities: { type: Number, default: 0 },
    netWorth: { type: Number, default: 0 },
    netWorthInWords: { type: String, trim: true },
    finalizedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "net_worth_certificates",
  }
);

netWorthCertificateSchema.index(
  { clientId: 1, financialYear: 1 },
  { unique: true }
);

const NetWorthCertificate = mongoose.model<INetWorthCertificate>(
  "NetWorthCertificate",
  netWorthCertificateSchema
);

export default NetWorthCertificate;
