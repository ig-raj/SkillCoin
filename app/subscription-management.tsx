import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Calendar, CircleAlert as AlertCircle, Crown, Star, Gift, Settings } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { UserSubscription, UsageStats, subscriptionTiers } from '@/types/subscription';
import { getUserSubscription, getUserUsageStats, cancelSubscription, getRemainingTrialDays } from '@/utils/subscriptionManager';

export default function SubscriptionManagementScreen() {
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

  const handleCancelSubscription = () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const cancelledSub = await cancelSubscription();
              setSubscription(cancelledSub);
              Alert.alert(
                'Subscription Cancelled',
                'Your subscription has been cancelled. You\'ll continue to have access until the end of your billing period.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePayment = () => {
    Alert.alert(
      'Update Payment Method',
      'Choose a new payment method',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit Card', onPress: () => updatePaymentMethod('Credit Card') },
        { text: 'PayPal', onPress: () => updatePaymentMethod('PayPal') },
        { text: 'Apple Pay', onPress: () => updatePaymentMethod('Apple Pay') },
      ]
    );
  };

  const updatePaymentMethod = (method: string) => {
    Alert.alert('Payment Updated', `Your payment method has been updated to ${method}.`);
  };

  const renderSubscriptionInfo = () => {
    if (!subscription) return null;

    const currentTier = subscriptionTiers.find(t => t.id === subscription.tier);
    const trialDays = getRemainingTrialDays(subscription);
    
    const getStatusColor = () => {
      switch (subscription.status) {
        case 'active': return '#10B981';
        case 'trial': return '#F59E0B';
        case 'cancelled': return '#EF4444';
        case 'expired': return '#6B7280';
        default: return '#6B7280';
      }
    };

    const getStatusText = () => {
      switch (subscription.status) {
        case 'active': return 'Active';
        case 'trial': return `Trial (${trialDays} days left)`;
        case 'cancelled': return 'Cancelled';
        case 'expired': return 'Expired';
        default: return 'Unknown';
      }
    };

    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.tierInfo}>
            <View style={styles.tierIcon}>
              {subscription.tier === 'pro' ? (
                <Crown color="#F59E0B" size={24} />
              ) : subscription.tier === 'premium' ? (
                <Star color="#667eea" size={24} />
              ) : (
                <Gift color="#10B981" size={24} />
              )}
            </View>
            <View>
              <Text style={styles.tierName}>{currentTier?.name} Plan</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.price}>
              ${currentTier?.price || 0}
            </Text>
            <Text style={styles.period}>
              {currentTier?.price === 0 ? 'free' : '/month'}
            </Text>
          </View>
        </View>

        {subscription.tier !== 'free' && (
          <View style={styles.billingInfo}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Next billing date:</Text>
              <Text style={styles.billingValue}>
                {subscription.endDate 
                  ? new Date(subscription.endDate).toLocaleDateString()
                  : 'N/A'
                }
              </Text>
            </View>
            {subscription.paymentMethod && (
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Payment method:</Text>
                <Text style={styles.billingValue}>{subscription.paymentMethod}</Text>
              </View>
            )}
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Auto-renewal:</Text>
              <Text style={[
                styles.billingValue,
                { color: subscription.autoRenew ? '#10B981' : '#EF4444' }
              ]}>
                {subscription.autoRenew ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderUsageStats = () => {
    if (!usageStats || !subscription) return null;

    return (
      <Animated.View entering={FadeInDown.delay(600)} style={styles.usageCard}>
        <Text style={styles.usageTitle}>Usage Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{usageStats.lessonsToday}</Text>
            <Text style={styles.statLabel}>Lessons Today</Text>
            {subscription.tier === 'free' && (
              <Text style={styles.statLimit}>Limit: 3/day</Text>
            )}
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{usageStats.lessonsThisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{usageStats.certificatesEarned}</Text>
            <Text style={styles.statLabel}>Certificates</Text>
          </View>
          
          {subscription.tier === 'pro' && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {usageStats.mentorCallsUsed}/{usageStats.mentorCallsAvailable || 4}
              </Text>
              <Text style={styles.statLabel}>Mentor Calls</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderManagementOptions = () => {
    if (!subscription) return null;

    return (
      <Animated.View entering={FadeInUp.delay(800)} style={styles.managementSection}>
        <Text style={styles.managementTitle}>Manage Subscription</Text>
        
        {subscription.tier !== 'free' && (
          <>
            <TouchableOpacity style={styles.managementOption} onPress={handleUpdatePayment}>
              <CreditCard color="#667eea" size={20} />
              <Text style={styles.managementOptionText}>Update Payment Method</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.managementOption}>
              <Calendar color="#667eea" size={20} />
              <Text style={styles.managementOptionText}>Change Billing Cycle</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.managementOption}>
              <Settings color="#667eea" size={20} />
              <Text style={styles.managementOptionText}>Subscription Preferences</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.managementOption}
          onPress={() => router.push('/(tabs)/subscription')}
        >
          <Star color="#667eea" size={20} />
          <Text style={styles.managementOptionText}>
            {subscription.tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </Text>
        </TouchableOpacity>

        {subscription.tier !== 'free' && subscription.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.managementOption, styles.dangerOption]}
            onPress={handleCancelSubscription}
          >
            <AlertCircle color="#EF4444" size={20} />
            <Text style={[styles.managementOptionText, styles.dangerText]}>
              Cancel Subscription
            </Text>
          </TouchableOpacity>
        )}
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Subscription</Text>
            <View style={styles.placeholder} />
          </Animated.View>

          <View style={styles.content}>
            {renderSubscriptionInfo()}
            {renderUsageStats()}
            {renderManagementOptions()}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tierName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  period: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  billingInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  billingValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  usageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  usageTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  statLimit: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginTop: 2,
  },
  managementSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  managementTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  managementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  managementOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginLeft: 12,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#EF4444',
  },
});