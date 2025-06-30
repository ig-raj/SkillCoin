import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription, UsageStats, SubscriptionTier, subscriptionTiers } from '@/types/subscription';

export const getDefaultSubscription = (): UserSubscription => ({
  tier: 'free',
  status: 'active',
  startDate: new Date().toISOString(),
  autoRenew: false,
});

export const getDefaultUsageStats = (): UsageStats => ({
  lessonsToday: 0,
  lessonsThisMonth: 0,
  certificatesEarned: 0,
  mentorCallsUsed: 0,
  mentorCallsAvailable: 0,
});

export const getUserSubscription = async (): Promise<UserSubscription> => {
  try {
    const subscription = await AsyncStorage.getItem('userSubscription');
    return subscription ? JSON.parse(subscription) : getDefaultSubscription();
  } catch (error) {
    console.error('Error loading subscription:', error);
    return getDefaultSubscription();
  }
};

export const saveUserSubscription = async (subscription: UserSubscription): Promise<void> => {
  try {
    await AsyncStorage.setItem('userSubscription', JSON.stringify(subscription));
  } catch (error) {
    console.error('Error saving subscription:', error);
  }
};

export const getUserUsageStats = async (): Promise<UsageStats> => {
  try {
    const stats = await AsyncStorage.getItem('usageStats');
    return stats ? JSON.parse(stats) : getDefaultUsageStats();
  } catch (error) {
    console.error('Error loading usage stats:', error);
    return getDefaultUsageStats();
  }
};

export const saveUserUsageStats = async (stats: UsageStats): Promise<void> => {
  try {
    await AsyncStorage.setItem('usageStats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving usage stats:', error);
  }
};

export const incrementLessonCount = async (): Promise<boolean> => {
  const subscription = await getUserSubscription();
  const stats = await getUserUsageStats();
  
  // Check if user can take more lessons
  if (subscription.tier === 'free' && stats.lessonsToday >= 3) {
    return false; // Limit reached
  }
  
  // Increment counters
  const updatedStats = {
    ...stats,
    lessonsToday: stats.lessonsToday + 1,
    lessonsThisMonth: stats.lessonsThisMonth + 1,
  };
  
  await saveUserUsageStats(updatedStats);
  return true;
};

export const canAccessFeature = async (featureId: string): Promise<boolean> => {
  const subscription = await getUserSubscription();
  const tier = subscriptionTiers.find(t => t.id === subscription.tier);
  
  if (!tier) return false;
  
  const feature = tier.features.find(f => f.id === featureId);
  return feature?.included || false;
};

export const getRemainingTrialDays = (subscription: UserSubscription): number => {
  if (!subscription.trialEndDate || subscription.status !== 'trial') return 0;
  
  const trialEnd = new Date(subscription.trialEndDate);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

export const startFreeTrial = async (tierId: 'premium' | 'pro'): Promise<UserSubscription> => {
  const tier = subscriptionTiers.find(t => t.id === tierId);
  if (!tier || !tier.trialDays) {
    throw new Error('Invalid tier or no trial available');
  }
  
  const now = new Date();
  const trialEnd = new Date(now.getTime() + (tier.trialDays * 24 * 60 * 60 * 1000));
  
  const subscription: UserSubscription = {
    tier: tierId,
    status: 'trial',
    startDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    autoRenew: false,
  };
  
  await saveUserSubscription(subscription);
  return subscription;
};

export const simulatePayment = async (tierId: 'premium' | 'pro', paymentMethod: string): Promise<UserSubscription> => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const now = new Date();
  const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  
  const subscription: UserSubscription = {
    tier: tierId,
    status: 'active',
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    autoRenew: true,
    paymentMethod,
  };
  
  await saveUserSubscription(subscription);
  return subscription;
};

export const cancelSubscription = async (): Promise<UserSubscription> => {
  const currentSubscription = await getUserSubscription();
  
  const updatedSubscription: UserSubscription = {
    ...currentSubscription,
    status: 'cancelled',
    autoRenew: false,
  };
  
  await saveUserSubscription(updatedSubscription);
  return updatedSubscription;
};

export const resetDailyUsage = async (): Promise<void> => {
  const stats = await getUserUsageStats();
  const updatedStats = {
    ...stats,
    lessonsToday: 0,
  };
  await saveUserUsageStats(updatedStats);
};