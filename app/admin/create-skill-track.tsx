import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, CircleCheck as CheckCircle, Sparkles, Wand as Wand2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import AuthGuard from '@/components/AuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  reward: number;
  objective: string;
  description?: string;
}

// Your Gemini API key
const GEMINI_API_KEY = 'AIzaSyB6N8L3afsFrP95Tp68WxDHKk0FKEW7abg';

export default function CreateSkillTrackScreen() {
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDescription, setTrackDescription] = useState('');
  const [trackDifficulty, setTrackDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [trackDuration, setTrackDuration] = useState('');
  const [trackReward, setTrackReward] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      duration: 30,
      reward: 15,
      objective: '',
      description: '',
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (id: string, field: keyof Lesson, value: any) => {
    setLessons(lessons.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value } : lesson
    ));
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const generateLessonContent = async (lessonId: string, lessonDescription: string) => {
    if (!lessonDescription.trim()) {
      Alert.alert('Error', 'Please provide a lesson description first');
      return;
    }

    setIsGeneratingContent(true);
    
    try {
      const prompt = `Create educational content for a lesson with this description: "${lessonDescription}"

Please provide:
1. A clear lesson title (max 50 characters)
2. A specific learning objective (what students will learn)
3. Estimated duration in minutes (15-60 minutes)
4. Appropriate reward points (10-30 points based on difficulty)

Format your response as JSON:
{
  "title": "lesson title",
  "objective": "learning objective",
  "duration": number,
  "reward": number
}

Make it educational, engaging, and appropriate for the skill level.`;

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
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated');
      }

      console.log('Generated text:', generatedText);

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const lessonData = JSON.parse(jsonMatch[0]);
      
      // Update the lesson with generated content
      updateLesson(lessonId, 'title', lessonData.title);
      updateLesson(lessonId, 'objective', lessonData.objective);
      updateLesson(lessonId, 'duration', lessonData.duration);
      updateLesson(lessonId, 'reward', lessonData.reward);

      Alert.alert(
        '✨ Content Generated!',
        'AI has generated the lesson content based on your description.',
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

  const generateTrackContent = async () => {
    if (!trackTitle.trim() || !trackDescription.trim()) {
      Alert.alert('Error', 'Please provide track title and description first');
      return;
    }

    setIsGeneratingContent(true);

    try {
      const prompt = `Create a complete skill track curriculum for: "${trackTitle}"
Description: "${trackDescription}"
Difficulty: ${trackDifficulty}

Generate 3-5 lessons that progressively build skills. For each lesson provide:
1. Title (max 50 characters)
2. Learning objective (what students will learn)
3. Duration in minutes (15-60 based on complexity)
4. Reward points (10-30 based on difficulty)

Format as JSON array:
[
  {
    "title": "lesson title",
    "objective": "learning objective",
    "duration": number,
    "reward": number
  }
]

Make it educational, progressive, and appropriate for ${trackDifficulty} level.`;

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
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated');
      }

      console.log('Generated curriculum:', generatedText);

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const lessonsData = JSON.parse(jsonMatch[0]);
      
      // Create lessons from generated data
      const generatedLessons: Lesson[] = lessonsData.map((lessonData: any, index: number) => ({
        id: `lesson-${Date.now()}-${index}`,
        title: lessonData.title,
        objective: lessonData.objective,
        duration: lessonData.duration,
        reward: lessonData.reward,
        description: '',
      }));

      setLessons(generatedLessons);

      Alert.alert(
        '🎉 Curriculum Generated!',
        `AI has created ${generatedLessons.length} lessons for your skill track!`,
        [{ text: 'Awesome!' }]
      );

    } catch (error) {
      console.error('Error generating curriculum:', error);
      Alert.alert(
        'Generation Failed',
        `Failed to generate curriculum: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const validateForm = () => {
    if (!trackTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a track title');
      return false;
    }
    if (!trackDescription.trim()) {
      Alert.alert('Validation Error', 'Please enter a track description');
      return false;
    }
    if (!trackDuration.trim() || isNaN(Number(trackDuration)) || Number(trackDuration) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid duration in weeks (greater than 0)');
      return false;
    }
    if (!trackReward.trim() || isNaN(Number(trackReward)) || Number(trackReward) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid reward amount (greater than 0)');
      return false;
    }
    if (lessons.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one lesson');
      return false;
    }
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (!lesson.title.trim()) {
        Alert.alert('Validation Error', `Please fill in the title for Lesson ${i + 1}`);
        return false;
      }
      if (!lesson.objective.trim()) {
        Alert.alert('Validation Error', `Please fill in the objective for Lesson ${i + 1}`);
        return false;
      }
      if (lesson.duration <= 0) {
        Alert.alert('Validation Error', `Please enter a valid duration for Lesson ${i + 1}`);
        return false;
      }
      if (lesson.reward <= 0) {
        Alert.alert('Validation Error', `Please enter a valid reward for Lesson ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const saveSkillTrack = async (skillTrack: any) => {
    try {
      console.log('Attempting to save skill track:', skillTrack);
      
      const existingTracks = await AsyncStorage.getItem('skillTracks');
      const tracks = existingTracks ? JSON.parse(existingTracks) : [];
      tracks.push(skillTrack);
      await AsyncStorage.setItem('skillTracks', JSON.stringify(tracks));
      
      console.log('Skill track saved successfully. Total tracks:', tracks.length);
      
      // Verify the save
      const verifyTracks = await AsyncStorage.getItem('skillTracks');
      const parsedTracks = verifyTracks ? JSON.parse(verifyTracks) : [];
      console.log('Verification - tracks in storage:', parsedTracks.length);
      
      return true;
    } catch (error) {
      console.error('Error saving skill track:', error);
      throw new Error('Failed to save skill track to storage');
    }
  };

  const resetForm = () => {
    setTrackTitle('');
    setTrackDescription('');
    setTrackDuration('');
    setTrackReward('');
    setLessons([]);
    setTrackDifficulty('Beginner');
    setShowSuccess(false);
  };

  const handleCreateTrack = async () => {
    console.log('Create track button pressed');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, creating track...');
    setIsCreating(true);
    
    try {
      // Create the skill track object
      const skillTrack = {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: trackTitle.trim(),
        description: trackDescription.trim(),
        difficulty: trackDifficulty,
        duration: parseInt(trackDuration),
        reward: parseInt(trackReward),
        lessons: lessons.map((lesson, index) => ({
          ...lesson,
          id: `${lesson.id}-${index}`,
          title: lesson.title.trim(),
          objective: lesson.objective.trim(),
        })),
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        status: 'active',
      };

      console.log('Skill track object created:', skillTrack);

      // Save to AsyncStorage
      await saveSkillTrack(skillTrack);
      
      console.log('Skill track saved, showing success');
      setShowSuccess(true);
      
      // Show success message after a brief delay to ensure state updates
      setTimeout(() => {
        Alert.alert(
          '🎉 Success!',
          `Skill track "${trackTitle}" has been created successfully with ${lessons.length} lesson${lessons.length > 1 ? 's' : ''}.`,
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
      console.error('Error creating skill track:', error);
      Alert.alert(
        'Error', 
        `Failed to create skill track: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const renderBasicInfo = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Track Details</Text>
        <TouchableOpacity 
          style={[styles.aiButton, isGeneratingContent && styles.aiButtonDisabled]}
          onPress={generateTrackContent}
          disabled={isGeneratingContent}
        >
          <Sparkles color="white" size={16} />
          <Text style={styles.aiButtonText}>
            {isGeneratingContent ? 'Generating...' : 'AI Generate'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Track Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Advanced React Development"
          value={trackTitle}
          onChangeText={setTrackTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what students will learn in this track..."
          value={trackDescription}
          onChangeText={setTrackDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Duration (weeks) *</Text>
          <TextInput
            style={styles.input}
            placeholder="4"
            value={trackDuration}
            onChangeText={setTrackDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Total Reward *</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={trackReward}
            onChangeText={setTrackReward}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Difficulty Level</Text>
        <View style={styles.difficultyButtons}>
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                trackDifficulty === level && styles.difficultyButtonActive,
              ]}
              onPress={() => setTrackDifficulty(level)}
            >
              <Text style={[
                styles.difficultyButtonText,
                trackDifficulty === level && styles.difficultyButtonTextActive,
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderLessons = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={addLesson}>
          <Plus color="white" size={20} />
          <Text style={styles.addButtonText}>Add Lesson</Text>
        </TouchableOpacity>
      </View>

      {lessons.map((lesson, index) => (
        <Animated.View
          key={lesson.id}
          entering={FadeInDown.delay(100 * index)}
          style={styles.lessonCard}
        >
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonNumber}>Lesson {index + 1}</Text>
            <View style={styles.lessonActions}>
              <TouchableOpacity
                style={[styles.aiLessonButton, isGeneratingContent && styles.aiLessonButtonDisabled]}
                onPress={() => generateLessonContent(lesson.id, lesson.description || '')}
                disabled={isGeneratingContent}
              >
                <Wand2 color="#8B5CF6" size={14} />
                <Text style={styles.aiLessonButtonText}>AI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLesson(lesson.id)}
              >
                <Trash2 color="#EF4444" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lesson Description (for AI generation)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what this lesson should cover..."
              value={lesson.description}
              onChangeText={(value) => updateLesson(lesson.id, 'description', value)}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lesson Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Introduction to React Hooks"
              value={lesson.title}
              onChangeText={(value) => updateLesson(lesson.id, 'title', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Learning Objective *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What will students learn in this lesson?"
              value={lesson.objective}
              onChangeText={(value) => updateLesson(lesson.id, 'objective', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Duration (min)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                value={lesson.duration.toString()}
                onChangeText={(value) => updateLesson(lesson.id, 'duration', parseInt(value) || 30)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Reward</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                value={lesson.reward.toString()}
                onChangeText={(value) => updateLesson(lesson.id, 'reward', parseInt(value) || 15)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Animated.View>
      ))}

      {lessons.length === 0 && (
        <View style={styles.emptyState}>
          <BookOpen color="#9CA3AF" size={48} />
          <Text style={styles.emptyStateText}>No lessons added yet</Text>
          <Text style={styles.emptyStateSubtext}>Click "Add Lesson" or "AI Generate" to get started</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderSuccessState = () => (
    <Animated.View entering={FadeInDown} style={styles.successContainer}>
      <View style={styles.successCard}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.successIcon}>
          <CheckCircle color="#10B981" size={64} />
        </Animated.View>
        <Text style={styles.successTitle}>Skill Track Created!</Text>
        <Text style={styles.successMessage}>
          "{trackTitle}" has been successfully created with {lessons.length} lesson{lessons.length > 1 ? 's' : ''}.
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
            <Text style={styles.title}>Create Skill Track</Text>
            <View style={styles.placeholder} />
          </Animated.View>

          {showSuccess ? (
            renderSuccessState()
          ) : (
            <>
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderBasicInfo()}
                {renderLessons()}
              </ScrollView>

              {/* Create Button */}
              <Animated.View entering={FadeInUp} style={styles.createContainer}>
                <TouchableOpacity
                  style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                  onPress={handleCreateTrack}
                  disabled={isCreating}
                >
                  <Save color="white" size={20} />
                  <Text style={styles.createButtonText}>
                    {isCreating ? 'Creating Track...' : 'Create Skill Track'}
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
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  difficultyButtonTextActive: {
    color: '#667eea',
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  lessonCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiLessonButtonDisabled: {
    opacity: 0.6,
  },
  aiLessonButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
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