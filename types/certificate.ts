export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  skillTrackId: string;
  skillTrackTitle: string;
  completionDate: string;
  verificationId: string;
  blockchainHash: string;
  nftTokenId?: string;
  shareableLink: string;
  lessonsCompleted: number;
  totalLessons: number;
  finalScore: number;
  timeSpent: number; // in minutes
}

export interface CertificateTemplate {
  id: string;
  name: string;
  colors: string[];
  pattern: 'gradient' | 'geometric' | 'waves';
}