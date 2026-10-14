/**
 * Simulated UPI Service (Direct Peer-to-Peer & AutoPay)
 * The platform is a connector + ledger, never a fund holder.
 * All disbursements and repayments happen directly between lender and borrower VPAs.
 */

import { paiseToRupees } from '../domain/currency';

export interface UpiPaymentLinkParams {
  payeeVpa: string;      // recipient's VPA
  payeeName: string;     // recipient's legal or registered name
  amountPaise: number;   // amount in paise
  transactionNote: string; // note displayed in UPI app
  referenceId: string;   // internal tracking reference
}

export interface UpiMandateParams {
  payerVpa: string;
  payeeVpa: string;
  maxAmountPaise: number;
  frequency: 'MONTHLY' | 'WEEKLY' | 'ASPRESENTED';
  startDate: Date;
  endDate: Date;
  purposeNote: string;
}

export class UpiService {
  /**
   * Generates standard NPCI UPI payment deep-link URI
   * Example: upi://pay?pa=student@upi&pn=Rohan%20Sharma&am=10000.00&cu=INR&tn=Circle%20Loan%20Disbursement
   */
  static generatePaymentUri(params: UpiPaymentLinkParams): string {
    const rupees = paiseToRupees(params.amountPaise).toFixed(2);
    const query = new URLSearchParams({
      pa: params.payeeVpa,
      pn: params.payeeName,
      am: rupees,
      cu: 'INR',
      tn: params.transactionNote,
      tr: params.referenceId,
    });
    return `upi://pay?${query.toString()}`;
  }

  /**
   * Simulates a direct UPI transaction execution
   */
  static simulateTransaction(outcome: 'SUCCESS' | 'FAILURE' = 'SUCCESS'): {
    success: boolean;
    utr: string;
    timestamp: Date;
    errorMessage?: string;
  } {
    const timestamp = new Date();
    const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000);
    const utr = `UPI/${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, '0')}/${randomSuffix}`;

    if (outcome === 'FAILURE') {
      return {
        success: false,
        utr: '',
        timestamp,
        errorMessage: 'Simulated bank server timeout or insufficient balance in test mode.',
      };
    }

    return {
      success: true,
      utr,
      timestamp,
    };
  }

  /**
   * Simulates setting up a UPI AutoPay mandate for EMI auto-debit
   */
  static createAutoPayMandate(params: UpiMandateParams): {
    umrn: string;
    status: 'ACTIVE' | 'PENDING';
    createdAt: Date;
  } {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const umrn = `UMRN${Date.now().toString().slice(-6)}${randomChars}IN`;

    return {
      umrn,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
  }
}
