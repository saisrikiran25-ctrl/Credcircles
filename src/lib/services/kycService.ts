/**
 * Simulated KYC Service (Identity & Verification)
 * Never collects or stores raw PAN/Aadhaar numbers.
 * Validates format, generates masked strings, and handles simulated OTP verification.
 */

import { validatePanFormat, validateAadhaarFormat } from '../domain/rules';

export interface SimulatedKycResult {
  success: boolean;
  maskedNumber: string;
  documentType: 'PAN' | 'AADHAAR';
  message: string;
}

export class KycService {
  /**
   * Masks a PAN card: shows first 5 characters and last character, masks digits.
   * Example: ABCDE1234F -> ABCDE****F
   */
  static maskPan(pan: string): string {
    const clean = pan.trim().toUpperCase();
    if (clean.length !== 10) return clean;
    return `${clean.substring(0, 5)}****${clean.substring(9)}`;
  }

  /**
   * Masks an Aadhaar number: shows last 4 digits only.
   * Example: 123456789012 -> ********9012
   */
  static maskAadhaar(aadhaar: string): string {
    const clean = aadhaar.replace(/\s+/g, '');
    if (clean.length !== 12) return clean;
    return `********${clean.substring(8)}`;
  }

  /**
   * Send simulated OTP for document verification
   */
  static sendDocumentOtp(identifier: string): { otpRef: string; demoOtp: string } {
    return {
      otpRef: `KYC-OTP-${Date.now().toString(36).toUpperCase()}`,
      demoOtp: '123456',
    };
  }

  /**
   * Verify PAN / Aadhaar document and simulated OTP
   */
  static verifyDocument(
    docType: 'PAN' | 'AADHAAR',
    docValue: string,
    enteredOtp: string
  ): SimulatedKycResult {
    if (enteredOtp !== '123456' && enteredOtp.length !== 6) {
      return {
        success: false,
        maskedNumber: '',
        documentType: docType,
        message: 'Invalid OTP. For prototype demo, enter 123456.',
      };
    }

    if (docType === 'PAN') {
      if (!validatePanFormat(docValue)) {
        return {
          success: false,
          maskedNumber: '',
          documentType: 'PAN',
          message: 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).',
        };
      }
      return {
        success: true,
        maskedNumber: this.maskPan(docValue),
        documentType: 'PAN',
        message: 'PAN verified successfully via simulated NSDL/Income Tax portal.',
      };
    } else {
      if (!validateAadhaarFormat(docValue)) {
        return {
          success: false,
          maskedNumber: '',
          documentType: 'AADHAAR',
          message: 'Invalid Aadhaar format. Must be a 12-digit number.',
        };
      }
      return {
        success: true,
        maskedNumber: this.maskAadhaar(docValue),
        documentType: 'AADHAAR',
        message: 'Aadhaar eKYC verified successfully via simulated UIDAI sandbox.',
      };
    }
  }
}
