/**
 * Currency & Formatting Helpers
 * All monetary values in the database are stored as INTEGER PAISE (1 INR = 100 paise)
 */

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format paise into Indian Rupee string with Indian numbering convention
 * Example: 12500000 paise -> ₹1,25,000
 */
export function formatPaise(paise: number, options?: { showPaise?: boolean }): string {
  const rupees = paiseToRupees(paise);
  const isNegative = rupees < 0;
  const absRupees = Math.abs(rupees);
  
  const parts = absRupees.toFixed(options?.showPaise ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian currency grouping: last 3 digits, then groups of 2 digits
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const remaining = integerPart.substring(0, integerPart.length - 3);
    const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = `${withCommas},${lastThree}`;
  }

  const formatted = `₹${integerPart}${decimalPart ? `.${decimalPart}` : ''}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format in Lakhs / Crores for large summaries
 * Example: 5000000 paise (₹50,000) -> ₹50K or ₹0.50 L
 */
export function formatLakhCrore(paise: number): string {
  const rupees = paiseToRupees(paise);
  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(2)} L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}
