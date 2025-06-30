export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  applicationCost: number; // SkillCoins required to apply
  postedDate: string;
  applicationDeadline?: string;
  isPartnership: boolean; // Premium company partnership
  companySize: string;
  industry: string;
  tags: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired';
  coverLetter?: string;
  resumeUrl?: string;
  skillMatchScore: number;
}

export interface SkillMatch {
  skill: string;
  userHasSkill: boolean;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  importance: 'required' | 'preferred';
}

export interface InterviewPrep {
  jobId: string;
  skillBasedQuestions: InterviewQuestion[];
  generalQuestions: InterviewQuestion[];
  companyResearch: CompanyInfo;
  preparationTips: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer?: string;
  tips: string[];
}

export interface CompanyInfo {
  name: string;
  description: string;
  culture: string[];
  recentNews: string[];
  interviewProcess: string[];
}

export interface SuccessStory {
  id: string;
  userName: string;
  userAvatar?: string;
  jobTitle: string;
  company: string;
  skillsUsed: string[];
  story: string;
  timeToHire: number; // days
  salaryIncrease?: number; // percentage
  date: string;
}

export interface JobFilters {
  location?: string;
  locationType?: ('remote' | 'hybrid' | 'onsite')[];
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: ('entry' | 'mid' | 'senior' | 'lead')[];
  skills?: string[];
  industry?: string[];
  companySize?: string[];
  isPartnership?: boolean;
}