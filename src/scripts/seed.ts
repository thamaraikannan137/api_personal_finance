/**
 * Seed script: inserts sample data into MongoDB for personal finance API.
 * Run: npm run seed (with MongoDB running and MONGODB_URI set in .env)
 *
 * For Docker MongoDB (root/password): use
 * MONGODB_URI=mongodb://root:password@localhost:27017/personal_finance?authSource=admin
 */

import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";
import { USER_ROLES } from "../config/constants.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import NetWorthCertificate from "../models/NetWorthCertificate.js";
import Annexure1ImmovableProperty from "../models/Annexure1ImmovableProperty.js";
import Annexure2MovableProperty from "../models/Annexure2MovableProperty.js";
import CertificateLiability from "../models/CertificateLiability.js";
import GuarantorDetail from "../models/GuarantorDetail.js";

async function seed() {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB. Seeding...\n");

    // Clear existing data
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    for (const { name } of collections) {
      if (["users", "clients", "net_worth_certificates", "annexure1_immovable_properties", "annexure2_movable_properties", "certificate_liabilities", "guarantor_details"].includes(name)) {
        await db.collection(name).deleteMany({});
        console.log(`  Cleared collection: ${name}`);
      }
    }

    // 1. Users — single login user, all data belongs to this account
    const adminPassword = await hashPassword("Admin@123");

    const admin = await User.create({
      email: "admin@example.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: USER_ROLES.USER,
      isActive: true,
    });
    console.log("  Created user: admin@example.com / Admin@123");

    // 2. Clients (all linked to admin)
    const client1 = await Client.create({
      auditorId: admin._id,
      name: "Rajesh Mehta",
      pan: "ABCDE1234F",
      dateOfBirth: new Date("1985-06-15"),
      permanentAddress: {
        line1: "12, Gandhi Nagar",
        line2: "Near Central Park",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
      },
      officeAddress: {
        line1: "Tower A, 5th Floor",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600032",
      },
      email: "rajesh.mehta@email.com",
      phone: "9876543210",
      isActive: true,
    });
    const client2 = await Client.create({
      auditorId: admin._id,
      name: "Sunita Reddy",
      pan: "FGHIJ5678K",
      dateOfBirth: new Date("1990-03-22"),
      permanentAddress: {
        line1: "45, MG Road",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
      },
      email: "sunita.reddy@email.com",
      phone: "9123456789",
      isActive: true,
    });
    const client3 = await Client.create({
      auditorId: admin._id,
      name: "Vikram Singh",
      pan: "KLMNO9012P",
      dateOfBirth: new Date("1982-11-08"),
      permanentAddress: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
      email: "vikram.singh@email.com",
      phone: "9988776655",
      isActive: true,
    });
    console.log("  Created 3 clients.");

    // 3. Net worth certificates
    const cert1 = await NetWorthCertificate.create({
      clientId: client1._id,
      auditorId: admin._id,
      financialYear: "FY 2024-25",
      asOnDate: new Date("2024-03-31"),
      status: "finalized",
      totalImmovableProperty: 8500000,
      totalMovableProperty: 2270000,
      totalLiabilities: 2000000,
      netWorth: 8770000,
      netWorthInWords: "Eighty Seven Lakh Seventy Thousand Only",
      finalizedAt: new Date(),
    });
    const cert2 = await NetWorthCertificate.create({
      clientId: client1._id,
      auditorId: admin._id,
      financialYear: "FY 2023-24",
      asOnDate: new Date("2023-03-31"),
      status: "draft",
      totalImmovableProperty: 7500000,
      totalMovableProperty: 420000,
      totalLiabilities: 1800000,
      netWorth: 6120000,
    });
    const cert3 = await NetWorthCertificate.create({
      clientId: client2._id,
      auditorId: admin._id,
      financialYear: "FY 2024-25",
      asOnDate: new Date("2024-03-31"),
      status: "draft",
      totalImmovableProperty: 5000000,
      totalMovableProperty: 50000,
      totalLiabilities: 500000,
      netWorth: 4550000,
    });
    const cert4 = await NetWorthCertificate.create({
      clientId: client3._id,
      auditorId: admin._id,
      financialYear: "FY 2024-25",
      asOnDate: new Date("2024-03-31"),
      status: "draft",
      totalImmovableProperty: 3500000,
      totalMovableProperty: 350000,
      totalLiabilities: 800000,
      netWorth: 3050000,
    });
    console.log("  Created 4 net worth certificates.");

    // 4. Annexure1 – Immovable property (one per certificate)
    await Annexure1ImmovableProperty.create({
      certificateId: cert1._id,
      bySelf: [
        {
          natureOfProperty: "Flat",
          locationAddress: "Tower B, Green Valley, Chennai",
          dateOfPurchase: new Date("2020-01-15"),
          propertyCost: 5000000,
          registrationCharges: 250000,
          stampCharges: 150000,
          valueAtCost: 5400000,
          loanSource: {
            bankName: "HDFC Bank",
            loanAmountReceived: 3000000,
            outstandingLoanAmount: 2000000,
          },
          otherSources: {
            salary: 2000000,
            totalOtherSources: 2000000,
          },
          totalSourceOfFund: 5400000,
        },
        {
          natureOfProperty: "Land",
          locationAddress: "Plot 12, OMR Road, Chennai",
          dateOfPurchase: new Date("2019-06-01"),
          propertyCost: 2500000,
          valueAtCost: 3100000,
          totalSourceOfFund: 3100000,
        },
      ],
      bySharing: [],
      totalBySelf: 8500000,
      totalBySharing: 0,
      grandTotal: 8500000,
    });
    await Annexure1ImmovableProperty.create({
      certificateId: cert2._id,
      bySelf: [
        {
          natureOfProperty: "House",
          locationAddress: "45, Gandhi Nagar, Chennai",
          dateOfPurchase: new Date("2018-03-10"),
          propertyCost: 6000000,
          valueAtCost: 7500000,
          totalSourceOfFund: 7500000,
        },
      ],
      bySharing: [],
      totalBySelf: 7500000,
      totalBySharing: 0,
      grandTotal: 7500000,
    });
    await Annexure1ImmovableProperty.create({
      certificateId: cert3._id,
      bySelf: [
        {
          natureOfProperty: "Flat",
          locationAddress: "Whitefield, Bangalore",
          dateOfPurchase: new Date("2021-08-20"),
          propertyCost: 4500000,
          valueAtCost: 5000000,
          totalSourceOfFund: 5000000,
        },
      ],
      bySharing: [],
      totalBySelf: 5000000,
      totalBySharing: 0,
      grandTotal: 5000000,
    });
    await Annexure1ImmovableProperty.create({
      certificateId: cert4._id,
      bySelf: [
        {
          natureOfProperty: "House",
          locationAddress: "Bandra West, Mumbai",
          dateOfPurchase: new Date("2017-05-12"),
          propertyCost: 3000000,
          registrationCharges: 150000,
          stampCharges: 100000,
          valueAtCost: 3500000,
          loanSource: {
            bankName: "Axis Bank",
            loanAmountReceived: 1500000,
            outstandingLoanAmount: 800000,
          },
          otherSources: {
            salary: 2350000,
            totalOtherSources: 2350000,
          },
          totalSourceOfFund: 3500000,
        },
      ],
      bySharing: [],
      totalBySelf: 3500000,
      totalBySharing: 0,
      grandTotal: 3500000,
    });
    console.log("  Created Annexure1 (immovable property) for each certificate.");

    // 5. Annexure2 – Movable property
    await Annexure2MovableProperty.create({
      certificateId: cert1._id,
      ppf: {
        self: { refNo: "PPF/001", heldWith: "SBI", valueAtCost: 500000, presentValue: 520000 },
        total: 520000,
      },
      pensionScheme: { total: 0 },
      huf: { total: 0 },
      shares: [
        { companyName: "Reliance", refNo: "RIL-001", quantity: 50, valueAtCost: 120000, presentValue: 150000 },
      ],
      sharesTotal: 150000,
      fixedDeposit: {
        self: { refNo: "FD/001", heldWith: "HDFC", valueAtCost: 300000, presentValue: 320000 },
        total: 320000,
      },
      recurringDeposit: { total: 0 },
      otherDeposit: { total: 0 },
      goldAndJewellery: [
        { description: "Gold necklace", heldBy: "self", weightGrams: 50, valueAtCost: 250000, presentValue: 280000 },
      ],
      goldAndJewelleryTotal: 280000,
      insurancePolicies: { total: 0 },
      vehicles: {
        fourWheelers: [
          { vehicleNo: "TN01AB1234", make: "Honda", model: "City", yearOfPurchase: 2022, valueAtCost: 1200000, presentValue: 1000000 },
        ],
        total: 1000000,
      },
      investmentInFirms: [],
      investmentInFirmsTotal: 0,
      grandTotal: 2270000,
    });
    await Annexure2MovableProperty.create({
      certificateId: cert2._id,
      ppf: { total: 0 },
      pensionScheme: { total: 0 },
      huf: { total: 0 },
      shares: [],
      sharesTotal: 0,
      fixedDeposit: { self: { valueAtCost: 400000, presentValue: 420000 }, total: 420000 },
      recurringDeposit: { total: 0 },
      otherDeposit: { total: 0 },
      goldAndJewellery: [],
      goldAndJewelleryTotal: 0,
      insurancePolicies: { total: 0 },
      vehicles: { total: 0 },
      investmentInFirms: [],
      investmentInFirmsTotal: 0,
      grandTotal: 420000,
    });
    await Annexure2MovableProperty.create({
      certificateId: cert3._id,
      ppf: { total: 0 },
      pensionScheme: { total: 0 },
      huf: { total: 0 },
      shares: [],
      sharesTotal: 0,
      fixedDeposit: { total: 0 },
      recurringDeposit: { total: 0 },
      otherDeposit: { total: 0 },
      goldAndJewellery: [],
      goldAndJewelleryTotal: 0,
      insurancePolicies: { total: 0 },
      vehicles: {
        twoWheelers: [
          { vehicleNo: "KA02CD5678", make: "Hero", model: "Splendor", yearOfPurchase: 2020, valueAtCost: 60000, presentValue: 50000 },
        ],
        total: 50000,
      },
      investmentInFirms: [],
      investmentInFirmsTotal: 0,
      grandTotal: 50000,
    });
    await Annexure2MovableProperty.create({
      certificateId: cert4._id,
      ppf: { total: 0 },
      pensionScheme: { total: 0 },
      huf: { total: 0 },
      shares: [
        { companyName: "TCS", refNo: "TCS-002", quantity: 20, valueAtCost: 150000, presentValue: 180000 },
      ],
      sharesTotal: 180000,
      fixedDeposit: {
        self: { refNo: "FD/VK-01", heldWith: "Axis Bank", valueAtCost: 100000, presentValue: 110000 },
        total: 110000,
      },
      recurringDeposit: { total: 0 },
      otherDeposit: { total: 0 },
      goldAndJewellery: [],
      goldAndJewelleryTotal: 0,
      insurancePolicies: { total: 0 },
      vehicles: {
        twoWheelers: [
          { vehicleNo: "MH01AB9999", make: "Honda", model: "Activa", yearOfPurchase: 2021, valueAtCost: 80000, presentValue: 60000 },
        ],
        total: 60000,
      },
      investmentInFirms: [],
      investmentInFirmsTotal: 0,
      grandTotal: 350000,
    });
    console.log("  Created Annexure2 (movable property) for each certificate.");

    // 6. Liabilities
    await CertificateLiability.create({
      certificateId: cert1._id,
      items: [
        {
          borrowedFrom: "HDFC Bank",
          amountBorrowed: 3000000,
          securitiesOffered: "Flat at Green Valley",
          purpose: "Housing",
          outstandingAmount: 2000000,
        },
      ],
      total: 2000000,
    });
    await CertificateLiability.create({
      certificateId: cert2._id,
      items: [
        {
          borrowedFrom: "SBI",
          amountBorrowed: 2000000,
          purpose: "Housing",
          outstandingAmount: 1800000,
        },
      ],
      total: 1800000,
    });
    await CertificateLiability.create({
      certificateId: cert3._id,
      items: [
        { borrowedFrom: "ICICI Bank", amountBorrowed: 600000, purpose: "Personal", outstandingAmount: 500000 },
      ],
      total: 500000,
    });
    await CertificateLiability.create({
      certificateId: cert4._id,
      items: [
        { borrowedFrom: "Axis Bank", amountBorrowed: 1500000, securitiesOffered: "House at Bandra", purpose: "Housing", outstandingAmount: 800000 },
      ],
      total: 800000,
    });
    console.log("  Created certificate liabilities.");

    // 7. Guarantor details
    await GuarantorDetail.create({
      certificateId: cert1._id,
      items: [
        {
          guaranteedTo: "State Bank",
          borrowingsBy: "ABC Pvt Ltd",
          purpose: "Term Loan",
          amountGuaranteed: 500000,
        },
      ],
    });
    await GuarantorDetail.create({
      certificateId: cert2._id,
      items: [],
    });
    await GuarantorDetail.create({
      certificateId: cert3._id,
      items: [
        {
          guaranteedTo: "HDFC Bank",
          borrowingsBy: "XYZ Associates",
          purpose: "Cash Credit",
          amountGuaranteed: 200000,
        },
      ],
    });
    await GuarantorDetail.create({
      certificateId: cert4._id,
      items: [],
    });
    console.log("  Created guarantor details.");

    console.log("\n✅ Seed completed. Sample data inserted into MongoDB.");
    console.log("\nLogin credentials:");
    console.log("  admin@example.com / Admin@123");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
    process.exit(0);
  }
}

seed();
