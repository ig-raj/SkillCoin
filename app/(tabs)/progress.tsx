import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, Target, Award, Clock, Coins } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  skillCoins: number;
  lessonsCompleted: number;
  learningStreak: number;
  joinedDate: string;
}

export default function ProgressScreen() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    skillCoins: 0,
    lessonsCompleted: 0,
    learningStreak: 0,
    joinedDate: new Date().toISOString(),
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

  const getDaysLearning = () => {
    const joinDate = new Date(userData.joinedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const weeklyProgress = [
    { day: 'Mon', lessons: 2, coins: 20 },
    { day: 'Tue', lessons: 3, coins: 30 },
    { day: 'Wed', lessons: 1, coins: 10 },
    { day: 'Thu', lessons: 4, coins: 40 },
    { day: 'Fri', lessons: 2, coins: 20 },
    { day: 'Sat', lessons: 0, coins: 0 },
    { day: 'Sun', lessons: 1, coins: 10 },
  ];

  const achievements = [
    { id: 1, title: 'First Lesson', description: 'Complete your first lesson', earned: true, icon: '🎯' },
    { id: 2, title: 'Week Warrior', description: 'Learn for 7 consecutive days', earned: false, icon: '🔥' },
    { id: 3, title: 'Coin Collector', description: 'Earn 100 SkillCoins', earned: false, icon: '💰' },
    { id: 4, title: 'Speed Learner', description: 'Complete 10 lessons in one day', earned: false, icon: '⚡' },
  ];

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
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Keep up the great work!</Text>
          </Animated.View>

          {/* Overview Cards */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.overviewContainer}>
            <View style={styles.overviewCard}>
              <TrendingUp color="#667eea" size={32} />
              <Text style={styles.overviewNumber}>{userData.lessonsCompleted}</Text>
              <Text style={styles.overviewLabel}>Total Lessons</Text>
            </View>
            <View style={styles.overviewCard}>
              <Calendar color="#10B981" size={32} />
              <Text style={styles.overviewNumber}>{getDaysLearning()}</Text>
              <Text style={styles.overviewLabel}>Days Learning</Text>
            </View>
          </Animated.View>

          {/* Weekly Progress */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weeklyContainer}>
              {weeklyProgress.map((day, index) => (
                <View key={day.day} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          height: `${Math.min((day.lessons / 4) * 100, 100)}%`,
                          backgroundColor: day.lessons > 0 ? '#667eea' : '#E5E7EB'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.dayLessons}>{day.lessons}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Coins color="#F59E0B" size={24} />
                <Text style={styles.statTitle}>SkillCoins</Text>
              </View>
              <Text style={styles.statValue}>{userData.skillCoins}</Text>
              <Text style={styles.statChange}>+15 this week</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Target color="#EF4444" size={24} />
                <Text style={styles.statTitle}>Streak</Text>
              </View>
              <Text style={styles.statValue}>{userData.learningStreak}</Text>
              <Text style={styles.statChange}>days in a row</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Clock color="#8B5CF6" size={24} />
                <Text style={styles.statTitle}>Avg Time</Text>
              </View>
              <Text style={styles.statValue}>25m</Text>
              <Text style={styles.statChange}>per lesson</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Award color="#10B981" size={24} />
                <Text style={styles.statTitle}>Rank</Text>
              </View>
              <Text style={styles.statValue}>Beginner</Text>
              <Text style={styles.statChange}>Level 1</Text>
            </View>
          </Animated.View>

          {/* Achievements */}
          <Animated.View entering={FadeInUp.delay(1000)} style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInDown.delay(1200 + index * 100)}
                style={[styles.achievementCard, { opacity: achievement.earned ? 1 : 0.6 }]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Award color="white" size={16} />
                  </View>
                )}
              </Animated.View>
            ))}
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.8,
  },
  overviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 12,
  },
  overviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
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
  weeklyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dayCard: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    width: 20,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    borderRadius: 10,
  },
  dayLessons: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  earnedBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});