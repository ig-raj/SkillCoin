export interface SubscriptionTier {
  id: 'free' | 'premium' | 'pro';
  name: string;
  price: number;
  period: 'month' | 'year';
  features: SubscriptionFeature[];
  popular?: boolean;
  trialDays?: number;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  highlight?: boolean;
}

export interface UserSubscription {
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface UsageStats {
  lessonsToday: number;
  lessonsThisMonth: number;
  certificatesEarned: number;
  mentorCallsUsed: number;
  mentorCallsAvailable: number;
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      { id: 'lessons', name: '3 lessons per day', description: 'Access to basic learning content', included: true },
      { id: 'certificates', name: 'Basic certificates', description: 'Standard completion certificates', included: true },
      { id: 'community', name: 'Community access', description: 'Join discussions and forums', included: true },
      { id: 'ai-tutor', name: 'AI Tutor (Limited)', description: '10 questions per day', included: true },
      { id: 'unlimited-lessons', name: 'Unlimited lessons', description: 'Learn without daily limits', included: false },
      { id: 'advanced-certificates', name: 'Advanced certificates', description: 'Blockchain-verified NFT certificates', included: false },
      { id: 'priority-support', name: 'Priority AI Tutor', description: 'Faster responses and advanced features', included: false },
      { id: 'job-board', name: 'Job board access', description: 'Exclusive job opportunities', included: false },
      { id: 'mentor-calls', name: '1-on-1 mentor calls', description: 'Personal guidance from experts', included: false },
      { id: 'custom-paths', name: 'Custom learning paths', description: 'Personalized curriculum', included: false },
      { id: 'company-partnerships', name: 'Company partnerships', description: 'Direct connections with employers', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    popular: true,
    trialDays: 7,
    features: [
      { id: 'lessons', name: 'Unlimited lessons', description: 'Learn without any restrictions', included: true, highlight: true },
      { id: 'certificates', name: 'Advanced certificates', description: 'Blockchain-verified NFT certificates', included: true, highlight: true },
      { id: 'community', name: 'Premium community', description: 'Exclusive premium member forums', included: true },
      { id: 'ai-tutor', name: 'Priority AI Tutor', description: 'Unlimited questions with faster responses', included: true, highlight: true },
      { id: 'job-board', name: 'Job board access', description: 'Exclusive job opportunities', included: true, highlight: true },
      { id: 'analytics', name: 'Advanced analytics', description: 'Detailed progress tracking', included: true },
      { id: 'offline-mode', name: 'Offline learning', description: 'Download lessons for offline access', included: true },
      { id: 'mentor-calls', name: '1-on-1 mentor calls', description: 'Personal guidance from experts', included: false },
      { id: 'custom-paths', name: 'Custom learning paths', description: 'Personalized curriculum', included: false },
      { id: 'company-partnerships', name: 'Company partnerships', description: 'Direct connections with employers', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    period: 'month',
    trialDays: 7,
    features: [
      { id: 'lessons', name: 'Unlimited lessons', description: 'Learn without any restrictions', included: true },
      { id: 'certificates', name: 'Advanced certificates', description: 'Blockchain-verified NFT certificates', included: true },
      { id: 'community', name: 'Pro community', description: 'Exclusive pro member forums', included: true },
      { id: 'ai-tutor', name: 'Priority AI Tutor', description: 'Unlimited questions with fastest responses', included: true },
      { id: 'job-board', name: 'Premium job board', description: 'Exclusive high-paying opportunities', included: true },
      { id: 'analytics', name: 'Advanced analytics', description: 'Detailed progress tracking', included: true },
      { id: 'offline-mode', name: 'Offline learning', description: 'Download lessons for offline access', included: true },
      { id: 'mentor-calls', name: '4 mentor calls/month', description: 'Personal guidance from industry experts', included: true, highlight: true },
      { id: 'custom-paths', name: 'Custom learning paths', description: 'AI-generated personalized curriculum', included: true, highlight: true },
      { id: 'company-partnerships', name: 'Company partnerships', description: 'Direct connections with top employers', included: true, highlight: true },
      { id: 'career-coaching', name: 'Career coaching', description: 'Resume review and interview prep', included: true, highlight: true },
    ],
  },
];