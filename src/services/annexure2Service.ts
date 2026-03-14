import mongoose from "mongoose";
import Annexure2MovableProperty, {
  type IAnnexure2MovableProperty,
} from "../models/Annexure2MovableProperty.js";
import { NotFoundError } from "../utils/errors.js";
import { sumFamilySection } from "./netWorthCalculator.js";
import certificateService from "./certificateService.js";

class Annexure2Service {
  async getByCertificate(certificateId: string): Promise<IAnnexure2MovableProperty> {
    const doc = await Annexure2MovableProperty.findOne({
      certificateId: new mongoose.Types.ObjectId(certificateId),
    });
    if (!doc) throw new NotFoundError("Annexure-2 not found");
    return doc;
  }

  private recalculateGrandTotal(doc: IAnnexure2MovableProperty): void {
    const ppfTotal = sumFamilySection(doc.ppf ?? {});
    const pensionTotal = sumFamilySection(doc.pensionScheme ?? {});
    const hufTotal = doc.huf?.total ?? doc.huf?.presentValue ?? 0;
    const sharesTotal = doc.shares.reduce((a, s) => a + (s.presentValue ?? 0), 0);
    const fdTotal = sumFamilySection(doc.fixedDeposit ?? {});
    const rdTotal = sumFamilySection(doc.recurringDeposit ?? {});
    const otherTotal = sumFamilySection(doc.otherDeposit ?? {});
    const goldTotal = doc.goldAndJewellery.reduce((a, g) => a + (g.presentValue ?? 0), 0);
    const insuranceTotal = [
      ...(doc.insurancePolicies?.self ?? []),
      ...(doc.insurancePolicies?.spouse ?? []),
      ...(doc.insurancePolicies?.children ?? []),
    ].reduce((a, p) => a + (p.surrenderValue ?? 0), 0);
    const vehicleTotal =
      [...(doc.vehicles?.twoWheelers ?? []), ...(doc.vehicles?.fourWheelers ?? [])].reduce(
        (a, v) => a + (v.presentValue ?? 0),
        0
      );
    const firmsTotal = doc.investmentInFirms.reduce((a, f) => a + (f.presentValue ?? 0), 0);

    doc.sharesTotal = Number(sharesTotal.toFixed(2));
    doc.goldAndJewelleryTotal = Number(goldTotal.toFixed(2));
    doc.investmentInFirmsTotal = Number(firmsTotal.toFixed(2));
    if (doc.ppf) doc.ppf.total = Number(ppfTotal.toFixed(2));
    if (doc.pensionScheme) doc.pensionScheme.total = Number(pensionTotal.toFixed(2));
    if (doc.huf) doc.huf.total = Number(hufTotal.toFixed(2));
    if (doc.fixedDeposit) doc.fixedDeposit.total = Number(fdTotal.toFixed(2));
    if (doc.recurringDeposit) doc.recurringDeposit.total = Number(rdTotal.toFixed(2));
    if (doc.otherDeposit) doc.otherDeposit.total = Number(otherTotal.toFixed(2));
    if (doc.insurancePolicies) doc.insurancePolicies.total = Number(insuranceTotal.toFixed(2));
    if (doc.vehicles) doc.vehicles.total = Number(vehicleTotal.toFixed(2));

    doc.grandTotal = Number(
      (ppfTotal + pensionTotal + hufTotal + sharesTotal + fdTotal + rdTotal +
        otherTotal + goldTotal + insuranceTotal + vehicleTotal + firmsTotal).toFixed(2)
    );
  }

  async updateSection(
    certificateId: string,
    section: keyof IAnnexure2MovableProperty,
    data: unknown
  ): Promise<IAnnexure2MovableProperty> {
    const doc = await this.getByCertificate(certificateId);
    (doc as unknown as Record<string, unknown>)[section as string] = data;
    doc.markModified(section as string);
    this.recalculateGrandTotal(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }

  async saveAll(
    certificateId: string,
    data: Partial<IAnnexure2MovableProperty>
  ): Promise<IAnnexure2MovableProperty> {
    const doc = await this.getByCertificate(certificateId);
    const allowedKeys: (keyof IAnnexure2MovableProperty)[] = [
      "ppf", "pensionScheme", "huf", "shares", "fixedDeposit",
      "recurringDeposit", "otherDeposit", "goldAndJewellery",
      "insurancePolicies", "vehicles", "investmentInFirms",
    ];
    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        (doc as unknown as Record<string, unknown>)[key as string] = data[key];
        doc.markModified(key as string);
      }
    }
    this.recalculateGrandTotal(doc);
    await doc.save();
    await certificateService.recalculateTotals(certificateId);
    return doc;
  }
}

export default new Annexure2Service();
