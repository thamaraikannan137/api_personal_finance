import mongoose, { Schema, Document } from "mongoose";

export interface IPersonAsset {
  refNo?: string;
  heldWith?: string;
  dateOfInvestment?: Date;
  valueAtCost?: number;
  soldAmount?: number;
  presentValue?: number;
  maturityValue?: number;
}

export interface IFamilySection {
  self?: IPersonAsset;
  spouse?: IPersonAsset;
  children?: IPersonAsset;
  total?: number;
}

export interface IShareRow {
  companyName?: string;
  refNo?: string;
  heldWith?: string;
  dateOfInvestment?: Date;
  quantity?: number;
  valueAtCost?: number;
  soldAmount?: number;
  presentValue?: number;
}

export interface IGoldRow {
  description?: string;
  heldBy?: "self" | "spouse" | "children";
  weightGrams?: number;
  valueAtCost?: number;
  presentValue?: number;
}

export interface IInsurancePolicy {
  policyName?: string;
  policyNo?: string;
  heldWith?: string;
  sumAssured?: number;
  premiumPaid?: number;
  surrenderValue?: number;
}

export interface IInsuranceSection {
  self?: IInsurancePolicy[];
  spouse?: IInsurancePolicy[];
  children?: IInsurancePolicy[];
  total?: number;
}

export interface IVehicleRow {
  vehicleNo?: string;
  make?: string;
  model?: string;
  yearOfPurchase?: number;
  valueAtCost?: number;
  presentValue?: number;
}

export interface IVehiclesSection {
  twoWheelers?: IVehicleRow[];
  fourWheelers?: IVehicleRow[];
  total?: number;
}

export interface IFirmRow {
  firmName?: string;
  natureOfBusiness?: string;
  dateOfInvestment?: Date;
  capitalInvested?: number;
  presentValue?: number;
}

export interface IHufSection {
  hufName?: string;
  valueAtCost?: number;
  presentValue?: number;
  total?: number;
}

export interface IAnnexure2MovableProperty extends Document {
  _id: mongoose.Types.ObjectId;
  certificateId: mongoose.Types.ObjectId;
  ppf: IFamilySection;
  pensionScheme: IFamilySection;
  huf: IHufSection;
  shares: IShareRow[];
  sharesTotal: number;
  fixedDeposit: IFamilySection;
  recurringDeposit: IFamilySection;
  otherDeposit: IFamilySection;
  goldAndJewellery: IGoldRow[];
  goldAndJewelleryTotal: number;
  insurancePolicies: IInsuranceSection;
  vehicles: IVehiclesSection;
  investmentInFirms: IFirmRow[];
  investmentInFirmsTotal: number;
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const personAssetSchema = new Schema<IPersonAsset>(
  {
    refNo: { type: String, trim: true },
    heldWith: { type: String, trim: true },
    dateOfInvestment: { type: Date },
    valueAtCost: { type: Number, default: 0 },
    soldAmount: { type: Number, default: 0 },
    presentValue: { type: Number, default: 0 },
    maturityValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const familySectionSchema = new Schema<IFamilySection>(
  {
    self: { type: personAssetSchema },
    spouse: { type: personAssetSchema },
    children: { type: personAssetSchema },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const shareRowSchema = new Schema<IShareRow>({
  companyName: { type: String, trim: true },
  refNo: { type: String, trim: true },
  heldWith: { type: String, trim: true },
  dateOfInvestment: { type: Date },
  quantity: { type: Number, default: 0 },
  valueAtCost: { type: Number, default: 0 },
  soldAmount: { type: Number, default: 0 },
  presentValue: { type: Number, default: 0 },
});

const goldRowSchema = new Schema<IGoldRow>({
  description: { type: String, trim: true },
  heldBy: { type: String, enum: ["self", "spouse", "children"] },
  weightGrams: { type: Number, default: 0 },
  valueAtCost: { type: Number, default: 0 },
  presentValue: { type: Number, default: 0 },
});

const insurancePolicySchema = new Schema<IInsurancePolicy>(
  {
    policyName: { type: String, trim: true },
    policyNo: { type: String, trim: true },
    heldWith: { type: String, trim: true },
    sumAssured: { type: Number, default: 0 },
    premiumPaid: { type: Number, default: 0 },
    surrenderValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const insuranceSectionSchema = new Schema<IInsuranceSection>(
  {
    self: { type: [insurancePolicySchema], default: [] },
    spouse: { type: [insurancePolicySchema], default: [] },
    children: { type: [insurancePolicySchema], default: [] },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const vehicleRowSchema = new Schema<IVehicleRow>(
  {
    vehicleNo: { type: String, trim: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    yearOfPurchase: { type: Number },
    valueAtCost: { type: Number, default: 0 },
    presentValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const vehiclesSectionSchema = new Schema<IVehiclesSection>(
  {
    twoWheelers: { type: [vehicleRowSchema], default: [] },
    fourWheelers: { type: [vehicleRowSchema], default: [] },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const firmRowSchema = new Schema<IFirmRow>({
  firmName: { type: String, trim: true },
  natureOfBusiness: { type: String, trim: true },
  dateOfInvestment: { type: Date },
  capitalInvested: { type: Number, default: 0 },
  presentValue: { type: Number, default: 0 },
});

const hufSectionSchema = new Schema<IHufSection>(
  {
    hufName: { type: String, trim: true },
    valueAtCost: { type: Number, default: 0 },
    presentValue: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const annexure2Schema = new Schema<IAnnexure2MovableProperty>(
  {
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: "NetWorthCertificate",
      required: [true, "Certificate ID is required"],
      unique: true,
      index: true,
    },
    ppf: { type: familySectionSchema, default: () => ({}) },
    pensionScheme: { type: familySectionSchema, default: () => ({}) },
    huf: { type: hufSectionSchema, default: () => ({}) },
    shares: { type: [shareRowSchema], default: [] },
    sharesTotal: { type: Number, default: 0 },
    fixedDeposit: { type: familySectionSchema, default: () => ({}) },
    recurringDeposit: { type: familySectionSchema, default: () => ({}) },
    otherDeposit: { type: familySectionSchema, default: () => ({}) },
    goldAndJewellery: { type: [goldRowSchema], default: [] },
    goldAndJewelleryTotal: { type: Number, default: 0 },
    insurancePolicies: { type: insuranceSectionSchema, default: () => ({}) },
    vehicles: { type: vehiclesSectionSchema, default: () => ({}) },
    investmentInFirms: { type: [firmRowSchema], default: [] },
    investmentInFirmsTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "annexure2_movable_properties",
  }
);

const Annexure2MovableProperty = mongoose.model<IAnnexure2MovableProperty>(
  "Annexure2MovableProperty",
  annexure2Schema
);

export default Annexure2MovableProperty;
