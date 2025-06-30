import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Target, CircleCheck as CheckCircle, Circle as XCircle, Lightbulb, MessageCircle, Volume2, VolumeX, Play, Pause, Award } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight, SlideInRight, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLessonById, type Lesson, type QuizQuestion } from '@/data/lessons';
import { updateTrackProgress } from '@/utils/trackCompletion';
import VoiceInterface from '@/components/VoiceInterface';
import VoiceSettingsModal from '@/components/VoiceSettingsModal';
import VoicePermissionModal from '@/components/VoicePermissionModal';
import AITutorResponse from '@/components/AITutorResponse';

const { width } = Dimensions.get('window');

interface LessonProgress {
  currentStep: number;
  completedSteps: string[];
  quizAnswers: Record<string, number>;
  startTime: number;
}

interface VoiceSettings {
  speed: number;
  voice: string;
  enabled: boolean;
  autoPlay: boolean;
  handsFreeModeEnabled: boolean;
}

type LessonStep = 'objective' | 'concept' | 'quiz' | 'exercise' | 'complete';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState<LessonStep>('objective');
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [trackCompleted, setTrackCompleted] = useState(false);

  // Voice features state
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speed: 1.0,
    voice: 'sarah',
    enabled: false,
    autoPlay: false,
    handsFreeModeEnabled: false,
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showVoicePermission, setShowVoicePermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (id) {
      const lessonData = getLessonById(id);
      if (lessonData) {
        setLesson(lessonData);
        setStartTime(Date.now());
        loadVoiceSettings();
      } else {
        Alert.alert('Error', 'Lesson not found');
        router.back();
      }
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (voiceSettings.autoPlay && voiceSettings.enabled && currentStep === 'objective') {
      handleAutoNarration();
    }
  }, [currentStep, voiceSettings]);

  const loadVoiceSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('voiceSettings');
      if (settings) {
        setVoiceSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  };

  const saveVoiceSettings = async (settings: VoiceSettings) => {
    try {
      await AsyncStorage.setItem('voiceSettings', JSON.stringify(settings));
      setVoiceSettings(settings);
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  };

  const handleAutoNarration = () => {
    if (!lesson) return;
    
    let textToSpeak = '';
    switch (currentStep) {
      case 'objective':
        textToSpeak = `Learning objective: ${lesson.objective}`;
        break;
      case 'concept':
        const concept = lesson.concepts[currentConceptIndex];
        textToSpeak = `${concept.title}. ${concept.description}`;
        break;
      case 'quiz':
        const question = lesson.quiz[currentQuizIndex];
        textToSpeak = `Question: ${question.question}`;
        break;
      case 'exercise':
        textToSpeak = `Exercise: ${lesson.exercise?.title}. ${lesson.exercise?.description}`;
        break;
    }
    
    setCurrentSpeech(textToSpeak);
    setIsSpeaking(true);
    
    // Simulate speech duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, textToSpeak.length * 50);
  };

  const handleVoiceCommand = (command: string) => {
    setIsListening(false);
    
    const lowerCommand = command.toLowerCase();
    let response = '';
    
    if (lowerCommand.includes('start lesson') || lowerCommand.includes('begin')) {
      if (currentStep === 'objective') {
        handleNext();
        response = "Starting the lesson now. Let's dive into the concepts!";
      } else {
        response = "The lesson is already in progress. Say 'next' to continue.";
      }
    } else if (lowerCommand.includes('repeat') || lowerCommand.includes('again')) {
      handleAutoNarration();
      response = "Let me repeat that for you.";
    } else if (lowerCommand.includes('quiz') || lowerCommand.includes('test')) {
      if (currentStep === 'concept') {
        setCurrentStep('quiz');
        setCurrentQuizIndex(0);
        response = "Great! Let's test your knowledge with a quiz.";
      } else {
        response = "We'll get to the quiz after covering the concepts.";
      }
    } else if (lowerCommand.includes('next') || lowerCommand.includes('continue')) {
      if (canProceed()) {
        handleNext();
        response = "Moving to the next section.";
      } else {
        response = "Please complete the current section first.";
      }
    } else if (lowerCommand.includes('explain') || lowerCommand.includes('help')) {
      response = "I'm here to help! You can say 'start lesson', 'quiz me', 'repeat that', or 'next lesson' to navigate.";
    } else {
      response = "I didn't understand that command. Try saying 'start lesson', 'quiz me', or 'next'.";
    }
    
    setAiMessage(response);
    setShowAIResponse(true);
    
    // Auto-hide AI response after 5 seconds
    setTimeout(() => {
      setShowAIResponse(false);
    }, 5000);
  };

  const handleVoiceToggle = () => {
    if (!voiceSettings.enabled) {
      setShowVoicePermission(true);
    } else {
      setVoiceActive(!voiceActive);
      if (!voiceActive) {
        setIsListening(true);
        // Simulate listening for 3 seconds
        setTimeout(() => {
          setIsListening(false);
        }, 3000);
      }
    }
  };

  const handleVoicePermissionAllow = () => {
    setShowVoicePermission(false);
    const newSettings = { ...voiceSettings, enabled: true };
    saveVoiceSettings(newSettings);
    setVoiceActive(true);
  };

  const handleVoicePermissionDeny = () => {
    setShowVoicePermission(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepProgress = () => {
    if (!lesson) return { current: 0, total: 0 };
    
    const totalSteps = 1 + lesson.concepts.length + lesson.quiz.length + 1;
    let currentStepNumber = 0;

    switch (currentStep) {
      case 'objective':
        currentStepNumber = 1;
        break;
      case 'concept':
        currentStepNumber = 2 + currentConceptIndex;
        break;
      case 'quiz':
        currentStepNumber = 2 + lesson.concepts.length + currentQuizIndex;
        break;
      case 'exercise':
        currentStepNumber = totalSteps;
        break;
      case 'complete':
        currentStepNumber = totalSteps;
        break;
    }

    return { current: currentStepNumber, total: totalSteps };
  };

  const handleNext = () => {
    if (!lesson) return;

    switch (currentStep) {
      case 'objective':
        setCurrentStep('concept');
        setCurrentConceptIndex(0);
        break;
      case 'concept':
        if (currentConceptIndex < lesson.concepts.length - 1) {
          setCurrentConceptIndex(currentConceptIndex + 1);
        } else {
          setCurrentStep('quiz');
          setCurrentQuizIndex(0);
        }
        break;
      case 'quiz':
        if (selectedAnswer !== null) {
          const questionId = lesson.quiz[currentQuizIndex].id;
          setQuizAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
          setShowExplanation(true);
        }
        break;
      case 'exercise':
        handleCompleteLesson();
        break;
    }
  };

  const handleQuizNext = () => {
    if (!lesson) return;

    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCurrentStep('exercise');
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    try {
      const correctAnswers = lesson.quiz.filter((question, index) => 
        quizAnswers[question.id] === question.correctAnswer
      ).length;
      const quizScore = (correctAnswers / lesson.quiz.length) * 100;

      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          skillCoins: user.skillCoins + lesson.reward,
          lessonsCompleted: user.lessonsCompleted + 1,
          learningStreak: user.learningStreak + 1,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

        const { isTrackComplete } = await updateTrackProgress(
          user.name || 'user',
          user.name || 'User',
          lesson.trackId,
          lesson.id,
          quizScore,
          elapsedTime
        );

        setTrackCompleted(isTrackComplete);
      }

      setCurrentStep('complete');
    } catch (error) {
      Alert.alert('Error', 'Failed to save lesson progress');
    }
  };

  const renderProgressBar = () => {
    const { current, total } = getStepProgress();
    const progress = (current / total) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[styles.progressFill, { width: `${progress}%` }]}
            entering={SlideInRight.duration(500)}
          />
        </View>
        <Text style={styles.progressText}>{current} of {total}</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color="white" size={24} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.lessonTitle}>{lesson?.title}</Text>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Clock color="white" size={16} />
            <Text style={styles.metaText}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Target color="white" size={16} />
            <Text style={styles.metaText}>{lesson?.duration}min lesson</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.voiceButton, voiceSettings.enabled && styles.voiceButtonActive]}
        onPress={() => setCurrentSpeech(currentSpeech ? '' : 'This is a sample narration of the current lesson content.')}
      >
        {isSpeaking ? <Volume2 color="white" size={20} /> : <VolumeX color="white" size={20} />}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderObjective = () => (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.contentContainer}>
      <View style={styles.objectiveCard}>
        <View style={styles.objectiveHeader}>
          <Target color="#667eea" size={32} />
          <Text style={styles.objectiveTitle}>Learning Objective</Text>
        </View>
        <Text style={styles.objectiveText}>{lesson?.objective}</Text>
      </View>

      {voiceSettings.enabled && (
        <Animated.View entering={FadeInRight} style={styles.voiceIndicator}>
          <Volume2 color="#10B981" size={20} />
          <Text style={styles.voiceText}>Voice Assistant Ready</Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  const renderConcept = () => {
    const concept = lesson?.concepts[currentConceptIndex];
    if (!concept) return null;

    return (
      <Animated.View entering={FadeInUp.delay(400)} style={styles.contentContainer}>
        <View style={styles.conceptCard}>
          <Text style={styles.conceptTitle}>{concept.title}</Text>
          <Text style={styles.conceptDescription}>{concept.description}</Text>
          
          {concept.example && (
            <View style={styles.exampleBox}>
              <Lightbulb color="#F59E0B" size={20} />
              <Text style={styles.exampleText}>{concept.example}</Text>
            </View>
          )}

          {concept.codeExample && (
            <View style={styles.codeBox}>
              <Text style={styles.codeTitle}>Example:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{concept.codeExample}</Text>
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.conceptProgress}>
          <Text style={styles.conceptProgressText}>
            Concept {currentConceptIndex + 1} of {lesson?.concepts.length}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderQuiz = () => {
    const question = lesson?.quiz[currentQuizIndex];
    if (!question) return null;

    return (
      <Animated.View entering={FadeInUp.delay(400)} style={styles.contentContainer}>
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Quick Check</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(600 + index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.optionButtonSelected,
                    showExplanation && index === question.correctAnswer && styles.optionButtonCorrect,
                    showExplanation && selectedAnswer === index && index !== question.correctAnswer && styles.optionButtonIncorrect,
                  ]}
                  onPress={() => !showExplanation && setSelectedAnswer(index)}
                  disabled={showExplanation}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.optionTextSelected,
                    showExplanation && index === question.correctAnswer && styles.optionTextCorrect,
                  ]}>
                    {option}
                  </Text>
                  {showExplanation && index === question.correctAnswer && (
                    <CheckCircle color="#10B981" size={20} />
                  )}
                  {showExplanation && selectedAnswer === index && index !== question.correctAnswer && (
                    <XCircle color="#EF4444" size={20} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {showExplanation && (
            <Animated.View entering={FadeInUp} style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </Animated.View>
          )}

          <Text style={styles.quizProgress}>
            Question {currentQuizIndex + 1} of {lesson?.quiz.length}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderExercise = () => {
    const exercise = lesson?.exercise;
    if (!exercise) return null;

    return (
      <Animated.View entering={FadeInUp.delay(400)} style={styles.contentContainer}>
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          
          <View style={styles.taskBox}>
            <Text style={styles.taskTitle}>Your Task:</Text>
            <Text style={styles.taskText}>{exercise.task}</Text>
          </View>

          {exercise.hints && (
            <TouchableOpacity 
              style={styles.hintsButton}
              onPress={() => setShowHints(!showHints)}
            >
              <Lightbulb color="#F59E0B" size={20} />
              <Text style={styles.hintsButtonText}>
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Text>
            </TouchableOpacity>
          )}

          {showHints && exercise.hints && (
            <Animated.View entering={FadeInDown} style={styles.hintsBox}>
              <Text style={styles.hintsTitle}>Hints:</Text>
              {exercise.hints.map((hint, index) => (
                <Text key={index} style={styles.hintText}>• {hint}</Text>
              ))}
            </Animated.View>
          )}

          {exercise.solution && (
            <View style={styles.solutionBox}>
              <Text style={styles.solutionTitle}>Solution:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.solutionText}>{exercise.solution}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderComplete = () => (
    <Animated.View entering={ZoomIn.delay(400)} style={styles.contentContainer}>
      <View style={styles.completeCard}>
        <Animated.View entering={ZoomIn.delay(600)} style={styles.completeIcon}>
          <CheckCircle color="#10B981" size={64} />
        </Animated.View>
        
        <Text style={styles.completeTitle}>Lesson Complete!</Text>
        <Text style={styles.completeSubtitle}>Great job! You've mastered this lesson.</Text>

        {trackCompleted && (
          <Animated.View entering={ZoomIn.delay(800)} style={styles.certificateNotification}>
            <Award color="#F59E0B" size={32} />
            <Text style={styles.certificateTitle}>🎉 Certificate Earned!</Text>
            <Text style={styles.certificateText}>
              You've completed the entire skill track and earned a blockchain certificate!
            </Text>
          </Animated.View>
        )}

        <View style={styles.rewardsContainer}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardValue}>+{lesson?.reward}</Text>
            <Text style={styles.rewardLabel}>SkillCoins</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.rewardLabel}>Time Spent</Text>
          </View>
          {trackCompleted && (
            <View style={styles.rewardItem}>
              <Text style={styles.rewardValue}>+100</Text>
              <Text style={styles.rewardLabel}>Bonus Coins</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => router.back()}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'objective':
        return renderObjective();
      case 'concept':
        return renderConcept();
      case 'quiz':
        return renderQuiz();
      case 'exercise':
        return renderExercise();
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'objective':
      case 'concept':
      case 'exercise':
        return true;
      case 'quiz':
        return selectedAnswer !== null;
      default:
        return false;
    }
  };

  if (!lesson) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Loading lesson...</Text>
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
        {renderHeader()}
        {renderProgressBar()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        {currentStep !== 'complete' && (
          <Animated.View entering={FadeInUp} style={styles.bottomBar}>
            {showExplanation && currentStep === 'quiz' ? (
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleQuizNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuizIndex < lesson.quiz.length - 1 ? 'Next Question' : 'Continue'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!canProceed()}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === 'exercise' ? 'Complete Lesson' : 'Continue'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Voice Interface */}
        <VoiceInterface
          isActive={voiceActive}
          onToggle={handleVoiceToggle}
          onVoiceCommand={handleVoiceCommand}
          isListening={isListening}
          currentSpeech={currentSpeech}
          voiceSettings={voiceSettings}
          onSettingsPress={() => setShowVoiceSettings(true)}
        />

        {/* AI Tutor Response */}
        <AITutorResponse
          message={aiMessage}
          isVisible={showAIResponse}
          onClose={() => setShowAIResponse(false)}
          onSpeak={() => setIsSpeaking(!isSpeaking)}
          isSpeaking={isSpeaking}
        />

        {/* Voice Settings Modal */}
        <VoiceSettingsModal
          visible={showVoiceSettings}
          settings={voiceSettings}
          onClose={() => setShowVoiceSettings(false)}
          onSave={saveVoiceSettings}
        />

        {/* Voice Permission Modal */}
        <VoicePermissionModal
          visible={showVoicePermission}
          onAllow={handleVoicePermissionAllow}
          onDeny={handleVoicePermissionDeny}
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
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  lessonTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.8,
    marginLeft: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  objectiveCard: {
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
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  objectiveTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  objectiveText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  voiceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginLeft: 8,
  },
  conceptCard: {
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
  conceptTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  conceptDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  exampleBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  codeBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  codeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
  conceptProgress: {
    alignItems: 'center',
  },
  conceptProgressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.8,
  },
  quizCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  quizTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionButtonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  optionTextCorrect: {
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  explanationBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E3A8A',
    lineHeight: 20,
  },
  quizProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  exerciseTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  exerciseDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  taskBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6D28D9',
    marginBottom: 8,
  },
  taskText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B21B6',
    lineHeight: 20,
  },
  hintsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  hintsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginLeft: 8,
  },
  hintsBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  hintsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
  solutionBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  solutionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    lineHeight: 20,
  },
  completeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  completeIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  certificateNotification: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  certificateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#D97706',
    marginTop: 8,
    marginBottom: 8,
  },
  certificateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  rewardItem: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  rewardValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});