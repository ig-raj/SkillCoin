import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit, Check, X, Crown, BookOpen, CreditCard as Edit3 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminPermissions } from '@/types/auth';

interface UserData {
  name: string;
  email: string;
  skillCoins: number;
  lessonsCompleted: number;
  learningStreak: number;
  joinedDate: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const permissions = getAdminPermissions(user);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    skillCoins: 0,
    lessonsCompleted: 0,
    learningStreak: 0,
    joinedDate: new Date().toISOString(),
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        setEditName(parsedData.name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      const updatedData = { ...userData, name: editName.trim() };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      setIsEditing(false);
      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const getJoinedDate = () => {
    const date = new Date(userData.joinedDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLevelInfo = () => {
    const lessons = userData.lessonsCompleted;
    if (lessons < 10) return { level: 1, title: 'Beginner', next: 10 };
    if (lessons < 25) return { level: 2, title: 'Student', next: 25 };
    if (lessons < 50) return { level: 3, title: 'Learner', next: 50 };
    if (lessons < 100) return { level: 4, title: 'Scholar', next: 100 };
    return { level: 5, title: 'Expert', next: null };
  };

  const level = getLevelInfo();

  const settingsOptions = [
    { id: 1, title: 'Notifications', icon: Bell, description: 'Manage your notifications' },
    { id: 2, title: 'Privacy & Security', icon: Shield, description: 'Privacy settings and security' },
    { id: 3, title: 'Help & Support', icon: HelpCircle, description: 'Get help and contact support' },
    { id: 4, title: 'App Settings', icon: Settings, description: 'General app preferences' },
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
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            {user?.role === 'admin' && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/admin/dashboard')}
              >
                <Crown color="#F59E0B" size={20} />
                <Text style={styles.adminButtonText}>Admin</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={user?.role === 'admin' ? ['#F59E0B', '#EF4444'] : ['#F59E0B', '#EF4444']}
                style={styles.avatar}
              >
                <User color="white" size={32} />
                {user?.role === 'admin' && (
                  <View style={styles.adminBadge}>
                    <Crown color="#F59E0B" size={12} />
                  </View>
                )}
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter your name"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={handleSaveName} style={styles.editButton}>
                      <Check color="#10B981" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editButton}>
                      <X color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{user?.name || userData.name}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Edit color="#667eea" size={20} />
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.role === 'admin' && (
                <View style={styles.roleContainer}>
                  <Crown color="#F59E0B" size={16} />
                  <Text style={styles.roleText}>Administrator</Text>
                </View>
              )}
              <Text style={styles.joinDate}>Joined {getJoinedDate()}</Text>

              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {level.level} - {level.title}</Text>
                {level.next ? (
                  <Text style={styles.nextLevel}>
                    {level.next - userData.lessonsCompleted} lessons to Level {level.level + 1}
                  </Text>
                ) : null}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)} style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.skillCoins}</Text>
              <Text style={styles.statLabel}>SkillCoins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.learningStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </Animated.View>

          {/* Admin Quick Actions */}
          {user?.role === 'admin' && (
            <Animated.View entering={FadeInUp.delay(700)} style={styles.adminSection}>
              <Text style={styles.sectionTitle}>Admin Actions</Text>
              <TouchableOpacity 
                style={styles.adminActionItem}
                onPress={() => router.push('/admin/create-skill-track')}
              >
                <View style={styles.adminActionIcon}>
                  <BookOpen color="#667eea" size={20} />
                </View>
                <Text style={styles.adminActionText}>Create Skill Track</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adminActionItem}
                onPress={() => router.push('/admin/manage-skill-tracks')}
              >
                <View style={styles.adminActionIcon}>
                  <Edit3 color="#667eea" size={20} />
                </View>
                <Text style={styles.adminActionText}>Manage Skill Tracks</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.adminActionItem}
                onPress={() => router.push('/admin/create-job-post')}
              >
                <View style={styles.adminActionIcon}>
                  <Settings color="#667eea" size={20} />
                </View>
                <Text style={styles.adminActionText}>Create Job Post</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {settingsOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(1000 + index * 100)}
              >
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <option.icon color="#667eea" size={24} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{option.title}</Text>
                    <Text style={styles.settingDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(1200)} style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut color="#EF4444" size={24} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adminButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginRight: 12,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingVertical: 8,
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginBottom: 4,
  },
  nextLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
  },
  adminSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  adminActionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  adminActionIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  settingItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  settingIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 12,
  },
});