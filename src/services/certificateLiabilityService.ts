import mongoose from "mongoose";
import CertificateLiability, {
  type ICertificateLiability,
  type ILiabilityItem,
} from "../models/CertificateLiability.js";
import { NotFoundError } from "../utils/errors.js";
import certificateService from "./certificateService.js";

class CertificateLiabilityService {
  async getByCertificate(certificateId: string): Promise<ICertificateLiability> {
    const doc = await CertificateLiability.findOne({
      certificateId: new mongoose.Types.ObjectId(certificateId),
    });
    if (!doc) throw new NotFoundError("Liabilities not found");
    return doc;
  }

  private recalculate(doc: ICertificateLiability): void {
    doc.total = Number(
      doc.items.reduce((a, item) => a + (item.outstandingAmount ?? 0), 0).toFixed(2)
    );
  }

  async saveAll(certificateId: string, items: ILiabilityItem[]): Promise<ICertificateLiability> {
    const doc = await this.getByCertificate(certificateId);
    doc.items = items as typeof doc.items;
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async addItem(certificateId: string, item: ILiabilityItem): Promise<ICertificateLiability> {
    const doc = await this.getByCertificate(certificateId);
    doc.items.push(item);
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async updateItem(
    certificateId: string,
    itemId: string,
    data: Partial<ILiabilityItem>
  ): Promise<ICertificateLiability> {
    const doc = await this.getByCertificate(certificateId);
    const item = doc.items.find((i) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundError("Liability item not found");
    Object.assign(item, data);
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async deleteItem(certificateId: string, itemId: string): Promise<ICertificateLiability> {
    const doc = await this.getByCertificate(certificateId);
    const before = doc.items.length;
    doc.items = doc.items.filter((i) => i._id?.toString() !== itemId) as typeof doc.items;
    if (doc.items.length === before) throw new NotFoundError("Liability item not found");
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }
}

export default new CertificateLiabilityService();
