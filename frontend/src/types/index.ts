export type UserRole = 'Specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
}

export type ReferralStatus = 'Referred' | 'In Progress' | 'Completed';

export type UserRef = {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
};

export interface FollowUp {
  date: string;
  note: string;
  type: 'Checkup' | 'Note' | 'Treatment' | 'Observation' | 'X-Ray' | 'Procedure' | 'Prescription';
  status: string;
  files?: string[];
}

export interface Referral {
  id: string;
  patientName: string;
  age?: number;
  phoneNumber: string;
  issueDescription: string;
  files: string[];
  status: ReferralStatus;
  feedback?: string;
  createdAt: string;
  referredByDoctorId?: string;
  referredByDoctorName?: string;
  referredByDoctorPhone?: string;
  assignedTo?: UserRef | string;
  followUps?: FollowUp[];
}

export interface OTPResponse {
  success: boolean;
  message?: string;
}

export const referralStatusOrder: ReferralStatus[] = [
  'Referred',
  'In Progress',
  'Completed',
];
