import mongoose from "mongoose";
import Annexure1ImmovableProperty, {
  type IAnnexure1ImmovableProperty,
  type IPropertyRow,
} from "../models/Annexure1ImmovableProperty.js";
import { NotFoundError } from "../utils/errors.js";
import certificateService from "./certificateService.js";

class Annexure1Service {
  async getByCertificate(certificateId: string): Promise<IAnnexure1ImmovableProperty> {
    const doc = await Annexure1ImmovableProperty.findOne({
      certificateId: new mongoose.Types.ObjectId(certificateId),
    });
    if (!doc) throw new NotFoundError("Annexure-1 not found");
    return doc;
  }

  private computeRowTotals(row: IPropertyRow): void {
    const os = row.otherSources ?? {};
    const totalOtherSources = Number(
      ((os.salary ?? 0) + (os.withdrawalFromSB ?? 0) + (os.withdrawalFromFD ?? 0) + (os.otherSource ?? 0)).toFixed(2)
    );
    if (row.otherSources) {
      row.otherSources.totalOtherSources = totalOtherSources;
    }
    const loanAmount = row.loanSource?.loanAmountReceived ?? 0;
    row.totalSourceOfFund = Number((loanAmount + totalOtherSources).toFixed(2));
  }

  private recalculate(doc: IAnnexure1ImmovableProperty): void {
    [...doc.bySelf, ...doc.bySharing].forEach((r) => this.computeRowTotals(r));
    const sum = (rows: IPropertyRow[]) =>
      rows.reduce((acc, r) => acc + (r.valueAtCost ?? 0), 0);
    doc.totalBySelf = Number(sum(doc.bySelf).toFixed(2));
    doc.totalBySharing = Number(sum(doc.bySharing).toFixed(2));
    doc.grandTotal = Number((doc.totalBySelf + doc.totalBySharing).toFixed(2));
  }

  async addRow(
    certificateId: string,
    section: "bySelf" | "bySharing",
    rowData: IPropertyRow
  ): Promise<IAnnexure1ImmovableProperty> {
    const doc = await this.getBycertificate(certificateId);
    doc[section].push(rowData);
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async updateRow(
    certificateId: string,
    section: "bySelf" | "bySharing",
    rowId: string,
    rowData: Partial<IPropertyRow>
  ): Promise<IAnnexure1ImmovableProperty> {
    const doc = await this.getBycertificate(certificateId);
    const row = doc[section].find((r) => r._id?.toString() === rowId);
    if (!row) throw new NotFoundError("Property row not found");
    Object.assign(row, rowData);
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async deleteRow(
    certificateId: string,
    section: "bySelf" | "bySharing",
    rowId: string
  ): Promise<IAnnexure1ImmovableProperty> {
    const doc = await this.getBycertificate(certificateId);
    const before = doc[section].length;
    doc[section] = doc[section].filter((r) => r._id?.toString() !== rowId) as typeof doc[typeof section];
    if (doc[section].length === before) throw new NotFoundError("Property row not found");
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async saveAll(
    certificateId: string,
    data: { bySelf?: IPropertyRow[]; bySharing?: IPropertyRow[] }
  ): Promise<IAnnexure1ImmovableProperty> {
    const doc = await this.getBycertificate(certificateId);
    if (data.bySelf !== undefined) doc.bySelf = data.bySelf as typeof doc.bySelf;
    if (data.bySharing !== undefined) doc.bySharing = data.bySharing as typeof doc.bySharing;
    this.recalculate(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  private async getBycertificate(certificateId: string): Promise<IAnnexure1ImmovableProperty> {
    const doc = await Annexure1ImmovableProperty.findOne({
      certificateId: new mongoose.Types.ObjectId(certificateId),
    });
    if (!doc) throw new NotFoundError("Annexure-1 not found");
    return doc;
  }
}

export default new Annexure1Service();
