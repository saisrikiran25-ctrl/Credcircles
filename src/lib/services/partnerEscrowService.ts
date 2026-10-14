/**
 * Simulated Partner Escrow & Compliance Service
 * Implements Regulatory Posture Option A (Licensed NBFC-P2P partner) vs Option C (Closed circles).
 */

export type ComplianceMode = 'PARTNERED_ESCROW' | 'CLOSED_CIRCLES';

export interface EscrowAuditRecord {
  loanId: string;
  partnerNbfcP2pName: string;
  partnerLicenseNumber: string;
  escrowAccountNumber: string;
  nodalBank: string;
  isCompliant: boolean;
  timestamp: Date;
}

export class PartnerEscrowService {
  static readonly PARTNER_NAME = 'LiquiPeer Financial Services Ltd (NBFC-P2P)';
  static readonly PARTNER_LICENSE = 'RBI-CO-DNBS-P2P-14.02.091/2024-25';
  static readonly NODAL_BANK = 'ICICI Bank Nodal Escrow Branch';

  /**
   * Get compliance metadata and UI badge info based on active mode
   */
  static getComplianceDetails(mode: ComplianceMode) {
    if (mode === 'PARTNERED_ESCROW') {
      return {
        badgeText: 'Processed via licensed NBFC-P2P partner (simulated)',
        modeLabel: 'Mode A: Licensed NBFC-P2P Partnered',
        description:
          'Loans are facilitated under Lending Service Provider (LSP) guidelines in partnership with RBI-registered NBFC-P2P LiquiPeer. The partner maintains escrow and regulatory reporting.',
        canLendExternally: true,
        riskDisclosure:
          'Lending carries risk of loss. P2P loans are not guaranteed by RBI, DICGC, or the platform.',
      };
    } else {
      return {
        badgeText: 'Closed Circle Mode (Private Trust)',
        modeLabel: 'Mode C: Strictly Closed Circles',
        description:
          'Loans are restricted entirely within pre-existing, verified social circles. External marketplace lending is disabled to avoid public P2P classification.',
        canLendExternally: false,
        riskDisclosure:
          'Private community mutual assistance. All credit decisions and collections are governed directly by circle peers.',
      };
    }
  }

  /**
   * Generates simulated regulatory compliance audit log
   */
  static recordEscrowAudit(loanId: string): EscrowAuditRecord {
    return {
      loanId,
      partnerNbfcP2pName: this.PARTNER_NAME,
      partnerLicenseNumber: this.PARTNER_LICENSE,
      escrowAccountNumber: `ESCROW-P2P-9921-${loanId.slice(-4)}`,
      nodalBank: this.NODAL_BANK,
      isCompliant: true,
      timestamp: new Date(),
    };
  }

  /**
   * Generates standard digital Peer-to-Peer Loan Agreement template text
   */
  static generateLoanAgreementTemplate(params: {
    loanId: string;
    borrowerName: string;
    borrowerMaskedKyc: string;
    circleName: string;
    principalRupees: number;
    interestRatePct: number;
    tenureMonths: number;
    totalRepayableRupees: number;
    monthlyEmiRupees: number;
    mode: ComplianceMode;
  }): string {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
================================================================================
DIGITAL PEER-TO-PEER COMMUNITY LOAN AGREEMENT
Reference ID: ${params.loanId}
Date of Execution: ${today}
================================================================================

1. PARTIES:
   - BORROWER: ${params.borrowerName} (eKYC Verified: ${params.borrowerMaskedKyc})
   - LENDING CIRCLE: ${params.circleName} (Self-Help Community Group)
   - TECHNOLOGY PLATFORM & LSP: Community Credit Circles (Lending Service Provider)
   ${params.mode === 'PARTNERED_ESCROW' ? `- REGULATED NBFC-P2P PARTNER: ${this.PARTNER_NAME} (${this.PARTNER_LICENSE})` : '- GOVERNANCE: Private Self-Help Group (Closed Circle Charter)'}

2. LOAN TERMS:
   - Principal Amount: ₹${params.principalRupees.toLocaleString('en-IN')}
   - Annual Interest Rate: ${params.interestRatePct}% p.a. (Simple Interest)
   - Tenure: ${params.tenureMonths} month(s)
   - Total Repayable Amount: ₹${params.totalRepayableRupees.toLocaleString('en-IN')}
   - Monthly Instalment (EMI): ₹${params.monthlyEmiRupees.toLocaleString('en-IN')}

3. NATURE OF PLATFORM:
   The technology platform acts strictly as a connector and append-only ledger.
   The platform does NOT hold borrower or lender funds in any wallet, pool, or
   custodial account. All disbursements and repayments occur directly via
   UPI payment links from lender accounts to borrower accounts.

4. REPAYMENT & SOCIAL ACCOUNTABILITY:
   The Borrower agrees to honor the repayment schedule using UPI AutoPay or direct
   UPI transfer. In the event of temporary hardship, the Borrower may submit a
   restructuring proposal for collective circle review.

5. RISK ACKNOWLEDGMENT & RISK-SHARING:
   Lending carries inherent risk of default. In the event of an unrecoverable default,
   capital losses are borne proportionally among the participating circle lenders
   based on their individual commitments.

Digital Signature Verified: Sim-Token-${params.loanId.substring(0, 8)}
Status: Legally Binding Community Undertaking
================================================================================
    `.trim();
  }
}
