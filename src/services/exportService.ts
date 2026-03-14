import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import certificateService from "./certificateService.js";
import Annexure1ImmovableProperty from "../models/Annexure1ImmovableProperty.js";
import Annexure2MovableProperty from "../models/Annexure2MovableProperty.js";
import CertificateLiability from "../models/CertificateLiability.js";
import GuarantorDetail from "../models/GuarantorDetail.js";
import Client from "../models/Client.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_PATH = path.join(__dirname, "../templates/net_worth_template.xlsx");

const fmt = (v?: number) => (v ?? 0);
const dateStr = (d?: Date | string) => d ? new Date(d).toLocaleDateString("en-IN") : "";

class ExportService {
  async generateExcel(certificateId: string, auditorId: string): Promise<Buffer> {
    const cert = await certificateService.getCertificateById(certificateId, auditorId);
    const client = await Client.findById(cert.clientId);
    const oid = new mongoose.Types.ObjectId(certificateId);

    const [annexure1, annexure2, liabilities, guarantors] = await Promise.all([
      Annexure1ImmovableProperty.findOne({ certificateId: oid }),
      Annexure2MovableProperty.findOne({ certificateId: oid }),
      CertificateLiability.findOne({ certificateId: oid }),
      GuarantorDetail.findOne({ certificateId: oid }),
    ]);

    // Load template — preserves all formatting, borders, merged cells, formulas
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);

    // ── SUMMARY SHEET ─────────────────────────────────────────────────
    const sum = workbook.getWorksheet("Summary")!;

    // A3 is a merged cell (A3:D3) — append the as-on date to the existing label
    sum.getCell("A3").value =
      `We hereby certify below the position of Assets & Liabilities of the person mentioned hereunder as on ${cert.asOnDate ? dateStr(cert.asOnDate) : ""}`;

    // Rows 5-9 — client details (B5:D5, B6:D6, B7:D7, B8:D8, B9:D9 are merged ranges)
    sum.getCell("B5").value = client?.name ?? "";
    sum.getCell("B6").value = client?.pan ?? "";
    sum.getCell("B7").value = client?.dateOfBirth ? dateStr(client.dateOfBirth) : "";
    const pa = client?.permanentAddress;
    sum.getCell("B8").value = pa
      ? [pa.line1, pa.line2, pa.city, pa.state, pa.pincode].filter(Boolean).join(", ")
      : "";
    const oa = client?.officeAddress;
    sum.getCell("B9").value = oa
      ? [oa.line1, oa.line2, oa.city, oa.state, oa.pincode].filter(Boolean).join(", ")
      : "";

    // Rows 38-40 — liabilities (A=Borrowed From, B=Securities Offered, C=Purpose, D=Outstanding)
    const liabItems = liabilities?.items ?? [];
    for (let i = 0; i < Math.max(liabItems.length, 3); i++) {
      const item = liabItems[i];
      const r = 38 + i;
      // If more than 3 items, insert a new row; template has 3 pre-built rows
      sum.getCell(`A${r}`).value = item?.borrowedFrom ?? "";
      sum.getCell(`B${r}`).value = item?.securitiesOffered ?? "";
      sum.getCell(`C${r}`).value = item?.purpose ?? "";
      sum.getCell(`D${r}`).value = item ? fmt(item.outstandingAmount) : "";
    }
    // Total liabilities row (A41:C41 merged, D41 is the total)
    const totalLiab = liabItems.reduce((s, x) => s + (x.outstandingAmount ?? 0), 0);
    sum.getCell("D41").value = fmt(totalLiab);

    // Row 42 — Net Worth label & value
    sum.getCell("A42").value = `(D) Net Worth: (A + B – C) = ₹ ${Number(cert.netWorth ?? 0).toFixed(2)} Lacs`;
    sum.getCell("D42").value = fmt(cert.netWorth);

    // Row 43 — Net Worth in Words
    sum.getCell("A43").value = `(In words: ${cert.netWorthInWords ?? ""})`;

    // Rows 47-49 — Guarantors (A=Guaranteed To, B=Borrowings By, C=Purpose, D=Amount)
    const guarItems = guarantors?.items ?? [];
    for (let i = 0; i < Math.max(guarItems.length, 3); i++) {
      const item = guarItems[i];
      const r = 47 + i;
      sum.getCell(`A${r}`).value = item?.guaranteedTo ?? "";
      sum.getCell(`B${r}`).value = item?.borrowingsBy ?? "";
      sum.getCell(`C${r}`).value = item?.purpose ?? "";
      sum.getCell(`D${r}`).value = item ? fmt(item.amountGuaranteed) : "";
    }
    // Total guarantors (A51:C51 merged, D51 is the total)
    const totalGuar = guarItems.reduce((s, x) => s + (x.amountGuaranteed ?? 0), 0);
    sum.getCell("D51").value = fmt(totalGuar);

    // ── ANNEXURE-1 SHEET ──────────────────────────────────────────────
    const a1 = workbook.getWorksheet("Annexure-1 Immovable Property")!;

    const bySelf = annexure1?.bySelf ?? [];
    const bySharing = annexure1?.bySharing ?? [];

    // By Self rows: starts at row 9 (template has 3 rows: 9, 10, 11)
    const a1SelfStart = 9;
    for (let i = 0; i < 3; i++) {
      const row = bySelf[i];
      const r = a1SelfStart + i;
      a1.getCell(`A${r}`).value = row?.natureOfProperty ?? "";
      a1.getCell(`B${r}`).value = row?.locationAddress ?? "";
      a1.getCell(`C${r}`).value = row?.dateOfPurchase ? dateStr(row.dateOfPurchase) : "";
      a1.getCell(`D${r}`).value = fmt(row?.propertyCost);
      a1.getCell(`E${r}`).value = fmt(row?.registrationCharges);
      a1.getCell(`F${r}`).value = fmt(row?.stampCharges);
      a1.getCell(`G${r}`).value = [row?.vendorName, row?.vendorPan].filter(Boolean).join(" / ");
      a1.getCell(`H${r}`).value = fmt(row?.valueAtCost);
      // Source of Fund - Loan
      a1.getCell(`J${r}`).value = row?.loanSource?.bankName ?? "";
      a1.getCell(`K${r}`).value = fmt(row?.loanSource?.loanAmountReceived);
      a1.getCell(`L${r}`).value = row?.loanSource?.sanctionLetterRef ?? "";
      a1.getCell(`M${r}`).value = row?.loanSource?.dateOfLoanReceived ? dateStr(row.loanSource.dateOfLoanReceived) : "";
      a1.getCell(`N${r}`).value = fmt(row?.loanSource?.outstandingLoanAmount);
      // Source of Fund - Others
      a1.getCell(`P${r}`).value = fmt(row?.otherSources?.salary);
      a1.getCell(`Q${r}`).value = fmt(row?.otherSources?.withdrawalFromSB);
      a1.getCell(`R${r}`).value = fmt(row?.otherSources?.withdrawalFromFD);
      a1.getCell(`S${r}`).value = fmt(row?.otherSources?.otherSource);
      a1.getCell(`T${r}`).value = fmt(row?.otherSources?.totalOtherSources);
      a1.getCell(`U${r}`).value = fmt(row?.totalSourceOfFund);
    }

    // By Sharing rows: starts at row 13
    const a1SharingStart = 13;
    for (let i = 0; i < 3; i++) {
      const row = bySharing[i];
      const r = a1SharingStart + i;
      a1.getCell(`A${r}`).value = row?.natureOfProperty ?? "";
      a1.getCell(`B${r}`).value = row?.locationAddress ?? "";
      a1.getCell(`C${r}`).value = row?.dateOfPurchase ? dateStr(row.dateOfPurchase) : "";
      a1.getCell(`D${r}`).value = fmt(row?.propertyCost);
      a1.getCell(`E${r}`).value = fmt(row?.registrationCharges);
      a1.getCell(`F${r}`).value = fmt(row?.stampCharges);
      a1.getCell(`G${r}`).value = [row?.vendorName, row?.vendorPan].filter(Boolean).join(" / ");
      a1.getCell(`H${r}`).value = fmt(row?.valueAtCost);
      a1.getCell(`J${r}`).value = row?.loanSource?.bankName ?? "";
      a1.getCell(`K${r}`).value = fmt(row?.loanSource?.loanAmountReceived);
      a1.getCell(`L${r}`).value = row?.loanSource?.sanctionLetterRef ?? "";
      a1.getCell(`M${r}`).value = row?.loanSource?.dateOfLoanReceived ? dateStr(row.loanSource.dateOfLoanReceived) : "";
      a1.getCell(`N${r}`).value = fmt(row?.loanSource?.outstandingLoanAmount);
      a1.getCell(`P${r}`).value = fmt(row?.otherSources?.salary);
      a1.getCell(`Q${r}`).value = fmt(row?.otherSources?.withdrawalFromSB);
      a1.getCell(`R${r}`).value = fmt(row?.otherSources?.withdrawalFromFD);
      a1.getCell(`S${r}`).value = fmt(row?.otherSources?.otherSource);
      a1.getCell(`T${r}`).value = fmt(row?.otherSources?.totalOtherSources);
      a1.getCell(`U${r}`).value = fmt(row?.totalSourceOfFund);
    }

    // ── ANNEXURE-2 SHEET ──────────────────────────────────────────────
    const a2 = workbook.getWorksheet("Annexure-2 Movable Property")!;

    const fillFamily = (section: { self?: { presentValue?: number; heldWith?: string; dateOfInvestment?: Date | string }; spouse?: { presentValue?: number; heldWith?: string; dateOfInvestment?: Date | string }; children?: { presentValue?: number; heldWith?: string; dateOfInvestment?: Date | string } } | undefined, selfRow: number) => {
      const members = ["self", "spouse", "children"] as const;
      members.forEach((m, i) => {
        const r = selfRow + i;
        const d = section?.[m];
        a2.getCell(`C${r}`).value = (d as { heldWith?: string })?.heldWith ?? "";
        a2.getCell(`D${r}`).value = (d as { dateOfInvestment?: Date | string })?.dateOfInvestment ? dateStr((d as { dateOfInvestment?: Date | string }).dateOfInvestment) : "";
        a2.getCell(`I${r}`).value = fmt((d as { presentValue?: number })?.presentValue);
      });
    };

    // PPF rows 7-9
    fillFamily(annexure2?.ppf, 7);
    // Pension Scheme rows 11-13
    fillFamily(annexure2?.pensionScheme, 11);
    // HUF row 15
    a2.getCell("A15").value = annexure2?.huf?.hufName ?? "";
    a2.getCell("I15").value = fmt(annexure2?.huf?.presentValue);
    // FD rows 24-26
    fillFamily(annexure2?.fixedDeposit, 24);
    // RD rows 28-30
    fillFamily(annexure2?.recurringDeposit, 28);
    // Other Deposit rows 32-34
    fillFamily(annexure2?.otherDeposit, 32);

    // Vehicles
    const tw = annexure2?.vehicles?.twoWheelers ?? [];
    [47, 48].forEach((r, i) => {
      a2.getCell(`A${r}`).value = tw[i]?.vehicleNo ?? "";
      a2.getCell(`C${r}`).value = tw[i]?.make ?? "";
      a2.getCell(`D${r}`).value = tw[i]?.model ?? "";
      a2.getCell(`I${r}`).value = fmt(tw[i]?.presentValue);
    });
    const fw = annexure2?.vehicles?.fourWheelers ?? [];
    [50, 51].forEach((r, i) => {
      a2.getCell(`A${r}`).value = fw[i]?.vehicleNo ?? "";
      a2.getCell(`C${r}`).value = fw[i]?.make ?? "";
      a2.getCell(`D${r}`).value = fw[i]?.model ?? "";
      a2.getCell(`I${r}`).value = fmt(fw[i]?.presentValue);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export default new ExportService();
