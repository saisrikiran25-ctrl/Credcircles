/**
 * Demo Session & Active User Management
 * Allows switching between demo personas or logging in via phone + simulated OTP.
 */

export interface DemoPersona {
  id: string;
  name: string;
  phone: string;
  roleDescription: string;
  avatar: string;
  segment: string;
  city: string;
  upiVpa: string;
  isVerified: boolean;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'demo-user-rohan',
    name: 'Rohan Verma',
    phone: '9876543210',
    roleDescription: 'Student Borrower (IIIT Hyderabad)',
    avatar: 'RV',
    segment: 'College Student (18-24)',
    city: 'Hyderabad',
    upiVpa: 'rohan.verma@upi',
    isVerified: true,
  },
  {
    id: 'demo-user-aarav',
    name: 'Aarav Sharma',
    phone: '9876543211',
    roleDescription: 'Circle Admin & Active Lender',
    avatar: 'AS',
    segment: 'Young Professional (22-30)',
    city: 'Hyderabad',
    upiVpa: 'aarav.fin@okaxis',
    isVerified: true,
  },
  {
    id: 'demo-user-tanvi',
    name: 'Tanvi Patel',
    phone: '9876543212',
    roleDescription: 'Microentrepreneur / Club Lead',
    avatar: 'TP',
    segment: 'Microentrepreneur',
    city: 'Hyderabad',
    upiVpa: 'tanvi.studio@okhdfcbank',
    isVerified: true,
  },
];

export const DEFAULT_USER_ID = 'demo-user-rohan';
