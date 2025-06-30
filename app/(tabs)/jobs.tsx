import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Briefcase, TrendingUp, Users, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Job, JobFilters as JobFiltersType, SuccessStory } from '@/types/jobs';
import { mockJobs, successStories, calculateSkillMatch } from '@/data/jobs';
import { filterJobs, getUserSkills, hasAppliedToJob } from '@/utils/jobsManager';
import { getUserSubscription, canAccessFeature } from '@/utils/subscriptionManager';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import UpgradePrompt from '@/components/UpgradePrompt';

interface UserData {
  name: string;
  skillCoins: number;
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData>({ name: '', skillCoins: 0 });
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    loadUserData();
    loadUserSkills();
    loadAppliedJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [jobs, searchQuery, filters]);

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

  const loadUserSkills = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        const skills = await getUserSkills(user.name || 'user');
        setUserSkills(skills);
      }
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        const applied = new Set<string>();
        
        for (const job of mockJobs) {
          const hasApplied = await hasAppliedToJob(job.id, user.name || 'user');
          if (hasApplied) {
            applied.add(job.id);
          }
        }
        
        setAppliedJobs(applied);
      }
    } catch (error) {
      console.error('Error loading applied jobs:', error);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = filterJobs(jobs, filters);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort by skill match score
    filtered.sort((a, b) => {
      const scoreA = calculateSkillMatch(a, userSkills);
      const scoreB = calculateSkillMatch(b, userSkills);
      return scoreB - scoreA;
    });
    
    setFilteredJobs(filtered);
  };

  const handleJobPress = async (job: Job) => {
    // Check if user has access to job board
    const subscription = await getUserSubscription();
    if (subscription.tier === 'free') {
      setShowUpgradePrompt(true);
      return;
    }
    
    router.push(`/job/${job.id}`);
  };

  const handleApplyFilters = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const renderStats = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Briefcase color="#667eea" size={24} />
        <Text style={styles.statNumber}>{filteredJobs.length}</Text>
        <Text style={styles.statLabel}>Open Positions</Text>
      </View>
      <View style={styles.statCard}>
        <TrendingUp color="#10B981" size={24} />
        <Text style={styles.statNumber}>{userSkills.length}</Text>
        <Text style={styles.statLabel}>Your Skills</Text>
      </View>
      <View style={styles.statCard}>
        <Users color="#F59E0B" size={24} />
        <Text style={styles.statNumber}>{appliedJobs.size}</Text>
        <Text style={styles.statLabel}>Applications</Text>
      </View>
    </Animated.View>
  );

  const renderSuccessStories = () => (
    <Animated.View entering={FadeInUp.delay(600)} style={styles.successSection}>
      <Text style={styles.sectionTitle}>Success Stories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
        {successStories.map((story, index) => (
          <Animated.View
            key={story.id}
            entering={FadeInDown.delay(800 + index * 100)}
            style={styles.storyCard}
          >
            <View style={styles.storyHeader}>
              <View style={styles.storyAvatar}>
                <Text style={styles.storyAvatarText}>{story.userName.charAt(0)}</Text>
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyName}>{story.userName}</Text>
                <Text style={styles.storyJob}>{story.jobTitle} at {story.company}</Text>
              </View>
            </View>
            <Text style={styles.storyText}>{story.story}</Text>
            <View style={styles.storyStats}>
              <View style={styles.storyStat}>
                <Text style={styles.storyStatNumber}>{story.timeToHire}d</Text>
                <Text style={styles.storyStatLabel}>to hire</Text>
              </View>
              <View style={styles.storyStat}>
                <Text style={styles.storyStatNumber}>+{story.salaryIncrease}%</Text>
                <Text style={styles.storyStatLabel}>salary</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={styles.title}>Job Opportunities</Text>
          <Text style={styles.subtitle}>Find your next career opportunity</Text>
          
          <View style={styles.coinsContainer}>
            <Star color="#F59E0B" size={20} />
            <Text style={styles.coinsText}>{userData.skillCoins} SkillCoins</Text>
          </View>
        </Animated.View>

        {/* Search and Filter */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Filter color={getActiveFiltersCount() > 0 ? 'white' : '#667eea'} size={20} />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          {renderStats()}

          {/* Success Stories */}
          {renderSuccessStories()}

          {/* Job Listings */}
          <View style={styles.jobsSection}>
            <Animated.View entering={FadeInDown.delay(800)} style={styles.jobsHeader}>
              <Text style={styles.sectionTitle}>
                {filteredJobs.length} Jobs Found
              </Text>
              <Text style={styles.jobsSubtitle}>
                Sorted by skill match
              </Text>
            </Animated.View>

            {filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                skillMatchScore={calculateSkillMatch(job, userSkills)}
                onPress={() => handleJobPress(job)}
                index={index}
                hasApplied={appliedJobs.has(job.id)}
              />
            ))}

            {filteredJobs.length === 0 && (
              <Animated.View entering={FadeInUp} style={styles.emptyState}>
                <Briefcase color="#9CA3AF" size={64} />
                <Text style={styles.emptyTitle}>No jobs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Job Filters Modal */}
        <JobFilters
          visible={showFilters}
          filters={filters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
        />

        {/* Upgrade Prompt */}
        <UpgradePrompt
          visible={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            setShowUpgradePrompt(false);
            router.push('/(tabs)/subscription');
          }}
          feature="Job Board Access"
          description="Unlock exclusive job opportunities and apply directly through SkillCoin."
          tier="premium"
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
    marginBottom: 16,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  coinsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
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
  successSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  storiesContainer: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  storyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storyAvatarText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  storyInfo: {
    flex: 1,
  },
  storyName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  storyJob: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  storyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  storyStat: {
    alignItems: 'center',
  },
  storyStatNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  storyStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  jobsSection: {
    marginBottom: 24,
  },
  jobsHeader: {
    marginBottom: 16,
  },
  jobsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});