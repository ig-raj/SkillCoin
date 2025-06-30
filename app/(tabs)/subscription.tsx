import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Star, Gift, CreditCard, Calendar, Settings } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { subscriptionTiers, UserSubscription, UsageStats } from '@/types/subscription';
import { getUserSubscription, getUserUsageStats, startFreeTrial, simulatePayment, getRemainingTrialDays } from '@/utils/subscriptionManager';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function SubscriptionScreen() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [subData, statsData] = await Promise.all([
        getUserSubscription(),
        getUserUsageStats(),
      ]);
      setSubscription(subData);
      setUsageStats(statsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const handleUpgrade = async (tierId: 'premium' | 'pro') => {
    if (!subscription) return;

    setLoading(true);
    try {
      // Start free trial first
      const trialSubscription = await startFreeTrial(tierId);
      setSubscription(trialSubscription);
      
      Alert.alert(
        '🎉 Free Trial Started!',
        `You now have access to all ${tierId} features for ${subscriptionTiers.find(t => t.id === tierId)?.trialDays} days.`,
        [{ text: 'Start Learning', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (tierId: 'premium' | 'pro') => {
    Alert.alert(
      'Choose Payment Method',
      'Select how you\'d like to pay for your subscription',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit Card', onPress: () => processPayment(tierId, 'Credit Card') },
        { text: 'PayPal', onPress: () => processPayment(tierId, 'PayPal') },
        { text: 'Apple Pay', onPress: () => processPayment(tierId, 'Apple Pay') },
      ]
    );
  };

  const processPayment = async (tierId: 'premium' | 'pro', paymentMethod: string) => {
    setLoading(true);
    try {
      const paidSubscription = await simulatePayment(tierId, paymentMethod);
      setSubscription(paidSubscription);
      
      Alert.alert(
        '✅ Payment Successful!',
        `Welcome to ${tierId}! Your subscription is now active.`,
        [{ text: 'Start Learning', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const getUsageProgress = () => {
    if (!usageStats || !subscription) return { used: 0, total: 3, percentage: 0 };
    
    if (subscription.tier !== 'free') {
      return { used: usageStats.lessonsToday, total: '∞', percentage: 0 };
    }
    
    const used = usageStats.lessonsToday;
    const total = 3;
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  };

  const renderCurrentPlan = () => {
    if (!subscription) return null;

    const currentTier = subscriptionTiers.find(t => t.id === subscription.tier);
    const usage = getUsageProgress();
    const trialDays = getRemainingTrialDays(subscription);

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.currentPlanCard}>
        <View style={styles.currentPlanHeader}>
          <View style={styles.currentPlanInfo}>
            <Text style={styles.currentPlanTitle}>Current Plan</Text>
            <Text style={styles.currentPlanName}>{currentTier?.name}</Text>
            {subscription.status === 'trial' && (
              <Text style={styles.trialStatus}>
                {trialDays} days left in trial
              </Text>
            )}
          </View>
          <View style={styles.currentPlanIcon}>
            {subscription.tier === 'pro' ? (
              <Crown color="#F59E0B" size={24} />
            ) : subscription.tier === 'premium' ? (
              <Star color="#667eea" size={24} />
            ) : (
              <Gift color="#10B981" size={24} />
            )}
          </View>
        </View>

        {subscription.tier === 'free' && (
          <View style={styles.usageContainer}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Daily Lessons</Text>
              <Text style={styles.usageText}>{usage.used}/{usage.total}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${usage.percentage}%` }]} />
            </View>
            {usage.used >= 3 && (
              <Text style={styles.limitText}>Daily limit reached. Upgrade for unlimited access!</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/subscription-management')}>
          <Settings color="#667eea" size={16} />
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!subscription || !usageStats) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Unlock your learning potential</Text>
          </Animated.View>

          {/* Current Plan */}
          {renderCurrentPlan()}

          {/* Subscription Plans */}
          <View style={styles.plansContainer}>
            {subscriptionTiers.map((tier, index) => (
              <Animated.View
                key={tier.id}
                entering={FadeInUp.delay(600 + index * 200)}
              >
                <SubscriptionCard
                  tier={tier}
                  isCurrentTier={subscription.tier === tier.id}
                  showTrial={subscription.tier === 'free'}
                  onSelect={() => {
                    if (tier.id === 'free' || subscription.tier === tier.id) return;
                    
                    if (subscription.tier === 'free' && tier.trialDays) {
                      handleUpgrade(tier.id as 'premium' | 'pro');
                    } else {
                      handlePayment(tier.id as 'premium' | 'pro');
                    }
                  }}
                />
              </Animated.View>
            ))}
          </View>

          {/* Features Comparison */}
          <Animated.View entering={FadeInUp.delay(1200)} style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Feature Comparison</Text>
            <TouchableOpacity style={styles.comparisonButton}>
              <Text style={styles.comparisonButtonText}>View Detailed Comparison</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* FAQ */}
          <Animated.View entering={FadeInUp.delay(1400)} style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>Yes, you can cancel your subscription at any time from your account settings.</Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens after my trial ends?</Text>
              <Text style={styles.faqAnswer}>You'll be automatically charged unless you cancel before the trial period ends.</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.8,
  },
  currentPlanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  trialStatus: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginTop: 4,
  },
  currentPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  usageText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#667eea',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  limitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
  },
  manageButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginLeft: 8,
  },
  plansContainer: {
    paddingHorizontal: 24,
  },
  comparisonSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  comparisonButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  faqSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  faqTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});