
export enum AppRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  COLLEGE = 'COLLEGE',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export type UserStatus = 'NOT_STARTED' | 'ONBOARDING' | 'TRAINING' | 'INTERVIEWING' | 'PLACED';

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  college: string;
  education: string;
  degree: string;
  gradYear: string;
  targetDomain: string;
  skills: string[];
  readinessScore: number;
}

export interface RoleCard {
  id: string;
  title: string;
  companies: string[];
  salaryRange: string;
  duration: string;
  hasAssurance: boolean;
}

export interface MatchCandidate {
  id: string;
  name: string;
  readiness: number;
  skillFit: number;
  college: string;
}
