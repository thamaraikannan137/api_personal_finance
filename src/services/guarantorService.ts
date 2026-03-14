import mongoose from "mongoose";
import GuarantorDetail, {
  type IGuarantorDetail,
  type IGuarantorItem,
} from "../models/GuarantorDetail.js";
import { NotFoundError } from "../utils/errors.js";

class GuarantorService {
  async getByCertificate(certificateId: string): Promise<IGuarantorDetail> {
    const doc = await GuarantorDetail.findOne({
      certificateId: new mongoose.Types.ObjectId(certificateId),
    });
    if (!doc) throw new NotFoundError("Guarantor details not found");
    return doc;
  }

  async saveAll(certificateId: string, items: IGuarantorItem[]): Promise<IGuarantorDetail> {
    const doc = await this.getByCertificate(certificateId);
    doc.items = items as typeof doc.items;
    await doc.save();
    return doc;
  }

  async addItem(certificateId: string, item: IGuarantorItem): Promise<IGuarantorDetail> {
    const doc = await this.getByCertificate(certificateId);
    doc.items.push(item);
    await doc.save();
    return doc;
  }

  async updateItem(
    certificateId: string,
    itemId: string,
    data: Partial<IGuarantorItem>
  ): Promise<IGuarantorDetail> {
    const doc = await this.getByCertificate(certificateId);
    const item = doc.items.find((i) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundError("Guarantor item not found");
    Object.assign(item, data);
    await doc.save();
    return doc;
  }

  async deleteItem(certificateId: string, itemId: string): Promise<IGuarantorDetail> {
    const doc = await this.getByCertificate(certificateId);
    const before = doc.items.length;
    doc.items = doc.items.filter((i) => i._id?.toString() !== itemId) as typeof doc.items;
    if (doc.items.length === before) throw new NotFoundError("Guarantor item not found");
    await doc.save();
    return doc;
  }
}

export default new GuarantorService();
