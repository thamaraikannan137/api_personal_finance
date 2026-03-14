import mongoose, { Schema, Document } from "mongoose";

export interface ILoanSource {
  bankName?: string;
  loanAmountReceived?: number;
  sanctionLetterRef?: string;
  dateOfLoanReceived?: Date;
  outstandingLoanAmount?: number;
}

export interface IOtherSources {
  salary?: number;
  withdrawalFromSB?: number;
  withdrawalFromFD?: number;
  otherSource?: number;
  totalOtherSources?: number;
}

export interface IPropertyRow {
  _id?: mongoose.Types.ObjectId;
  natureOfProperty?: string;
  locationAddress?: string;
  dateOfPurchase?: Date;
  propertyCost?: number;
  registrationCharges?: number;
  stampCharges?: number;
  vendorName?: string;
  vendorPan?: string;
  valueAtCost?: number;
  loanSource?: ILoanSource;
  otherSources?: IOtherSources;
  totalSourceOfFund?: number;
  sharingPersonName?: string;
  sharingPersonPan?: string;
  sharePercentage?: number;
}

export interface IAnnexure1ImmovableProperty extends Document {
  _id: mongoose.Types.ObjectId;
  certificateId: mongoose.Types.ObjectId;
  bySelf: IPropertyRow[];
  bySharing: IPropertyRow[];
  totalBySelf: number;
  totalBySharing: number;
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanSourceSchema = new Schema<ILoanSource>(
  {
    bankName: { type: String, trim: true },
    loanAmountReceived: { type: Number, default: 0 },
    sanctionLetterRef: { type: String, trim: true },
    dateOfLoanReceived: { type: Date },
    outstandingLoanAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const otherSourcesSchema = new Schema<IOtherSources>(
  {
    salary: { type: Number, default: 0 },
    withdrawalFromSB: { type: Number, default: 0 },
    withdrawalFromFD: { type: Number, default: 0 },
    otherSource: { type: Number, default: 0 },
    totalOtherSources: { type: Number, default: 0 },
  },
  { _id: false }
);

const propertyRowSchema = new Schema<IPropertyRow>({
  natureOfProperty: {
    type: String,
    enum: ["Flat", "Land", "Shop", "Factory", "House", "Other"],
    trim: true,
  },
  locationAddress: { type: String, trim: true },
  dateOfPurchase: { type: Date },
  propertyCost: { type: Number, default: 0 },
  registrationCharges: { type: Number, default: 0 },
  stampCharges: { type: Number, default: 0 },
  vendorName: { type: String, trim: true },
  vendorPan: { type: String, trim: true, uppercase: true },
  valueAtCost: { type: Number, default: 0 },
  loanSource: { type: loanSourceSchema },
  otherSources: { type: otherSourcesSchema },
  totalSourceOfFund: { type: Number, default: 0 },
  sharingPersonName: { type: String, trim: true },
  sharingPersonPan: { type: String, trim: true, uppercase: true },
  sharePercentage: { type: Number, min: 0, max: 100 },
});

const annexure1Schema = new Schema<IAnnexure1ImmovableProperty>(
  {
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: "NetWorthCertificate",
      required: [true, "Certificate ID is required"],
      unique: true,
      index: true,
    },
    bySelf: { type: [propertyRowSchema], default: [] },
    bySharing: { type: [propertyRowSchema], default: [] },
    totalBySelf: { type: Number, default: 0 },
    totalBySharing: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "annexure1_immovable_properties",
  }
);

const Annexure1ImmovableProperty = mongoose.model<IAnnexure1ImmovableProperty>(
  "Annexure1ImmovableProperty",
  annexure1Schema
);

export default Annexure1ImmovableProperty;
