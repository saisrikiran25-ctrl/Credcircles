/**
 * System Rules & Parameter Validations
 * Enforces business rules specified in the Community Credit Circles specifications.
 */

export const SUPPORTED_CITIES = [
  'Hyderabad',
  'Bengaluru',
  'Pune',
  'Delhi NCR',
  'Mumbai',
  'Chennai',
  'Ahmedabad',
] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export const TARGET_SEGMENTS = [
  { id: 'COLLEGE_STUDENT', label: 'College students', ageRange: '18–24', capacity: 'Low–moderate' },
  { id: 'YOUNG_PROFESSIONAL', label: 'Young professionals', ageRange: '22–30', capacity: 'Moderate' },
  { id: 'CAMPUS_CLUB', label: 'Campus clubs / teams', ageRange: 'All youth', capacity: 'Moderate' },
  { id: 'MICROENTREPRENEUR', label: 'Microentrepreneurs', ageRange: '20–30', capacity: 'Moderate–high' },
] as const;

export const CIRCLE_TYPES = [
  'College group',
  'Hostel group',
  'Friend circle',
  'Young professionals\' group',
  'Campus club/team',
] as const;

export const LOAN_PURPOSES = [
  'Education & Semester Fees',
  'Professional Skills & Upskilling',
  'Urgent Medical / Personal Emergency',
  'Micro-business Inventory & Working Capital',
  'Gadgets & Laptop / Lifestyle',
  'Campus Club / Event Welfare',
] as const;

export const SYSTEM_LIMITS = {
  MIN_CONTRIBUTION_PAISE: 50000,      // ₹500
  MAX_CONTRIBUTION_PAISE: 500000,     // ₹5,000
  MIN_LOAN_AMOUNT_PAISE: 500000,      // ₹5,000
  MAX_LOAN_AMOUNT_PAISE: 2000000,     // ₹20,000
  MIN_TENURE_MONTHS: 1,
  MAX_TENURE_MONTHS: 6,
  MIN_INTEREST_RATE_PCT: 8.0,         // 8% p.a.
  MAX_INTEREST_RATE_PCT: 12.0,        // 12% p.a.
  DEFAULT_APPROVAL_THRESHOLD_PCT: 70, // 70% approval
  DEFAULT_PLATFORM_FEE_PCT: 1.5,      // 1.5% principal take rate
  MIN_PLATFORM_FEE_PCT: 1.0,
  MAX_PLATFORM_FEE_PCT: 2.5,
  PREMIUM_FEE_MIN_PAISE: 5000,        // ₹50/mo
  PREMIUM_FEE_MAX_PAISE: 20000,       // ₹200/mo
};

export function validatePanFormat(pan: string): boolean {
  // Format: AAAAA9999A (5 letters, 4 numbers, 1 letter)
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

export function validateAadhaarFormat(aadhaar: string): boolean {
  // Format: 12 numeric digits
  const clean = aadhaar.replace(/\s+/g, '');
  return /^[0-9]{12}$/.test(clean);
}

export function validateUpiVpaFormat(vpa: string): boolean {
  // e.g. name@okhdfcbank, student@upi
  return /^[\w.\-_]+@[\w.\-_]+$/.test(vpa.trim().toLowerCase());
}

export function validateLoanRequest(params: {
  amountPaise: number;
  tenureMonths: number;
  proposedInterestPct: number;
}): { isValid: boolean; error?: string } {
  if (
    params.amountPaise < SYSTEM_LIMITS.MIN_LOAN_AMOUNT_PAISE ||
    params.amountPaise > SYSTEM_LIMITS.MAX_LOAN_AMOUNT_PAISE
  ) {
    return {
      isValid: false,
      error: `Loan amount must be between ₹5,000 and ₹20,000 in pilot phase.`,
    };
  }

  if (
    params.tenureMonths < SYSTEM_LIMITS.MIN_TENURE_MONTHS ||
    params.tenureMonths > SYSTEM_LIMITS.MAX_TENURE_MONTHS
  ) {
    return {
      isValid: false,
      error: `Loan tenure must be between 1 and 6 months in pilot phase.`,
    };
  }

  if (
    params.proposedInterestPct < SYSTEM_LIMITS.MIN_INTEREST_RATE_PCT ||
    params.proposedInterestPct > SYSTEM_LIMITS.MAX_INTEREST_RATE_PCT
  ) {
    return {
      isValid: false,
      error: `Interest rate must be within 8% – 12% p.a. as per circle policy.`,
    };
  }

  return { isValid: true };
}

export function validateContributionAmount(amountPaise: number): {
  isValid: boolean;
  error?: string;
} {
  if (
    amountPaise < SYSTEM_LIMITS.MIN_CONTRIBUTION_PAISE ||
    amountPaise > SYSTEM_LIMITS.MAX_CONTRIBUTION_PAISE
  ) {
    return {
      isValid: false,
      error: `Monthly contributions must be between ₹500 and ₹5,000.`,
    };
  }
  return { isValid: true };
}
