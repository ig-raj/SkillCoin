import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Star, Briefcase, CircleCheck as CheckCircle, Crown, Send, BookOpen } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, InterviewPrep, SkillMatch } from '@/types/jobs';
import { getJobById, calculateSkillMatch, interviewQuestions, companyInfo } from '@/data/jobs';
import { applyToJob, hasAppliedToJob, getUserSkills } from '@/utils/jobsManager';

interface UserData {
  name: string;
  skillCoins: number;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [userData, setUserData] = useState<UserData>({ name: '', skillCoins: 0 });
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobData();
      loadUserData();
    }
  }, [id]);

  const loadJobData = async () => {
    const jobData = getJobById(id);
    if (jobData) {
      setJob(jobData);
      
      // Check if user has applied
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const applied = await hasAppliedToJob(id, user.name || 'user');
        setHasApplied(applied);
      }
    } else {
      Alert.alert('Error', 'Job not found');
      router.back();
    }
  };

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        
        const skills = await getUserSkills(user.name || 'user');
        setUserSkills(skills);
        
        if (job) {
          generateSkillMatches(job, skills);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    if (job && userSkills.length > 0) {
      generateSkillMatches(job, userSkills);
    }
  }, [job, userSkills]);

  const generateSkillMatches = (jobData: Job, skills: string[]) => {
    const matches: SkillMatch[] = [];
    
    // Required skills
    jobData.requiredSkills.forEach(skill => {
      matches.push({
        skill,
        userHasSkill: skills.includes(skill),
        importance: 'required',
      });
    });
    
    // Preferred skills
    jobData.preferredSkills?.forEach(skill => {
      matches.push({
        skill,
        userHasSkill: skills.includes(skill),
        importance: 'preferred',
      });
    });
    
    setSkillMatches(matches);
  };

  const handleApply = async () => {
    if (!job || !userData.name) return;
    
    if (userData.skillCoins < job.applicationCost) {
      Alert.alert(
        'Insufficient SkillCoins',
        `You need ${job.applicationCost - userData.skillCoins} more SkillCoins to apply for this position.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Earn More Coins', onPress: () => router.push('/(tabs)') },
        ]
      );
      return;
    }
    
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    if (!job || !userData.name) return;
    
    setApplying(true);
    try {
      await applyToJob(job.id, userData.name, coverLetter, userSkills);
      setHasApplied(true);
      setShowApplicationModal(false);
      
      // Update user data
      const updatedUserData = {
        ...userData,
        skillCoins: userData.skillCoins - job.applicationCost,
      };
      setUserData(updatedUserData);
      
      Alert.alert(
        'Application Submitted!',
        'Your application has been submitted successfully. The employer will review it and get back to you.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const getSkillMatchScore = () => {
    if (!job) return 0;
    return calculateSkillMatch(job, userSkills);
  };

  const renderJobHeader = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.jobHeader}>
      <View style={styles.jobTitleContainer}>
        <Text style={styles.jobTitle}>{job?.title}</Text>
        <Text style={styles.companyName}>{job?.company}</Text>
        {job?.isPartnership && (
          <View style={styles.partnershipBadge}>
            <Crown color="#F59E0B" size={16} />
            <Text style={styles.partnershipText}>Premium Partner</Text>
          </View>
        )}
      </View>
      
      <View style={styles.skillMatchContainer}>
        <View style={[styles.skillMatchCircle, { borderColor: getSkillMatchScore() >= 70 ? '#10B981' : '#F59E0B' }]}>
          <Text style={[styles.skillMatchText, { color: getSkillMatchScore() >= 70 ? '#10B981' : '#F59E0B' }]}>
            {getSkillMatchScore()}%
          </Text>
        </View>
        <Text style={styles.skillMatchLabel}>Skill Match</Text>
      </View>
    </Animated.View>
  );

  const renderJobDetails = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.detailsCard}>
      <View style={styles.detailRow}>
        <MapPin color="#6B7280" size={20} />
        <Text style={styles.detailText}>{job?.location}</Text>
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText}>{job?.locationType}</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <DollarSign color="#6B7280" size={20} />
        <Text style={styles.detailText}>
          ${job?.salaryMin.toLocaleString()} - ${job?.salaryMax.toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Briefcase color="#6B7280" size={20} />
        <Text style={styles.detailText}>{job?.experienceLevel} level</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Users color="#6B7280" size={20} />
        <Text style={styles.detailText}>{job?.companySize} employees</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Clock color="#6B7280" size={20} />
        <Text style={styles.detailText}>
          Posted {Math.floor((Date.now() - new Date(job?.postedDate || '').getTime()) / (1000 * 60 * 60 * 24))} days ago
        </Text>
      </View>
    </Animated.View>
  );

  const renderSkillsMatch = () => (
    <Animated.View entering={FadeInDown.delay(800)} style={styles.skillsCard}>
      <Text style={styles.cardTitle}>Skills Assessment</Text>
      
      <View style={styles.skillsGrid}>
        {skillMatches.map((match, index) => (
          <View key={index} style={styles.skillItem}>
            <View style={styles.skillInfo}>
              <Text style={[
                styles.skillName,
                match.userHasSkill && styles.skillNameMatched
              ]}>
                {match.skill}
              </Text>
              <Text style={[
                styles.skillImportance,
                match.importance === 'required' && styles.skillRequired
              ]}>
                {match.importance}
              </Text>
            </View>
            <View style={[
              styles.skillStatus,
              match.userHasSkill ? styles.skillStatusMatched : styles.skillStatusMissing
            ]}>
              {match.userHasSkill ? (
                <CheckCircle color="#10B981" size={16} />
              ) : (
                <Text style={styles.skillStatusText}>Learn</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderJobDescription = () => (
    <Animated.View entering={FadeInDown.delay(1000)} style={styles.descriptionCard}>
      <Text style={styles.cardTitle}>Job Description</Text>
      <Text style={styles.descriptionText}>{job?.description}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Responsibilities</Text>
        {job?.responsibilities.map((responsibility, index) => (
          <Text key={index} style={styles.listItem}>• {responsibility}</Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {job?.requirements.map((requirement, index) => (
          <Text key={index} style={styles.listItem}>• {requirement}</Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        {job?.benefits.map((benefit, index) => (
          <Text key={index} style={styles.listItem}>• {benefit}</Text>
        ))}
      </View>
    </Animated.View>
  );

  const renderInterviewPrep = () => {
    const questions = job?.requiredSkills.flatMap(skill => interviewQuestions[skill] || []) || [];
    const company = job ? companyInfo[job.company] : null;
    
    return (
      <Animated.View entering={FadeInDown.delay(1200)} style={styles.prepCard}>
        <View style={styles.prepHeader}>
          <BookOpen color="#8B5CF6" size={24} />
          <Text style={styles.cardTitle}>Interview Preparation</Text>
        </View>
        
        {company && (
          <View style={styles.companySection}>
            <Text style={styles.sectionTitle}>About {company.name}</Text>
            <Text style={styles.companyDescription}>{company.description}</Text>
            
            <Text style={styles.subsectionTitle}>Company Culture</Text>
            <View style={styles.cultureTags}>
              {company.culture.map((trait, index) => (
                <View key={index} style={styles.cultureTag}>
                  <Text style={styles.cultureTagText}>{trait}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.subsectionTitle}>Interview Process</Text>
            {company.interviewProcess.map((step, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>
        )}
        
        {questions.length > 0 && (
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>Potential Questions</Text>
            {questions.slice(0, 3).map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionText}>{question.question}</Text>
                <View style={styles.questionTips}>
                  {question.tips.map((tip, tipIndex) => (
                    <Text key={tipIndex} style={styles.tipText}>• {tip}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.fullPrepButton}
          onPress={() => setShowInterviewPrep(true)}
        >
          <Text style={styles.fullPrepButtonText}>View Full Interview Guide</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderApplicationModal = () => (
    <Modal visible={showApplicationModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Animated.View entering={ZoomIn} style={styles.applicationModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Apply to {job?.company}</Text>
            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>Cover Letter (Optional)</Text>
            <TextInput
              style={styles.coverLetterInput}
              placeholder="Tell the employer why you're interested in this role..."
              value={coverLetter}
              onChangeText={setCoverLetter}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.applicationSummary}>
              <Text style={styles.summaryTitle}>Application Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Position:</Text>
                <Text style={styles.summaryValue}>{job?.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Company:</Text>
                <Text style={styles.summaryValue}>{job?.company}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Application Cost:</Text>
                <Text style={styles.summaryValue}>{job?.applicationCost} SkillCoins</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Your Balance:</Text>
                <Text style={styles.summaryValue}>{userData.skillCoins} SkillCoins</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowApplicationModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={submitApplication}
              disabled={applying}
            >
              <Send color="white" size={16} />
              <Text style={styles.submitButtonText}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  if (!job) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Loading job details...</Text>
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
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderJobHeader()}
          {renderJobDetails()}
          {renderSkillsMatch()}
          {renderJobDescription()}
          {renderInterviewPrep()}
        </ScrollView>

        {/* Apply Button */}
        {!hasApplied && (
          <Animated.View entering={FadeInUp} style={styles.applyContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Star color="white" size={20} />
              <Text style={styles.applyButtonText}>
                Apply for {job.applicationCost} SkillCoins
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {hasApplied && (
          <Animated.View entering={FadeInUp} style={styles.appliedContainer}>
            <View style={styles.appliedButton}>
              <CheckCircle color="#10B981" size={20} />
              <Text style={styles.appliedButtonText}>Application Submitted</Text>
            </View>
          </Animated.View>
        )}

        {renderApplicationModal()}
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  partnershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  partnershipText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  skillMatchContainer: {
    alignItems: 'center',
    marginLeft: 16,
  },
  skillMatchCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  skillMatchText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  skillMatchLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  locationBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    textTransform: 'capitalize',
  },
  skillsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  skillsGrid: {
    gap: 12,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  skillNameMatched: {
    color: '#10B981',
  },
  skillImportance: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  skillRequired: {
    color: '#EF4444',
  },
  skillStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillStatusMatched: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  skillStatusMissing: {
    backgroundColor: '#F3F4F6',
  },
  skillStatusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
  },
  prepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  prepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companySection: {
    marginBottom: 20,
  },
  companyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cultureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  cultureTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cultureTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  questionsSection: {
    marginBottom: 20,
  },
  questionItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  questionTips: {
    gap: 4,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  fullPrepButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fullPrepButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  applyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  applyButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  appliedContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  appliedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  appliedButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  coverLetterInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    minHeight: 120,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});