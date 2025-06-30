import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Save, Briefcase, Crown, CircleCheck as CheckCircle, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import AuthGuard from '@/components/AuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Gemini API key
const GEMINI_API_KEY = 'AIzaSyB6N8L3afsFrP95Tp68WxDHKk0FKEW7abg';

export default function CreateJobPostScreen() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'lead'>('mid');
  const [description, setDescription] = useState('');
  const [applicationCost, setApplicationCost] = useState('25');
  const [isPartnership, setIsPartnership] = useState(false);
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
    setArray([...array, '']);
  };

  const updateArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number, value: string) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  const generateJobContent = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      Alert.alert('Error', 'Please provide job title and company name first');
      return;
    }

    setIsGeneratingContent(true);

    try {
      const prompt = `Create a comprehensive job posting for: "${jobTitle}" at "${company}"

Generate content for:
1. Job description (2-3 paragraphs about the role and company)
2. 4-5 key responsibilities
3. 4-5 requirements
4. 4-5 benefits
5. 3-4 required skills
6. 2-3 preferred skills

Format as JSON:
{
  "description": "job description text",
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "requirements": ["requirement 1", "requirement 2", ...],
  "benefits": ["benefit 1", "benefit 2", ...],
  "requiredSkills": ["skill 1", "skill 2", ...],
  "preferredSkills": ["skill 1", "skill 2", ...]
}

Make it professional, engaging, and realistic for the role.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated');
      }

      console.log('Generated job content:', generatedText);

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const jobData = JSON.parse(jsonMatch[0]);
      
      // Update form with generated content
      setDescription(jobData.description);
      setResponsibilities(jobData.responsibilities);
      setRequirements(jobData.requirements);
      setBenefits(jobData.benefits);
      setRequiredSkills(jobData.requiredSkills);
      setPreferredSkills(jobData.preferredSkills);

      Alert.alert(
        '✨ Content Generated!',
        'AI has generated comprehensive job posting content based on your job title and company.',
        [{ text: 'Great!' }]
      );

    } catch (error) {
      console.error('Error generating content:', error);
      Alert.alert(
        'Generation Failed',
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const validateForm = () => {
    if (!jobTitle.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return false;
    }
    if (!company.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    if (!salaryMin.trim() || !salaryMax.trim() || isNaN(Number(salaryMin)) || isNaN(Number(salaryMax))) {
      Alert.alert('Error', 'Please enter valid salary range');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a job description');
      return false;
    }
    if (!applicationCost.trim() || isNaN(Number(applicationCost))) {
      Alert.alert('Error', 'Please enter a valid application cost');
      return false;
    }
    
    const hasValidSkills = requiredSkills.some(skill => skill.trim());
    if (!hasValidSkills) {
      Alert.alert('Error', 'Please add at least one required skill');
      return false;
    }
    
    return true;
  };

  const saveJobPost = async (jobPost: any) => {
    try {
      console.log('Attempting to save job post:', jobPost);
      
      const existingJobs = await AsyncStorage.getItem('jobPosts');
      const jobs = existingJobs ? JSON.parse(existingJobs) : [];
      jobs.push(jobPost);
      await AsyncStorage.setItem('jobPosts', JSON.stringify(jobs));
      
      console.log('Job post saved successfully. Total jobs:', jobs.length);
      return true;
    } catch (error) {
      console.error('Error saving job post:', error);
      throw new Error('Failed to save job post to storage');
    }
  };

  const resetForm = () => {
    setJobTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setSalaryMin('');
    setSalaryMax('');
    setRequiredSkills(['']);
    setPreferredSkills(['']);
    setResponsibilities(['']);
    setRequirements(['']);
    setBenefits(['']);
    setCompanySize('');
    setIndustry('');
    setApplicationCost('25');
    setIsPartnership(false);
    setLocationType('remote');
    setExperienceLevel('mid');
    setShowSuccess(false);
  };

  const handleCreateJob = async () => {
    console.log('Create job button pressed');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, creating job...');
    setIsCreating(true);
    
    try {
      // Create the job post object
      const jobPost = {
        id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: jobTitle.trim(),
        company: company.trim(),
        location: location.trim(),
        locationType,
        salaryMin: parseInt(salaryMin),
        salaryMax: parseInt(salaryMax),
        currency: 'USD',
        requiredSkills: requiredSkills.filter(skill => skill.trim()),
        preferredSkills: preferredSkills.filter(skill => skill.trim()),
        experienceLevel,
        description: description.trim(),
        responsibilities: responsibilities.filter(item => item.trim()),
        requirements: requirements.filter(item => item.trim()),
        benefits: benefits.filter(item => item.trim()),
        applicationCost: parseInt(applicationCost),
        postedDate: new Date().toISOString(),
        isPartnership,
        companySize: companySize.trim() || '50-100',
        industry: industry.trim() || 'Technology',
        tags: [jobTitle.split(' ')[0], locationType, experienceLevel],
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        status: 'active',
      };

      console.log('Job post object created:', jobPost);

      // Save to AsyncStorage
      await saveJobPost(jobPost);
      
      console.log('Job post saved, showing success');
      setShowSuccess(true);
      
      // Show success message after a brief delay
      setTimeout(() => {
        Alert.alert(
          '🎉 Success!',
          `Job post "${jobTitle}" at "${company}" has been created successfully!`,
          [
            { 
              text: 'Create Another', 
              onPress: () => {
                resetForm();
              }
            },
            { 
              text: 'Back to Dashboard', 
              onPress: () => {
                resetForm();
                router.back();
              },
              style: 'default'
            }
          ]
        );
      }, 500);
      
    } catch (error) {
      console.error('Error creating job post:', error);
      Alert.alert(
        'Error', 
        `Failed to create job post: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const renderBasicInfo = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Job Details</Text>
        <TouchableOpacity 
          style={[styles.aiButton, isGeneratingContent && styles.aiButtonDisabled]}
          onPress={generateJobContent}
          disabled={isGeneratingContent}
        >
          <Sparkles color="white" size={16} />
          <Text style={styles.aiButtonText}>
            {isGeneratingContent ? 'Generating...' : 'AI Generate'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Job Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Senior Python Developer"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Company Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., TechCorp Inc."
          value={company}
          onChangeText={setCompany}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., San Francisco, CA"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Work Type</Text>
        <View style={styles.buttonGroup}>
          {(['remote', 'hybrid', 'onsite'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                locationType === type && styles.optionButtonActive,
              ]}
              onPress={() => setLocationType(type)}
            >
              <Text style={[
                styles.optionButtonText,
                locationType === type && styles.optionButtonTextActive,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Min Salary ($) *</Text>
          <TextInput
            style={styles.input}
            placeholder="80000"
            value={salaryMin}
            onChangeText={setSalaryMin}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Max Salary ($) *</Text>
          <TextInput
            style={styles.input}
            placeholder="120000"
            value={salaryMax}
            onChangeText={setSalaryMax}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience Level</Text>
        <View style={styles.buttonGroup}>
          {(['entry', 'mid', 'senior', 'lead'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                experienceLevel === level && styles.optionButtonActive,
              ]}
              onPress={() => setExperienceLevel(level)}
            >
              <Text style={[
                styles.optionButtonText,
                experienceLevel === level && styles.optionButtonTextActive,
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Application Cost (SkillCoins)</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            value={applicationCost}
            onChangeText={setApplicationCost}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Company Size</Text>
          <TextInput
            style={styles.input}
            placeholder="100-500"
            value={companySize}
            onChangeText={setCompanySize}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Industry</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Technology"
          value={industry}
          onChangeText={setIndustry}
        />
      </View>

      <TouchableOpacity
        style={styles.partnershipToggle}
        onPress={() => setIsPartnership(!isPartnership)}
      >
        <Crown color={isPartnership ? '#F59E0B' : '#9CA3AF'} size={20} />
        <Text style={[
          styles.partnershipText,
          isPartnership && styles.partnershipTextActive,
        ]}>
          Premium Partnership Company
        </Text>
        <View style={[
          styles.toggle,
          isPartnership && styles.toggleActive,
        ]}>
          {isPartnership && <View style={styles.toggleDot} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDescription = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
      <Text style={styles.sectionTitle}>Job Description</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>
    </Animated.View>
  );

  const renderArraySection = (
    title: string,
    array: string[],
    setArray: (arr: string[]) => void,
    placeholder: string,
    delay: number
  ) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addArrayItem(array, setArray)}
        >
          <Plus color="white" size={16} />
        </TouchableOpacity>
      </View>

      {array.map((item, index) => (
        <View key={index} style={styles.arrayItem}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={placeholder}
            value={item}
            onChangeText={(value) => updateArrayItem(array, setArray, index, value)}
          />
          {array.length > 1 && (
            <TouchableOpacity
              style={styles.removeItemButton}
              onPress={() => removeArrayItem(array, setArray, index)}
            >
              <Trash2 color="#EF4444" size={16} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </Animated.View>
  );

  const renderSuccessState = () => (
    <Animated.View entering={FadeInDown} style={styles.successContainer}>
      <View style={styles.successCard}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.successIcon}>
          <CheckCircle color="#10B981" size={64} />
        </Animated.View>
        <Text style={styles.successTitle}>Job Post Created!</Text>
        <Text style={styles.successMessage}>
          "{jobTitle}" at "{company}" has been successfully created and is now live on the job board.
        </Text>
        <View style={styles.successActions}>
          <TouchableOpacity style={styles.successButton} onPress={resetForm}>
            <Text style={styles.successButtonText}>Create Another</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.successButton, styles.successButtonPrimary]} 
            onPress={() => router.back()}
          >
            <Text style={[styles.successButtonText, styles.successButtonTextPrimary]}>
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
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
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Job Post</Text>
            <View style={styles.placeholder} />
          </Animated.View>

          {showSuccess ? (
            renderSuccessState()
          ) : (
            <>
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderBasicInfo()}
                {renderDescription()}
                {renderArraySection('Required Skills', requiredSkills, setRequiredSkills, 'e.g., Python Programming', 800)}
                {renderArraySection('Preferred Skills', preferredSkills, setPreferredSkills, 'e.g., Machine Learning', 900)}
                {renderArraySection('Responsibilities', responsibilities, setResponsibilities, 'e.g., Develop and maintain applications', 1000)}
                {renderArraySection('Requirements', requirements, setRequirements, 'e.g., 3+ years of experience', 1100)}
                {renderArraySection('Benefits', benefits, setBenefits, 'e.g., Health insurance', 1200)}
              </ScrollView>

              {/* Create Button */}
              <Animated.View entering={FadeInUp} style={styles.createContainer}>
                <TouchableOpacity
                  style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                  onPress={handleCreateJob}
                  disabled={isCreating}
                >
                  <Save color="white" size={20} />
                  <Text style={styles.createButtonText}>
                    {isCreating ? 'Creating Job Post...' : 'Create Job Post'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
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
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 120,
  },
  row: {
    flexDirection: 'row',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  optionButtonTextActive: {
    color: '#667eea',
    fontFamily: 'Inter-SemiBold',
  },
  partnershipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  partnershipText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 12,
  },
  partnershipTextActive: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#F59E0B',
    alignItems: 'flex-end',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeItemButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  createContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  createButton: {
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
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  successButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successButtonPrimary: {
    backgroundColor: '#10B981',
  },
  successButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  successButtonTextPrimary: {
    color: 'white',
  },
});