import mongoose from "mongoose";
import NetWorthCertificate, { type INetWorthCertificate } from "../models/NetWorthCertificate.js";
import Annexure1ImmovableProperty from "../models/Annexure1ImmovableProperty.js";
import Annexure2MovableProperty from "../models/Annexure2MovableProperty.js";
import CertificateLiability from "../models/CertificateLiability.js";
import GuarantorDetail from "../models/GuarantorDetail.js";
import Client from "../models/Client.js";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.js";
import { calculateNetWorth } from "./netWorthCalculator.js";

class CertificateService {
  async createCertificate(
    auditorId: string,
    clientId: string,
    financialYear: string,
    asOnDate: string
  ): Promise<INetWorthCertificate> {
    const client = await Client.findOne({
      _id: new mongoose.Types.ObjectId(clientId),
      auditorId: new mongoose.Types.ObjectId(auditorId),
    });
    if (!client) throw new NotFoundError("Client not found");

    const existing = await NetWorthCertificate.findOne({
      clientId: new mongoose.Types.ObjectId(clientId),
      financialYear,
    });
    if (existing) {
      throw new ConflictError(`A certificate for ${financialYear} already exists for this client`);
    }

    const certificate = await NetWorthCertificate.create({
      clientId: new mongoose.Types.ObjectId(clientId),
      auditorId: new mongoose.Types.ObjectId(auditorId),
      financialYear,
      asOnDate: new Date(asOnDate),
      status: "draft",
    });

    // Pre-create sub-documents
    await Promise.all([
      Annexure1ImmovableProperty.create({ certificateId: certificate._id }),
      Annexure2MovableProperty.create({ certificateId: certificate._id }),
      CertificateLiability.create({ certificateId: certificate._id }),
      GuarantorDetail.create({ certificateId: certificate._id }),
    ]);

    return certificate;
  }

  async getCertificateById(id: string, auditorId: string): Promise<INetWorthCertificate> {
    const cert = await NetWorthCertificate.findOne({
      _id: new mongoose.Types.ObjectId(id),
      auditorId: new mongoose.Types.ObjectId(auditorId),
    }).populate("clientId");
    if (!cert) throw new NotFoundError("Certificate not found");
    return cert;
  }

  async getCertificatesByClient(
    clientId: string,
    auditorId: string,
    status?: string
  ): Promise<INetWorthCertificate[]> {
    const query: Record<string, unknown> = {
      clientId: new mongoose.Types.ObjectId(clientId),
      auditorId: new mongoose.Types.ObjectId(auditorId),
    };
    if (status) query.status = status;
    return NetWorthCertificate.find(query).sort({ createdAt: -1 });
  }

  async getSummary(id: string, auditorId: string) {
    const cert = await this.getCertificateById(id, auditorId);
    const oid = new mongoose.Types.ObjectId(id);
    const [client, liabilities, guarantors, annexure1, annexure2] = await Promise.all([
      Client.findById(cert.clientId),
      CertificateLiability.findOne({ certificateId: oid }),
      GuarantorDetail.findOne({ certificateId: oid }),
      Annexure1ImmovableProperty.findOne({ certificateId: oid }),
      Annexure2MovableProperty.findOne({ certificateId: oid }),
    ]);

    return {
      clientName: client?.name,
      pan: client?.pan,
      dateOfBirth: client?.dateOfBirth,
      permanentAddress: client?.permanentAddress,
      officeAddress: client?.officeAddress,
      financialYear: cert.financialYear,
      asOnDate: cert.asOnDate,
      totalImmovableProperty: cert.totalImmovableProperty,
      totalMovableProperty: cert.totalMovableProperty,
      totalLiabilities: cert.totalLiabilities,
      netWorth: cert.netWorth,
      netWorthInWords: cert.netWorthInWords,
      status: cert.status,
      // Section A breakdown
      annexure1: {
        totalBySelf: annexure1?.totalBySelf ?? 0,
        totalBySharing: annexure1?.totalBySharing ?? 0,
        grandTotal: annexure1?.grandTotal ?? 0,
      },
      // Section B breakdown (each category)
      annexure2: {
        ppf: annexure2?.ppf?.total ?? 0,
        pensionScheme: annexure2?.pensionScheme?.total ?? 0,
        huf: annexure2?.huf?.presentValue ?? 0,
        shares: annexure2?.sharesTotal ?? 0,
        fixedDeposit: annexure2?.fixedDeposit?.total ?? 0,
        recurringDeposit: annexure2?.recurringDeposit?.total ?? 0,
        otherDeposit: annexure2?.otherDeposit?.total ?? 0,
        goldAndJewellery: annexure2?.goldAndJewelleryTotal ?? 0,
        insurancePolicies: annexure2?.insurancePolicies?.total ?? 0,
        vehicles: annexure2?.vehicles?.total ?? 0,
        investmentInFirms: annexure2?.investmentInFirmsTotal ?? 0,
        grandTotal: annexure2?.grandTotal ?? 0,
      },
      // Section C
      liabilityItems: (liabilities?.items ?? []).map((item) => ({
        borrowedFrom: item.borrowedFrom,
        securitiesOffered: item.securitiesOffered,
        purpose: item.purpose,
        outstandingAmount: item.outstandingAmount ?? 0,
      })),
      // Section D
      guarantorItems: (guarantors?.items ?? []).map((item) => ({
        guaranteedTo: item.guaranteedTo,
        borrowingsBy: item.borrowingsBy,
        purpose: item.purpose,
        amountGuaranteed: item.amountGuaranteed ?? 0,
      })),
    };
  }

  async recalculateTotals(certificateId: string): Promise<void> {
    const [annexure1, annexure2, liabilities] = await Promise.all([
      Annexure1ImmovableProperty.findOne({ certificateId: new mongoose.Types.ObjectId(certificateId) }),
      Annexure2MovableProperty.findOne({ certificateId: new mongoose.Types.ObjectId(certificateId) }),
      CertificateLiability.findOne({ certificateId: new mongoose.Types.ObjectId(certificateId) }),
    ]);

    const totalImmovable = annexure1?.grandTotal ?? 0;
    const totalMovable = annexure2?.grandTotal ?? 0;
    const totalLiabilities = liabilities?.total ?? 0;

    const { netWorth, netWorthInWords } = calculateNetWorth(totalImmovable, totalMovable, totalLiabilities);

    await NetWorthCertificate.findByIdAndUpdate(certificateId, {
      totalImmovableProperty: totalImmovable,
      totalMovableProperty: totalMovable,
      totalLiabilities,
      netWorth,
      netWorthInWords,
    });
  }

  async finalizeCertificate(id: string, auditorId: string): Promise<INetWorthCertificate> {
    const cert = await this.getCertificateById(id, auditorId);
    if (cert.status === "finalized") {
      throw new BadRequestError("Certificate is already finalized");
    }
    cert.status = "finalized";
    cert.finalizedAt = new Date();
    await cert.save();
    return cert;
  }

  async reopenCertificate(id: string, auditorId: string): Promise<INetWorthCertificate> {
    const cert = await this.getCertificateById(id, auditorId);
    cert.status = "draft";
    cert.finalizedAt = undefined;
    await cert.save();
    return cert;
  }

  async deleteCertificate(id: string, auditorId: string): Promise<void> {
    const cert = await this.getCertificateById(id, auditorId);
    if (cert.status === "finalized") {
      throw new BadRequestError("Cannot delete a finalized certificate");
    }
    const certId = cert._id;
    await Promise.all([
      Annexure1ImmovableProperty.deleteOne({ certificateId: certId }),
      Annexure2MovableProperty.deleteOne({ certificateId: certId }),
      CertificateLiability.deleteOne({ certificateId: certId }),
      GuarantorDetail.deleteOne({ certificateId: certId }),
      cert.deleteOne(),
    ]);
  }
}

export default new CertificateService();
