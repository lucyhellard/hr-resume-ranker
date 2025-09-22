export interface Job {
  id: string;
  title: string;
  description?: string;
  location?: string;
  experienceRequired?: string;
  applicantCount: number;
  shortlistedCount: number;
  hiringManager: string;
  status: 'open' | 'closed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  jobId: string;
  resumeUrl?: string;
  scores: {
    jobMatch: number;
    experience: number;
    skills: number;
    culture: number;
    education: number;
    achievements: number;
    overall: number;
  };
  strengths: string[];
  gaps: string[];
  skills: {
    required: string[];
    actual: string[];
  };
  status: 'applied' | 'shortlisted' | 'interview' | 'offer' | 'rejected';
  createdAt: Date;
}

export interface Report {
  id: string;
  name: string;
  jobTitle: string;
  type: 'shortlist' | 'interview-pack' | 'bias-free-comparison';
  createdAt: Date;
  createdBy: string;
  url?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'recruiter' | 'admin';
}