import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Code, FileSpreadsheet, Megaphone, Brain, Clock, Star, Coins, Play, Lock } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getTrackLessons } from '@/data/lessons';
import { getUserSubscription, incrementLessonCount, canAccessFeature } from '@/utils/subscriptionManager';
import { UserSubscription } from '@/types/subscription';
import UpgradePrompt from '@/components/UpgradePrompt';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  skillCoins: number;
  lessonsCompleted: number;
  learningStreak: number;
}

interface SkillTrack {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  reward: number;
  lessons: any[];
  premium?: boolean;
  icon?: any;
  color?: string;
}

const defaultSkillTracks = [
  {
    id: 'python-programming',
    title: 'Python Programming',
    icon: Code,
    difficulty: 'Beginner' as const,
    duration: '4 weeks',
    reward: 50,
    color: '#3B82F6',
    lessons: 3,
    description: 'Learn Python from basics to advanced concepts',
    premium: false,
  },
  {
    id: 'excel-mastery',
    title: 'Excel Mastery',
    icon: FileSpreadsheet,
    difficulty: 'Intermediate' as const,
    duration: '3 weeks',
    reward: 35,
    color: '#10B981',
    lessons: 3,
    description: 'Master Excel formulas, pivot tables, and automation',
    premium: false,
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    icon: Megaphone,
    difficulty: 'Beginner' as const,
    duration: '5 weeks',
    reward: 40,
    color: '#F59E0B',
    lessons: 3,
    description: 'Learn SEO, social media, and content marketing',
    premium: true,
  },
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    icon: Brain,
    difficulty: 'Advanced' as const,
    duration: '6 weeks',
    reward: 75,
    color: '#8B5CF6',
    lessons: 3,
    description: 'Understanding machine learning and AI concepts',
    premium: true,
  },
];

export default function LearnScreen() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    skillCoins: 0,
    lessonsCompleted: 0,
    learningStreak: 0,
  });
  const [skillTracks, setSkillTracks] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [upgradeDescription, setUpgradeDescription] = useState('');
  const [upgradeTier, setUpgradeTier] = useState<'premium' | 'pro'>('premium');

  useEffect(() => {
    loadUserData();
    loadSubscription();
    loadSkillTracks();
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

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const loadSkillTracks = async () => {
    try {
      // Load custom skill tracks from AsyncStorage
      const customTracksData = await AsyncStorage.getItem('skillTracks');
      const customTracks = customTracksData ? JSON.parse(customTracksData) : [];
      
      console.log('Loaded custom tracks:', customTracks.length);
      
      // Convert custom tracks to the expected format
      const formattedCustomTracks = customTracks.map((track: SkillTrack) => ({
        id: track.id,
        title: track.title,
        icon: Code, // Default icon for custom tracks
        difficulty: track.difficulty,
        duration: `${track.duration} weeks`,
        reward: track.reward,
        color: getColorForTrack(track.title),
        lessons: track.lessons?.length || 0,
        description: track.description,
        premium: false, // Custom tracks are free by default
        isCustom: true,
      }));

      // Combine default tracks with custom tracks
      const allTracks = [...defaultSkillTracks, ...formattedCustomTracks];
      setSkillTracks(allTracks);
      
      console.log('Total tracks loaded:', allTracks.length);
    } catch (error) {
      console.error('Error loading skill tracks:', error);
      // Fallback to default tracks
      setSkillTracks(defaultSkillTracks);
    }
  };

  const getColorForTrack = (title: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleTrackPress = async (track: any) => {
    // Check if track requires premium
    if (track.premium && subscription?.tier === 'free') {
      setUpgradeFeature(`${track.title} Course`);
      setUpgradeDescription(`Access advanced courses like ${track.title} with unlimited lessons and premium features.`);
      setUpgradeTier('premium');
      setShowUpgradePrompt(true);
      return;
    }

    // For custom tracks, show alert that lessons need to be created
    if (track.isCustom && (!track.lessons || track.lessons === 0)) {
      Alert.alert(
        'Track Created!',
        `"${track.title}" has been created successfully. Lessons and content will be available soon.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const lessons = getTrackLessons(track.id);
    if (lessons.length > 0) {
      // Navigate to first lesson of the track
      router.push(`/lesson/${lessons[0].id}`);
    } else {
      Alert.alert(
        'Coming Soon',
        `Lessons for "${track.title}" are being prepared and will be available soon.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleLessonPress = async (lessonId: string, track: any) => {
    // Check if track requires premium
    if (track.premium && subscription?.tier === 'free') {
      setUpgradeFeature(`${track.title} Lessons`);
      setUpgradeDescription(`Unlock premium courses and get unlimited access to all lessons.`);
      setUpgradeTier('premium');
      setShowUpgradePrompt(true);
      return;
    }

    // Check daily lesson limit for free users
    if (subscription?.tier === 'free') {
      const canTakeLesson = await incrementLessonCount();
      if (!canTakeLesson) {
        setUpgradeFeature('Unlimited Lessons');
        setUpgradeDescription('You\'ve reached your daily limit of 3 lessons. Upgrade to Premium for unlimited access.');
        setUpgradeTier('premium');
        setShowUpgradePrompt(true);
        return;
      }
    }

    router.push(`/lesson/${lessonId}`);
  };

  const handleUpgrade = () => {
    setShowUpgradePrompt(false);
    router.push('/(tabs)/subscription');
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
            <Text style={styles.greeting}>Hello, {userData.name || 'Learner'}!</Text>
            <Text style={styles.tagline}>Ready to earn some SkillCoins?</Text>
            
            {/* Subscription Status */}
            {subscription && (
              <View style={styles.subscriptionBanner}>
                <Text style={styles.subscriptionText}>
                  {subscription.tier === 'free' 
                    ? '🎯 Upgrade to Premium for unlimited learning!'
                    : `✨ ${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Member`
                  }
                </Text>
                {subscription.tier === 'free' && (
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={() => router.push('/(tabs)/subscription')}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Coins color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>{userData.skillCoins}</Text>
              <Text style={styles.statLabel}>SkillCoins</Text>
            </View>
            <View style={styles.statCard}>
              <Star color="#667eea" size={24} />
              <Text style={styles.statNumber}>{userData.lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statCard}>
              <Clock color="#10B981" size={24} />
              <Text style={styles.statNumber}>{userData.learningStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </Animated.View>

          {/* Skill Tracks */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.tracksSection}>
            <View style={styles.tracksSectionHeader}>
              <Text style={styles.sectionTitle}>Skill Tracks</Text>
              <Text style={styles.tracksCount}>
                {skillTracks.length} track{skillTracks.length !== 1 ? 's' : ''} available
              </Text>
            </View>
            {skillTracks.map((track, index) => {
              const trackLessons = getTrackLessons(track.id);
              const isLocked = track.premium && subscription?.tier === 'free';
              
              return (
                <Animated.View
                  key={track.id}
                  entering={FadeInRight.delay(800 + index * 100)}
                >
                  <TouchableOpacity 
                    style={[styles.trackCard, isLocked && styles.lockedTrackCard]}
                    onPress={() => handleTrackPress(track)}
                  >
                    {isLocked && (
                      <View style={styles.lockOverlay}>
                        <Lock color="white" size={24} />
                        <Text style={styles.lockText}>Premium</Text>
                      </View>
                    )}

                    {track.isCustom && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom</Text>
                      </View>
                    )}
                    
                    <View style={styles.trackHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: track.color }]}>
                        <track.icon color="white" size={24} />
                      </View>
                      <View style={styles.trackInfo}>
                        <Text style={styles.trackTitle}>{track.title}</Text>
                        <Text style={styles.trackDescription}>{track.description}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.trackMeta}>
                      <View style={styles.metaItem}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(track.difficulty) }]}>
                          <Text style={styles.difficultyText}>{track.difficulty}</Text>
                        </View>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock color="#6B7280" size={16} />
                        <Text style={styles.metaText}>{track.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Coins color="#F59E0B" size={16} />
                        <Text style={styles.rewardText}>{track.reward} coins</Text>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '0%', backgroundColor: track.color }]} />
                      </View>
                      <Text style={styles.progressText}>
                        0/{track.isCustom ? track.lessons : trackLessons.length} lessons
                      </Text>
                    </View>

                    {/* Lessons List for default tracks */}
                    {!track.isCustom && trackLessons.length > 0 && !isLocked && (
                      <View style={styles.lessonsContainer}>
                        <Text style={styles.lessonsTitle}>Lessons:</Text>
                        {trackLessons.map((lesson, lessonIndex) => (
                          <TouchableOpacity
                            key={lesson.id}
                            style={styles.lessonItem}
                            onPress={() => handleLessonPress(lesson.id, track)}
                          >
                            <View style={styles.lessonInfo}>
                              <Text style={styles.lessonTitle}>{lesson.title}</Text>
                              <View style={styles.lessonMeta}>
                                <Clock color="#6B7280" size={14} />
                                <Text style={styles.lessonDuration}>{lesson.duration} min</Text>
                                <Coins color="#F59E0B" size={14} />
                                <Text style={styles.lessonReward}>{lesson.reward} coins</Text>
                              </View>
                            </View>
                            <View style={styles.playButton}>
                              <Play color={track.color} size={16} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Custom track status */}
                    {track.isCustom && (
                      <View style={styles.customTrackStatus}>
                        <Text style={styles.customTrackStatusText}>
                          ✨ Custom track created! Lessons will be available soon.
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Upgrade Prompt Modal */}
        <UpgradePrompt
          visible={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={handleUpgrade}
          feature={upgradeFeature}
          description={upgradeDescription}
          tier={upgradeTier}
        />
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
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.8,
    marginBottom: 16,
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
  },
  subscriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  tracksSection: {
    paddingHorizontal: 24,
  },
  tracksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  tracksCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  trackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  lockedTrackCard: {
    opacity: 0.7,
  },
  lockOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  lockText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 4,
  },
  customBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  customBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  trackHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  rewardText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  lessonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  lessonsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 12,
  },
  lessonReward: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTrackStatus: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  customTrackStatusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
    textAlign: 'center',
  },
});