import { PrismaClient } from '@prisma/client';
import { calculateLoanSchedule } from '../src/lib/domain/emi';
import { computeRiskScore } from '../src/lib/domain/risk';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Community Credit Circles database...');

  // Clean existing tables in reverse dependency order
  await prisma.platformFee.deleteMany({});
  await prisma.premiumSubscription.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.restructureProposal.deleteMany({});
  await prisma.riskScoreSnapshot.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.mandate.deleteMany({});
  await prisma.repayment.deleteMany({});
  await prisma.instalment.deleteMany({});
  await prisma.disbursement.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.loanRequest.deleteMany({});
  await prisma.contribution.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.circle.deleteMany({});
  await prisma.kycRecord.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing records.');

  // 1. Seed Users (12 realistic Indian youth across 4 target segments)
  const users = await Promise.all([
    // Persona 1: Student Borrower
    prisma.user.create({
      data: {
        id: 'demo-user-rohan',
        name: 'Rohan Verma',
        phone: '9876543210',
        email: 'rohan.verma@iiit.ac.in',
        city: 'Hyderabad',
        segment: 'COLLEGE_STUDENT',
        upiVpa: 'rohan.verma@upi',
        institution: 'IIIT Hyderabad (B.Tech CS)',
        isVerified: true,
        kycRecords: {
          create: [
            { documentType: 'PAN', maskedNumber: 'ABCDE1234F', status: 'VERIFIED' },
            { documentType: 'AADHAAR', maskedNumber: '********8821', status: 'VERIFIED' },
          ],
        },
      },
    }),
    // Persona 2: Circle Admin & Active Lender
    prisma.user.create({
      data: {
        id: 'demo-user-aarav',
        name: 'Aarav Sharma',
        phone: '9876543211',
        email: 'aarav.sharma@techfirm.io',
        city: 'Hyderabad',
        segment: 'YOUNG_PROFESSIONAL',
        upiVpa: 'aarav.fin@okaxis',
        institution: 'Fintech Solutions Hi-Tech City',
        isVerified: true,
        kycRecords: {
          create: [
            { documentType: 'PAN', maskedNumber: 'BNMPK9821Z', status: 'VERIFIED' },
            { documentType: 'AADHAAR', maskedNumber: '********4412', status: 'VERIFIED' },
          ],
        },
      },
    }),
    // Persona 3: Young Pro / Microentrepreneur
    prisma.user.create({
      data: {
        id: 'demo-user-tanvi',
        name: 'Tanvi Patel',
        phone: '9876543212',
        email: 'tanvi.studio@designhub.co',
        city: 'Hyderabad',
        segment: 'MICROENTREPRENEUR',
        upiVpa: 'tanvi.studio@okhdfcbank',
        institution: 'Studio Akshara Design & Merch',
        isVerified: true,
        kycRecords: {
          create: [
            { documentType: 'PAN', maskedNumber: 'CPTYP4412M', status: 'VERIFIED' },
            { documentType: 'AADHAAR', maskedNumber: '********9923', status: 'VERIFIED' },
          ],
        },
      },
    }),
    // Additional Circle Peers
    prisma.user.create({
      data: {
        id: 'user-sneha',
        name: 'Sneha Reddy',
        phone: '9876543213',
        email: 'sneha.reddy@gmail.com',
        city: 'Hyderabad',
        segment: 'YOUNG_PROFESSIONAL',
        upiVpa: 'sneha.reddy@upi',
        institution: 'Cyberabad Analytics Hub',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'DDEKR3319K', status: 'VERIFIED' }],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-ananya',
        name: 'Ananya Iyer',
        phone: '9876543214',
        email: 'ananya.iyer@uohyd.ac.in',
        city: 'Hyderabad',
        segment: 'COLLEGE_STUDENT',
        upiVpa: 'ananya.iyer@okicici',
        institution: 'University of Hyderabad',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'EIYAP8712P', status: 'VERIFIED' }],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-kabir',
        name: 'Kabir Sethi',
        phone: '9876543215',
        email: 'kabir.lens@freelance.in',
        city: 'Hyderabad',
        segment: 'MICROENTREPRENEUR',
        upiVpa: 'kabir.creatives@paytm',
        institution: 'Indie Media & Film Production',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'FKSTH1190L', status: 'VERIFIED' }],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-pranav',
        name: 'Pranav Nair',
        phone: '9876543216',
        email: 'pranav.lead@ecell.org',
        city: 'Hyderabad',
        segment: 'CAMPUS_CLUB',
        upiVpa: 'pranav.ecell@upi',
        institution: 'Osmania E-Cell Club Lead',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'GPNAR6654N', status: 'VERIFIED' }],
        },
      },
    }),
    // Bengaluru and Pune Users
    prisma.user.create({
      data: {
        id: 'user-vikram',
        name: 'Vikram Rao',
        phone: '9876543217',
        email: 'vikram.rao@bengaluru.dev',
        city: 'Bengaluru',
        segment: 'YOUNG_PROFESSIONAL',
        upiVpa: 'vikram.rao@ybl',
        institution: 'Koramangala Startup Pod',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'HVKRA2299R', status: 'VERIFIED' }],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-meera',
        name: 'Meera Deshmukh',
        phone: '9876543218',
        email: 'meera.baker@pune.co',
        city: 'Pune',
        segment: 'MICROENTREPRENEUR',
        upiVpa: 'meera.crafts@okhdfcbank',
        institution: 'Meera Artisanal Crafts',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'JMDSH8823T', status: 'VERIFIED' }],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-devansh',
        name: 'Devansh Joshi',
        phone: '9876543219',
        email: 'devansh.coep@edu.in',
        city: 'Pune',
        segment: 'COLLEGE_STUDENT',
        upiVpa: 'devansh.j@upi',
        institution: 'COEP Technological University',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'KDJSH4491U', status: 'VERIFIED' }],
        },
      },
    }),
    // External Vetted Borrower (Cross-group / outside circle)
    prisma.user.create({
      data: {
        id: 'user-rahul-external',
        name: 'Rahul Gupta',
        phone: '9876543220',
        email: 'rahul.gupta@delhicampus.in',
        city: 'Hyderabad',
        segment: 'YOUNG_PROFESSIONAL',
        upiVpa: 'rahul.g@okaxis',
        institution: 'T-Hub Incubated Freelancer',
        isVerified: true,
        kycRecords: {
          create: [{ documentType: 'PAN', maskedNumber: 'LRGPT5511A', status: 'VERIFIED' }],
        },
      },
    }),
  ]);

  console.log(`Created ${users.length} users with verified KYC records.`);

  // 2. Seed Circles
  // Circle 1: Gachibowli Hostel Fellows (Hyderabad, Hostel group)
  const circle1 = await prisma.circle.create({
    data: {
      id: 'circle-gachibowli',
      name: 'Gachibowli Hostel Fellows',
      description: 'Hostel roommate pool for emergency semester dues, gadget repairs, and exams.',
      type: 'Hostel group',
      city: 'Hyderabad',
      createdById: 'demo-user-aarav',
      maxLoanAmount: 2000000, // ₹20,000
      interestRatePct: 9.5, // 9.5% p.a.
      approvalThresholdPct: 70.0, // 70% approval
      latePenaltyType: 'FLAT',
      latePenaltyValue: 5000, // ₹50 flat
      complianceMode: 'PARTNERED_ESCROW', // Mode A
      isPremium: true,
      poolBalance: 3200000, // ₹32,000 logical pool
    },
  });

  // Circle 2: Hi-Tech City Young Devs Circle (Hyderabad, Young professionals' group)
  const circle2 = await prisma.circle.create({
    data: {
      id: 'circle-hitech-devs',
      name: 'Hi-Tech City Young Devs',
      description: 'Monthly savings pool for early-career developers upskilling and equipment financing.',
      type: "Young professionals' group",
      city: 'Hyderabad',
      createdById: 'demo-user-aarav',
      maxLoanAmount: 2000000, // ₹20,000
      interestRatePct: 10.0,
      approvalThresholdPct: 70.0,
      latePenaltyType: 'PERCENTAGE',
      latePenaltyValue: 2, // 2%
      complianceMode: 'PARTNERED_ESCROW',
      isPremium: false,
      poolBalance: 4500000, // ₹45,000 logical pool
    },
  });

  // Circle 3: Osmania E-Cell Club Treasury (Hyderabad, Campus club/team)
  const circle3 = await prisma.circle.create({
    data: {
      id: 'circle-osmania-ecell',
      name: 'Osmania E-Cell Club Treasury',
      description: 'Student entrepreneurship treasury for micro-ventures, bootcamps, and hackathon gear.',
      type: 'Campus club/team',
      city: 'Hyderabad',
      createdById: 'demo-user-tanvi',
      maxLoanAmount: 1500000, // ₹15,000
      interestRatePct: 8.5,
      approvalThresholdPct: 75.0,
      latePenaltyType: 'FLAT',
      latePenaltyValue: 5000,
      complianceMode: 'CLOSED_CIRCLES', // Mode C
      isPremium: false,
      poolBalance: 2400000, // ₹24,000 logical pool
    },
  });

  // Circle 4: Bengaluru Freelancers Pod
  const circle4 = await prisma.circle.create({
    data: {
      id: 'circle-koramangala',
      name: 'Koramangala Creators Syndicate',
      description: 'P2P circle for independent design and tech consultants in Bengaluru.',
      type: 'Friend circle',
      city: 'Bengaluru',
      createdById: 'user-vikram',
      maxLoanAmount: 2000000,
      interestRatePct: 11.0,
      approvalThresholdPct: 70.0,
      latePenaltyType: 'FLAT',
      latePenaltyValue: 5000,
      complianceMode: 'PARTNERED_ESCROW',
      isPremium: false,
      poolBalance: 3000000, // ₹30,000
    },
  });

  // Circle 5: Pune COEP RoboTech
  const circle5 = await prisma.circle.create({
    data: {
      id: 'circle-coep-pune',
      name: 'COEP Tech Syndicate',
      description: 'Engineers pool for IoT sensors, robotics components, and tech certifications.',
      type: 'College group',
      city: 'Pune',
      createdById: 'user-devansh',
      maxLoanAmount: 1500000,
      interestRatePct: 9.0,
      approvalThresholdPct: 70.0,
      latePenaltyType: 'FLAT',
      latePenaltyValue: 5000,
      complianceMode: 'PARTNERED_ESCROW',
      isPremium: false,
      poolBalance: 1800000, // ₹18,000
    },
  });

  console.log('Created 5 Circles across Hyderabad, Bengaluru, and Pune.');

  // 3. Seed Memberships
  await prisma.membership.createMany({
    data: [
      // Circle 1 members (Gachibowli)
      { circleId: circle1.id, userId: 'demo-user-aarav', role: 'ADMIN', status: 'ACTIVE' },
      { circleId: circle1.id, userId: 'demo-user-rohan', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle1.id, userId: 'user-ananya', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle1.id, userId: 'user-sneha', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle1.id, userId: 'demo-user-tanvi', role: 'MEMBER', status: 'ACTIVE' },

      // Circle 2 members (Hi-Tech Devs)
      { circleId: circle2.id, userId: 'demo-user-aarav', role: 'ADMIN', status: 'ACTIVE' },
      { circleId: circle2.id, userId: 'user-sneha', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle2.id, userId: 'user-kabir', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle2.id, userId: 'demo-user-tanvi', role: 'MEMBER', status: 'ACTIVE' },

      // Circle 3 members (Osmania E-Cell)
      { circleId: circle3.id, userId: 'demo-user-tanvi', role: 'ADMIN', status: 'ACTIVE' },
      { circleId: circle3.id, userId: 'user-pranav', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle3.id, userId: 'demo-user-rohan', role: 'MEMBER', status: 'ACTIVE' },
      { circleId: circle3.id, userId: 'user-ananya', role: 'MEMBER', status: 'ACTIVE' },

      // Circle 4 (Bengaluru)
      { circleId: circle4.id, userId: 'user-vikram', role: 'ADMIN', status: 'ACTIVE' },
      { circleId: circle4.id, userId: 'user-kabir', role: 'MEMBER', status: 'ACTIVE' },

      // Circle 5 (Pune)
      { circleId: circle5.id, userId: 'user-devansh', role: 'ADMIN', status: 'ACTIVE' },
      { circleId: circle5.id, userId: 'user-meera', role: 'MEMBER', status: 'ACTIVE' },
    ],
  });

  // 4. Seed Monthly Contributions (₹500 - ₹5,000 per member)
  const contributionsData = [
    // Circle 1 contributions (Total = ₹40,000 committed)
    { circleId: circle1.id, userId: 'demo-user-aarav', amount: 150000, ref: 'UPI/20261001/101' }, // ₹1,500
    { circleId: circle1.id, userId: 'demo-user-aarav', amount: 200000, ref: 'UPI/20261002/102' }, // ₹2,000
    { circleId: circle1.id, userId: 'demo-user-rohan', amount: 80000, ref: 'UPI/20261001/103' },  // ₹800
    { circleId: circle1.id, userId: 'user-ananya', amount: 120000, ref: 'UPI/20261001/104' },     // ₹1,200
    { circleId: circle1.id, userId: 'user-sneha', amount: 250000, ref: 'UPI/20261001/105' },      // ₹2,500
    { circleId: circle1.id, userId: 'demo-user-tanvi', amount: 150000, ref: 'UPI/20261001/106' }, // ₹1,500

    // Circle 2 contributions
    { circleId: circle2.id, userId: 'demo-user-aarav', amount: 300000, ref: 'UPI/20261001/201' }, // ₹3,000
    { circleId: circle2.id, userId: 'user-sneha', amount: 200000, ref: 'UPI/20261001/202' },      // ₹2,000
    { circleId: circle2.id, userId: 'user-kabir', amount: 250000, ref: 'UPI/20261001/203' },      // ₹2,500
    { circleId: circle2.id, userId: 'demo-user-tanvi', amount: 200000, ref: 'UPI/20261001/204' }, // ₹2,000

    // Circle 3 contributions
    { circleId: circle3.id, userId: 'demo-user-tanvi', amount: 100000, ref: 'UPI/20261001/301' }, // ₹1,000
    { circleId: circle3.id, userId: 'user-pranav', amount: 150000, ref: 'UPI/20261001/302' },     // ₹1,500
    { circleId: circle3.id, userId: 'demo-user-rohan', amount: 50000, ref: 'UPI/20261001/303' },  // ₹500
    { circleId: circle3.id, userId: 'user-ananya', amount: 100000, ref: 'UPI/20261001/304' },     // ₹1,000
  ];

  for (const c of contributionsData) {
    await prisma.contribution.create({
      data: {
        circleId: c.circleId,
        userId: c.userId,
        amount: c.amount,
        simulatedUpiRef: c.ref,
        status: 'COMPLETED',
        note: 'Monthly circle pool commitment',
      },
    });

    // Record in ledger
    await prisma.ledgerEntry.create({
      data: {
        circleId: c.circleId,
        actorId: c.userId,
        actorName: (await prisma.user.findUnique({ where: { id: c.userId } }))?.name,
        type: 'CONTRIBUTION',
        amount: c.amount,
        balanceAfter: c.amount, // baseline entry
        referenceId: c.ref,
        description: `Member monthly contribution recorded via UPI`,
      },
    });
  }

  // 5. Seed Loans in every lifecycle state:
  // State A: Active Loan Repaying On-time (Rohan Verma borrowed ₹10,000 in Circle 1)
  const reqActiveOnTime = await prisma.loanRequest.create({
    data: {
      id: 'req-active-rohan',
      circleId: circle1.id,
      borrowerId: 'demo-user-rohan',
      amount: 1000000, // ₹10,000
      purpose: 'Education & Semester Fees',
      tenureMonths: 3,
      proposedInterestPct: 9.5,
      status: 'DISBURSED',
      votingDeadline: new Date(Date.now() - 30 * 86400000),
      approvedAt: new Date(Date.now() - 25 * 86400000),
    },
  });

  const schedActive = calculateLoanSchedule(1000000, 9.5, 3, new Date(Date.now() - 25 * 86400000));
  const loanActive = await prisma.loan.create({
    data: {
      id: 'loan-active-rohan',
      loanRequestId: reqActiveOnTime.id,
      circleId: circle1.id,
      borrowerId: 'demo-user-rohan',
      principalAmount: schedActive.principalAmount,
      interestRatePct: schedActive.interestRatePct,
      platformFeeAmount: schedActive.platformFee,
      tenureMonths: 3,
      status: 'ACTIVE',
      disbursedAt: new Date(Date.now() - 25 * 86400000),
      totalRepayable: schedActive.totalRepayable,
      outstandingBalance: schedActive.totalRepayable - schedActive.instalments[0].totalDue,
    },
  });

  // Disbursement record
  await prisma.disbursement.create({
    data: {
      loanId: loanActive.id,
      lenderId: 'demo-user-aarav',
      amount: 1000000,
      upiTransactionRef: 'UPI/20260918/9881721',
      status: 'SUCCESS',
      completedAt: new Date(Date.now() - 25 * 86400000),
    },
  });

  // Platform Fee entry
  await prisma.platformFee.create({
    data: {
      loanId: loanActive.id,
      amount: schedActive.platformFee,
      percentage: 1.5,
      status: 'COLLECTED',
    },
  });

  // AutoPay Mandate
  await prisma.mandate.create({
    data: {
      loanId: loanActive.id,
      borrowerId: 'demo-user-rohan',
      vpa: 'rohan.verma@upi',
      maxAmount: 400000, // ₹4,000
      status: 'ACTIVE',
      umrn: 'UMRN991204892AAIN',
    },
  });

  // Instalments: #1 Paid on time, #2 Upcoming in 5 days, #3 Upcoming next month
  const inst1 = await prisma.instalment.create({
    data: {
      loanId: loanActive.id,
      instalmentNumber: 1,
      dueDate: new Date(Date.now() - 5 * 86400000),
      principalDue: schedActive.instalments[0].principalDue,
      interestDue: schedActive.instalments[0].interestDue,
      totalDue: schedActive.instalments[0].totalDue,
      principalPaid: schedActive.instalments[0].principalDue,
      interestPaid: schedActive.instalments[0].interestDue,
      status: 'PAID',
      paidAt: new Date(Date.now() - 6 * 86400000),
    },
  });

  await prisma.repayment.create({
    data: {
      loanId: loanActive.id,
      instalmentId: inst1.id,
      payerId: 'demo-user-rohan',
      principalAmount: schedActive.instalments[0].principalDue,
      interestAmount: schedActive.instalments[0].interestDue,
      totalAmount: schedActive.instalments[0].totalDue,
      paymentMethod: 'AUTOPAY_MANDATE',
      simulatedUpiRef: 'UPI/20261008/AUTO019',
      status: 'SUCCESS',
      paidAt: new Date(Date.now() - 6 * 86400000),
    },
  });

  // Instalment #2
  await prisma.instalment.create({
    data: {
      loanId: loanActive.id,
      instalmentNumber: 2,
      dueDate: new Date(Date.now() + 5 * 86400000),
      principalDue: schedActive.instalments[1].principalDue,
      interestDue: schedActive.instalments[1].interestDue,
      totalDue: schedActive.instalments[1].totalDue,
      status: 'DUE',
    },
  });

  // Instalment #3
  await prisma.instalment.create({
    data: {
      loanId: loanActive.id,
      instalmentNumber: 3,
      dueDate: new Date(Date.now() + 35 * 86400000),
      principalDue: schedActive.instalments[2].principalDue,
      interestDue: schedActive.instalments[2].interestDue,
      totalDue: schedActive.instalments[2].totalDue,
      status: 'UPCOMING',
    },
  });

  // State B: Loan actively in VOTING (Sneha Reddy requested ₹15,000 for Upskilling in Circle 1)
  const reqVoting = await prisma.loanRequest.create({
    data: {
      id: 'req-voting-sneha',
      circleId: circle1.id,
      borrowerId: 'user-sneha',
      amount: 1500000, // ₹15,000
      purpose: 'Professional Skills & Upskilling',
      tenureMonths: 4,
      proposedInterestPct: 10.0,
      status: 'VOTING',
      votingDeadline: new Date(Date.now() + 48 * 3600000), // 48h window
    },
  });

  // Votes: Aarav approved, Ananya approved (2 / 4 votes = 50%, needs 70% = 3 votes)
  await prisma.vote.create({
    data: {
      loanRequestId: reqVoting.id,
      voterId: 'demo-user-aarav',
      decision: 'APPROVE',
      comment: 'Sneha is an active contributor with clean track record. Approved.',
    },
  });
  await prisma.vote.create({
    data: {
      loanRequestId: reqVoting.id,
      voterId: 'user-ananya',
      decision: 'APPROVE',
      comment: 'All good for cloud cert fee.',
    },
  });

  // State C: Loan APPROVED, Ready for UPI Disbursement (Ananya requested ₹8,000 in Circle 1)
  const reqApproved = await prisma.loanRequest.create({
    data: {
      id: 'req-approved-ananya',
      circleId: circle1.id,
      borrowerId: 'user-ananya',
      amount: 800000, // ₹8,000
      purpose: 'Gadgets & Laptop / Lifestyle',
      tenureMonths: 2,
      proposedInterestPct: 9.5,
      status: 'APPROVED',
      votingDeadline: new Date(Date.now() - 2 * 3600000),
      approvedAt: new Date(Date.now() - 1 * 3600000),
    },
  });

  await prisma.vote.createMany({
    data: [
      { loanRequestId: reqApproved.id, voterId: 'demo-user-aarav', decision: 'APPROVE', comment: 'Approved' },
      { loanRequestId: reqApproved.id, voterId: 'user-sneha', decision: 'APPROVE', comment: 'Supported' },
      { loanRequestId: reqApproved.id, voterId: 'demo-user-tanvi', decision: 'APPROVE', comment: 'Threshold met' },
    ],
  });

  // State D: OVERDUE Loan with Penalty (Kabir Sethi in Circle 2 borrowed ₹12,000, missed payment by 12 days)
  const reqOverdue = await prisma.loanRequest.create({
    data: {
      id: 'req-overdue-kabir',
      circleId: circle2.id,
      borrowerId: 'user-kabir',
      amount: 1200000, // ₹12,000
      purpose: 'Micro-business Inventory & Working Capital',
      tenureMonths: 3,
      proposedInterestPct: 10.0,
      status: 'DISBURSED',
      votingDeadline: new Date(Date.now() - 60 * 86400000),
      approvedAt: new Date(Date.now() - 55 * 86400000),
    },
  });

  const schedOverdue = calculateLoanSchedule(1200000, 10.0, 3, new Date(Date.now() - 55 * 86400000));
  const loanOverdue = await prisma.loan.create({
    data: {
      id: 'loan-overdue-kabir',
      loanRequestId: reqOverdue.id,
      circleId: circle2.id,
      borrowerId: 'user-kabir',
      principalAmount: 1200000,
      interestRatePct: 10.0,
      platformFeeAmount: schedOverdue.platformFee,
      tenureMonths: 3,
      status: 'OVERDUE',
      disbursedAt: new Date(Date.now() - 55 * 86400000),
      totalRepayable: schedOverdue.totalRepayable,
      outstandingBalance: schedOverdue.totalRepayable,
    },
  });

  // Overdue instalment with 2% penalty applied (2% of ₹4,100 = ₹82 = 8200 paise)
  await prisma.instalment.create({
    data: {
      loanId: loanOverdue.id,
      instalmentNumber: 1,
      dueDate: new Date(Date.now() - 14 * 86400000),
      principalDue: schedOverdue.instalments[0].principalDue,
      interestDue: schedOverdue.instalments[0].interestDue,
      totalDue: schedOverdue.instalments[0].totalDue,
      penaltyDue: 8200, // late penalty applied!
      status: 'OVERDUE',
    },
  });

  // State E: RESTRUCTURED Loan (Tanvi Patel restructured repayment in Circle 3)
  const reqRestructured = await prisma.loanRequest.create({
    data: {
      id: 'req-restruct-tanvi',
      circleId: circle3.id,
      borrowerId: 'demo-user-tanvi',
      amount: 1000000, // ₹10,000
      purpose: 'Micro-business Inventory & Working Capital',
      tenureMonths: 6,
      proposedInterestPct: 8.5,
      status: 'DISBURSED',
      votingDeadline: new Date(Date.now() - 90 * 86400000),
      approvedAt: new Date(Date.now() - 85 * 86400000),
    },
  });

  const loanRestructured = await prisma.loan.create({
    data: {
      id: 'loan-restruct-tanvi',
      loanRequestId: reqRestructured.id,
      circleId: circle3.id,
      borrowerId: 'demo-user-tanvi',
      principalAmount: 1000000,
      interestRatePct: 8.5,
      platformFeeAmount: 15000,
      tenureMonths: 6,
      status: 'RESTRUCTURED',
      disbursedAt: new Date(Date.now() - 85 * 86400000),
      totalRepayable: 1042500,
      outstandingBalance: 695000,
    },
  });

  await prisma.restructureProposal.create({
    data: {
      loanId: loanRestructured.id,
      proposedTenureMonths: 6,
      newInterestPct: 8.5,
      reason: 'Delayed client invoice payment for studio merchandise; requested 2-month extension with peer consent.',
      status: 'APPROVED',
    },
  });

  // State F: VETTED EXTERNAL BORROWER Loan (Rahul Gupta from Hyderabad incubator)
  await prisma.loanRequest.create({
    data: {
      id: 'req-external-rahul',
      circleId: circle1.id,
      borrowerId: 'user-rahul-external',
      amount: 1200000, // ₹12,000
      purpose: 'Professional Skills & Upskilling',
      tenureMonths: 3,
      proposedInterestPct: 11.5,
      status: 'VOTING',
      isExternal: true,
      externalVetted: true,
      votingDeadline: new Date(Date.now() + 36 * 3600000),
    },
  });

  // State G: DEFAULTED / AT-RISK Loan (to demonstrate Risk-Sharing calculation!)
  const reqDefaulted = await prisma.loanRequest.create({
    data: {
      id: 'req-default-demo',
      circleId: circle1.id,
      borrowerId: 'user-kabir',
      amount: 1000000, // ₹10,000
      purpose: 'Urgent Medical / Personal Emergency',
      tenureMonths: 2,
      proposedInterestPct: 9.5,
      status: 'DISBURSED',
      votingDeadline: new Date(Date.now() - 120 * 86400000),
      approvedAt: new Date(Date.now() - 110 * 86400000),
    },
  });

  const loanDefaulted = await prisma.loan.create({
    data: {
      id: 'loan-default-demo',
      loanRequestId: reqDefaulted.id,
      circleId: circle1.id,
      borrowerId: 'user-kabir',
      principalAmount: 1000000,
      interestRatePct: 9.5,
      platformFeeAmount: 15000,
      tenureMonths: 2,
      status: 'DEFAULTED',
      disbursedAt: new Date(Date.now() - 110 * 86400000),
      totalRepayable: 1015833,
      outstandingBalance: 1000000,
    },
  });

  // Split funding disbursements between Aarav (60%) and Sneha (40%)
  await prisma.disbursement.createMany({
    data: [
      {
        loanId: loanDefaulted.id,
        lenderId: 'demo-user-aarav',
        amount: 600000, // ₹6,000 (60%)
        upiTransactionRef: 'UPI/20260710/SPLIT01',
        status: 'SUCCESS',
      },
      {
        loanId: loanDefaulted.id,
        lenderId: 'user-sneha',
        amount: 400000, // ₹4,000 (40%)
        upiTransactionRef: 'UPI/20260710/SPLIT02',
        status: 'SUCCESS',
      },
    ],
  });

  // 6. Seed Risk Score Snapshots
  await prisma.riskScoreSnapshot.createMany({
    data: [
      {
        userId: 'demo-user-rohan',
        score: 82,
        riskBand: 'LOW',
        repaymentFactor: 90,
        tenureFactor: 75,
        approvalFactor: 85,
        exposureFactor: 80,
        verificationFactor: 100,
        notes: 'Verified IIIT student with perfect on-time EMI track record.',
      },
      {
        userId: 'demo-user-aarav',
        score: 95,
        riskBand: 'LOW',
        repaymentFactor: 100,
        tenureFactor: 95,
        approvalFactor: 98,
        exposureFactor: 90,
        verificationFactor: 100,
        notes: 'Top tier community lender and circle administrator.',
      },
      {
        userId: 'demo-user-tanvi',
        score: 78,
        riskBand: 'LOW',
        repaymentFactor: 75,
        tenureFactor: 80,
        approvalFactor: 80,
        exposureFactor: 70,
        verificationFactor: 100,
        notes: 'Active studio entrepreneur with healthy peer consensus.',
      },
      {
        userId: 'user-kabir',
        score: 48,
        riskBand: 'HIGH',
        repaymentFactor: 30,
        tenureFactor: 50,
        approvalFactor: 60,
        exposureFactor: 40,
        verificationFactor: 100,
        notes: 'Overdue instalment and defaulted loan trigger high risk band.',
      },
      {
        userId: 'user-rahul-external',
        score: 71,
        riskBand: 'MEDIUM',
        repaymentFactor: 70,
        tenureFactor: 60,
        approvalFactor: 75,
        exposureFactor: 65,
        verificationFactor: 100,
        notes: 'Vetted external applicant via T-Hub community verification.',
      },
    ],
  });

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: 'demo-user-aarav',
        circleId: circle1.id,
        title: 'New Loan Request Pending Vote',
        message: 'Sneha Reddy requested ₹15,000 for Professional Skills & Upskilling.',
        type: 'VOTE_REQUEST',
        linkUrl: '/loans/req-voting-sneha',
      },
      {
        userId: 'demo-user-rohan',
        circleId: circle1.id,
        title: 'Upcoming EMI Due in 5 Days',
        message: 'Your monthly instalment of ₹3,412 is due on the 18th.',
        type: 'PAYMENT_DUE',
        linkUrl: '/loans/loan-active-rohan',
      },
      {
        userId: 'demo-user-tanvi',
        circleId: circle3.id,
        title: 'Circle Restructure Approved',
        message: 'Your tenure extension to 6 months was approved by Osmania E-Cell members.',
        type: 'SYSTEM',
        linkUrl: '/loans/loan-restruct-tanvi',
      },
    ],
  });

  // 8. Seed Invites
  await prisma.invite.createMany({
    data: [
      {
        circleId: circle1.id,
        code: 'GACHI70',
        inviterId: 'demo-user-aarav',
        status: 'PENDING',
      },
      {
        circleId: circle2.id,
        code: 'HITECH99',
        inviterId: 'demo-user-aarav',
        status: 'PENDING',
      },
      {
        circleId: circle3.id,
        code: 'ECELL24',
        inviterId: 'demo-user-tanvi',
        status: 'PENDING',
      },
    ],
  });

  // 9. Circle Premium Subscription (Circle 1 has Circle Pro)
  await prisma.premiumSubscription.create({
    data: {
      circleId: circle1.id,
      planName: 'Circle Pro',
      monthlyFee: 9900, // ₹99
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  console.log('Seeding completed successfully with rich Indian credit circle data!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
