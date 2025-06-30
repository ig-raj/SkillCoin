import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Mic, Shield, Volume2, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn, SlideInDown } from 'react-native-reanimated';

interface VoicePermissionModalProps {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export default function VoicePermissionModal({ visible, onAllow, onDeny }: VoicePermissionModalProps) {
  const [step, setStep] = useState<'permission' | 'features'>('permission');

  const handleAllow = () => {
    if (Platform.OS === 'web') {
      // Simulate permission request on web
      setStep('features');
    } else {
      onAllow();
    }
  };

  const handleContinue = () => {
    onAllow();
  };

  const features = [
    {
      icon: Mic,
      title: 'Voice Commands',
      description: 'Control lessons with your voice - "Start lesson", "Quiz me", "Next"',
      color: '#8B5CF6',
    },
    {
      icon: Volume2,
      title: 'Audio Narration',
      description: 'Listen to lessons read aloud with natural speech synthesis',
      color: '#10B981',
    },
    {
      icon: Zap,
      title: 'Hands-Free Learning',
      description: 'Navigate through content without touching your device',
      color: '#F59E0B',
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Voice data is processed locally and never stored or shared',
      color: '#EF4444',
    },
  ];

  if (step === 'features') {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <Animated.View entering={FadeIn} style={styles.modalContainer}>
            <Animated.View entering={ZoomIn.delay(200)} style={styles.successHeader}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.successIcon}
              >
                <Mic color="white" size={32} />
              </LinearGradient>
              <Text style={styles.successTitle}>Voice Features Enabled!</Text>
              <Text style={styles.successSubtitle}>
                You can now use voice commands and audio narration
              </Text>
            </Animated.View>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInDown.delay(400 + index * 100)}
                  style={styles.featureCard}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <feature.icon color="white" size={20} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={SlideInDown.delay(800)} style={styles.actions}>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Start Voice Learning</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.modalContainer}>
          {/* Header */}
          <Animated.View entering={ZoomIn.delay(200)} style={styles.header}>
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9']}
              style={styles.iconContainer}
            >
              <Mic color="white" size={32} />
            </LinearGradient>
            <Text style={styles.title}>Enable Voice Learning</Text>
            <Text style={styles.subtitle}>
              SkillCoin would like to access your microphone to provide voice-activated learning features
            </Text>
          </Animated.View>

          {/* Features Preview */}
          <Animated.View entering={SlideInDown.delay(400)} style={styles.featuresPreview}>
            <Text style={styles.featuresTitle}>What you'll get:</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <Mic color="#8B5CF6" size={16} />
                </View>
                <Text style={styles.featureText}>Voice commands to control lessons</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <Volume2 color="#10B981" size={16} />
                </View>
                <Text style={styles.featureText}>Audio narration of lesson content</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <Zap color="#F59E0B" size={16} />
                </View>
                <Text style={styles.featureText}>Hands-free learning experience</Text>
              </View>
            </View>
          </Animated.View>

          {/* Privacy Notice */}
          <Animated.View entering={SlideInDown.delay(600)} style={styles.privacyNotice}>
            <Shield color="#6B7280" size={20} />
            <Text style={styles.privacyText}>
              Your voice data is processed locally on your device and is never stored or shared with third parties.
            </Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={SlideInDown.delay(800)} style={styles.actions}>
            <TouchableOpacity style={styles.denyButton} onPress={onDeny}>
              <Text style={styles.denyButtonText}>Not Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.allowButton} onPress={handleAllow}>
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                style={styles.allowButtonGradient}
              >
                <Text style={styles.allowButtonText}>Allow Microphone</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresPreview: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  denyButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  allowButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  allowButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  allowButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});