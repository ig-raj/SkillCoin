import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Coins, ShoppingBag, Trophy, Star, Zap } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  name: string;
  skillCoins: number;
  lessonsCompleted: number;
  learningStreak: number;
}

const rewards = [
  {
    id: 1,
    title: '10% Course Discount',
    description: 'Get 10% off any premium course',
    cost: 50,
    type: 'discount',
    icon: ShoppingBag,
    color: '#10B981',
  },
  {
    id: 2,
    title: 'Premium Badge',
    description: 'Show off your dedication with a premium badge',
    cost: 100,
    type: 'badge',
    icon: Trophy,
    color: '#F59E0B',
  },
  {
    id: 3,
    title: 'Priority Support',
    description: 'Get priority access to mentors and support',
    cost: 150,
    type: 'support',
    icon: Star,
    color: '#8B5CF6',
  },
  {
    id: 4,
    title: 'Bonus Lessons',
    description: 'Unlock 5 bonus advanced lessons',
    cost: 200,
    type: 'content',
    icon: Zap,
    color: '#EF4444',
  },
];

const dailyRewards = [
  { day: 1, reward: 5, claimed: true },
  { day: 2, reward: 10, claimed: true },
  { day: 3, reward: 15, claimed: false },
  { day: 4, reward: 20, claimed: false },
  { day: 5, reward: 25, claimed: false },
  { day: 6, reward: 30, claimed: false },
  { day: 7, reward: 50, claimed: false },
];

export default function RewardsScreen() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    skillCoins: 0,
    lessonsCompleted: 0,
    learningStreak: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePurchaseReward = async (reward: typeof rewards[0]) => {
    if (userData.skillCoins < reward.cost) {
      Alert.alert('Insufficient Coins', `You need ${reward.cost - userData.skillCoins} more SkillCoins to purchase this reward.`);
      return;
    }

    Alert.alert(
      'Purchase Reward',
      `Are you sure you want to purchase "${reward.title}" for ${reward.cost} SkillCoins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            const updatedData = {
              ...userData,
              skillCoins: userData.skillCoins - reward.cost,
            };
            await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
            setUserData(updatedData);
            Alert.alert('Success!', `You've successfully purchased "${reward.title}"!`);
          },
        },
      ]
    );
  };

  const claimDailyReward = async (reward: number) => {
    const updatedData = {
      ...userData,
      skillCoins: userData.skillCoins + reward,
    };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
    setUserData(updatedData);
    Alert.alert('Reward Claimed!', `You earned ${reward} SkillCoins!`);
  };

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
            <Text style={styles.title}>Rewards</Text>
            <View style={styles.coinBalance}>
              <Coins color="#F59E0B" size={24} />
              <Text style={styles.balanceText}>{userData.skillCoins} SkillCoins</Text>
            </View>
          </Animated.View>

          {/* Daily Rewards */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Rewards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dailyContainer}>
              {dailyRewards.map((daily, index) => (
                <Animated.View
                  key={daily.day}
                  entering={FadeInRight.delay(600 + index * 100)}
                >
                  <TouchableOpacity
                    style={[
                      styles.dailyCard,
                      daily.claimed && styles.dailyCardClaimed,
                      userData.learningStreak >= daily.day && !daily.claimed && styles.dailyCardAvailable
                    ]}
                    onPress={() => {
                      if (userData.learningStreak >= daily.day && !daily.claimed) {
                        claimDailyReward(daily.reward);
                      }
                    }}
                    disabled={daily.claimed || userData.learningStreak < daily.day}
                  >
                    <Text style={styles.dailyDay}>Day {daily.day}</Text>
                    <Gift 
                      color={daily.claimed ? '#10B981' : userData.learningStreak >= daily.day ? '#F59E0B' : '#9CA3AF'} 
                      size={32} 
                    />
                    <Text style={styles.dailyReward}>{daily.reward} coins</Text>
                    {daily.claimed && <Text style={styles.claimedText}>Claimed</Text>}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Marketplace */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.section}>
            <Text style={styles.sectionTitle}>Marketplace</Text>
            {rewards.map((reward, index) => (
              <Animated.View
                key={reward.id}
                entering={FadeInDown.delay(1000 + index * 100)}
              >
                <TouchableOpacity
                  style={styles.rewardCard}
                  onPress={() => handlePurchaseReward(reward)}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: reward.color }]}>
                    <reward.icon color="white" size={24} />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                    <View style={styles.rewardCost}>
                      <Coins color="#F59E0B" size={16} />
                      <Text style={styles.costText}>{reward.cost} SkillCoins</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.purchaseButton,
                    userData.skillCoins < reward.cost && styles.purchaseButtonDisabled
                  ]}>
                    <Text style={[
                      styles.purchaseButtonText,
                      userData.skillCoins < reward.cost && styles.purchaseButtonTextDisabled
                    ]}>
                      {userData.skillCoins >= reward.cost ? 'Purchase' : 'Locked'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Earning Tips */}
          <Animated.View entering={FadeInDown.delay(1400)} style={styles.section}>
            <Text style={styles.sectionTitle}>How to Earn More</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tip}>
                <Text style={styles.tipIcon}>📚</Text>
                <Text style={styles.tipText}>Complete lessons daily to maintain your streak</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipIcon}>🎯</Text>
                <Text style={styles.tipText}>Finish entire skill tracks for bonus rewards</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipIcon}>⚡</Text>
                <Text style={styles.tipText}>Perfect scores earn extra SkillCoins</Text>
              </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  balanceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 20,
  },
  dailyContainer: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dailyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dailyCardClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  dailyCardAvailable: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dailyDay: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  dailyReward: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 8,
  },
  claimedText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginTop: 4,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  rewardCost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  purchaseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  purchaseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  purchaseButtonTextDisabled: {
    color: '#9CA3AF',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 20,
  },
});