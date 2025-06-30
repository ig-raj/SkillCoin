import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, BookOpen, Briefcase, Users, ChartBar as BarChart3, Settings, Crown, CreditCard as Edit3 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminPermissions } from '@/types/auth';
import AuthGuard from '@/components/AuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard() {
  const { user } = useAuth();
  const permissions = getAdminPermissions(user);
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalSkillTracks: 4,
    totalJobPosts: 12,
    activeApplications: 34,
    customSkillTracks: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load custom skill tracks count
      const tracksData = await AsyncStorage.getItem('skillTracks');
      const customTracks = tracksData ? JSON.parse(tracksData) : [];
      
      setStats(prev => ({
        ...prev,
        customSkillTracks: customTracks.length,
        totalSkillTracks: 4 + customTracks.length, // 4 default + custom
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateJobPost = () => {
    console.log('🚀 Create Job Post button pressed!');
    console.log('User permissions:', permissions);
    console.log('Can create job posts:', permissions.canCreateJobPosts);
    
    if (!permissions.canCreateJobPosts) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to create job posts.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      console.log('Navigating to create job post...');
      router.push('/admin/create-job-post');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to job post creation');
    }
  };

  const handleCreateSkillTrack = () => {
    console.log('📚 Create Skill Track button pressed!');
    
    if (!permissions.canCreateSkillTracks) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to create skill tracks.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      router.push('/admin/create-skill-track');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to skill track creation');
    }
  };

  const handleManageSkillTracks = () => {
    console.log('✏️ Manage Skill Tracks button pressed!');
    
    if (!permissions.canCreateSkillTracks) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to manage skill tracks.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      router.push('/admin/manage-skill-tracks');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to skill track management');
    }
  };

  const adminActions = [
    {
      id: 'create-skill-track',
      title: 'Create Skill Track',
      description: 'Add new learning courses and lessons',
      icon: BookOpen,
      color: '#10B981',
      enabled: permissions.canCreateSkillTracks,
      onPress: handleCreateSkillTrack,
    },
    {
      id: 'manage-skill-tracks',
      title: 'Manage Skill Tracks',
      description: 'Edit and delete existing skill tracks',
      icon: Edit3,
      color: '#667eea',
      enabled: permissions.canCreateSkillTracks,
      onPress: handleManageSkillTracks,
    },
    {
      id: 'create-job-post',
      title: 'Create Job Post',
      description: 'Add new job opportunities',
      icon: Briefcase,
      color: '#3B82F6',
      enabled: permissions.canCreateJobPosts,
      onPress: handleCreateJobPost,
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      color: '#8B5CF6',
      enabled: permissions.canManageUsers,
      onPress: () => {
        console.log('👥 Manage Users button pressed!');
        router.push('/admin/manage-users');
      },
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View platform analytics and insights',
      icon: BarChart3,
      color: '#F59E0B',
      enabled: permissions.canViewAnalytics,
      onPress: () => {
        console.log('📊 Analytics button pressed!');
        router.push('/admin/analytics');
      },
    },
  ];

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="white" size={24} />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <View style={styles.titleContainer}>
          <Crown color="#F59E0B" size={24} />
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>
        <Text style={styles.subtitle}>Welcome back, {user?.name}</Text>
      </View>
    </Animated.View>
  );

  const renderStats = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Users color="#10B981" size={24} />
        <Text style={styles.statNumber}>{stats.totalUsers}</Text>
        <Text style={styles.statLabel}>Total Users</Text>
      </View>
      <View style={styles.statCard}>
        <BookOpen color="#3B82F6" size={24} />
        <Text style={styles.statNumber}>{stats.totalSkillTracks}</Text>
        <Text style={styles.statLabel}>Skill Tracks</Text>
        {stats.customSkillTracks > 0 && (
          <Text style={styles.statSubLabel}>
            {stats.customSkillTracks} custom
          </Text>
        )}
      </View>
      <View style={styles.statCard}>
        <Briefcase color="#8B5CF6" size={24} />
        <Text style={styles.statNumber}>{stats.totalJobPosts}</Text>
        <Text style={styles.statLabel}>Job Posts</Text>
      </View>
      <View style={styles.statCard}>
        <BarChart3 color="#F59E0B" size={24} />
        <Text style={styles.statNumber}>{stats.activeApplications}</Text>
        <Text style={styles.statLabel}>Applications</Text>
      </View>
    </Animated.View>
  );

  const renderActions = () => (
    <Animated.View entering={FadeInUp.delay(600)} style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Admin Actions</Text>
      {adminActions.map((action, index) => (
        <Animated.View
          key={action.id}
          entering={FadeInDown.delay(800 + index * 100)}
        >
          <TouchableOpacity
            style={[
              styles.actionCard,
              !action.enabled && styles.actionCardDisabled,
            ]}
            onPress={() => {
              console.log(`🎯 Action pressed: ${action.title}`);
              console.log('Action enabled:', action.enabled);
              
              if (action.enabled && action.onPress) {
                action.onPress();
              } else if (!action.enabled) {
                Alert.alert('Access Denied', 'You do not have permission to perform this action.');
              } else {
                console.warn('No onPress handler for action:', action.title);
                Alert.alert('Coming Soon', `${action.title} functionality will be available soon.`);
              }
            }}
            activeOpacity={action.enabled ? 0.7 : 1}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.enabled ? action.color : '#9CA3AF' }]}>
              <action.icon color="white" size={24} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[
                styles.actionTitle,
                !action.enabled && styles.actionTitleDisabled,
              ]}>
                {action.title}
              </Text>
              <Text style={[
                styles.actionDescription,
                !action.enabled && styles.actionDescriptionDisabled,
              ]}>
                {action.description}
              </Text>
              {!action.enabled && (
                <Text style={styles.permissionText}>
                  Requires admin permissions
                </Text>
              )}
            </View>
            <View style={styles.actionArrow}>
              <Plus color={action.enabled ? action.color : '#9CA3AF'} size={20} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View entering={FadeInUp.delay(1000)} style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleCreateSkillTrack}
          activeOpacity={0.7}
        >
          <Plus color="#6B7280" size={20} />
          <Text style={styles.quickActionText}>New Track</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleManageSkillTracks}
          activeOpacity={0.7}
        >
          <Edit3 color="#6B7280" size={20} />
          <Text style={styles.quickActionText}>Edit Tracks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleCreateJobPost}
          activeOpacity={0.7}
        >
          <Briefcase color="#6B7280" size={20} />
          <Text style={styles.quickActionText}>New Job</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => {
            console.log('📊 Reports quick action pressed');
            Alert.alert('Coming Soon', 'Reports functionality will be available soon.');
          }}
          activeOpacity={0.7}
        >
          <BarChart3 color="#6B7280" size={20} />
          <Text style={styles.quickActionText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <AuthGuard requireAdmin>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderHeader()}
            {renderStats()}
            {renderActions()}
            {renderQuickActions()}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AuthGuard>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
  statSubLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionTitleDisabled: {
    color: '#9CA3AF',
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionDescriptionDisabled: {
    color: '#9CA3AF',
  },
  permissionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginTop: 4,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});