/**
 * Pure calculation utility for Net Worth Certificate.
 * netWorth = (A) totalImmovable + (B) totalMovable - (C) totalLiabilities
 */

export function convertToWords(amount: number): string {
  if (amount === 0) return "Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertHundreds(n: number): string {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  }

  // Handle amounts in lakhs (1 Lakh = 100,000)
  // Input is in Lakhs, convert to actual rupees
  const rupees = Math.round(amount * 100000);
  const paise = Math.round((amount * 100000 - rupees) * 100);

  let result = "";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  if (crore > 0) result += convertHundreds(crore) + "Crore ";
  if (lakh > 0) result += convertHundreds(lakh) + "Lakh ";
  if (thousand > 0) result += convertHundreds(thousand) + "Thousand ";
  if (hundred > 0) result += convertHundreds(hundred);

  result = result.trim();
  if (paise > 0) {
    result += ` and ${convertHundreds(paise).trim()} Paise`;
  }

  return result + " Only";
}

export function calculateNetWorth(
  totalImmovable: number,
  totalMovable: number,
  totalLiabilities: number
): { netWorth: number; netWorthInWords: string } {
  const netWorth = Number((totalImmovable + totalMovable - totalLiabilities).toFixed(2));
  const netWorthInWords = convertToWords(Math.abs(netWorth));
  return { netWorth, netWorthInWords };
}

export function sumFamilySection(section: {
  self?: { presentValue?: number; valueAtCost?: number };
  spouse?: { presentValue?: number; valueAtCost?: number };
  children?: { presentValue?: number; valueAtCost?: number };
}): number {
  const get = (p?: { presentValue?: number; valueAtCost?: number }) =>
    p?.presentValue ?? p?.valueAtCost ?? 0;
  return Number((get(section.self) + get(section.spouse) + get(section.children)).toFixed(2));
}
