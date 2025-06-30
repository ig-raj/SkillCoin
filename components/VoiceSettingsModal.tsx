import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { X, Volume2, Zap, User, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

interface VoiceSettings {
  speed: number;
  voice: string;
  enabled: boolean;
  autoPlay: boolean;
  handsFreeModeEnabled: boolean;
}

interface VoiceSettingsModalProps {
  visible: boolean;
  settings: VoiceSettings;
  onClose: () => void;
  onSave: (settings: VoiceSettings) => void;
}

const voiceOptions = [
  { id: 'sarah', name: 'Sarah', description: 'Friendly and clear', gender: 'female' },
  { id: 'alex', name: 'Alex', description: 'Professional and warm', gender: 'male' },
  { id: 'emma', name: 'Emma', description: 'Energetic and engaging', gender: 'female' },
  { id: 'david', name: 'David', description: 'Deep and authoritative', gender: 'male' },
];

export default function VoiceSettingsModal({ visible, settings, onClose, onSave }: VoiceSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<VoiceSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = (key: keyof VoiceSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const testVoice = (voiceId: string) => {
    // Simulate voice test
    console.log(`Testing voice: ${voiceId}`);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={SlideInDown.delay(200)} style={styles.header}>
              <Text style={styles.title}>Voice Settings</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </Animated.View>

            {/* Voice Enable Toggle */}
            <Animated.View entering={SlideInDown.delay(300)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Volume2 color="#8B5CF6" size={24} />
                <Text style={styles.sectionTitle}>Voice Narration</Text>
              </View>
              
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => updateSetting('enabled', !localSettings.enabled)}
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Enable Voice Narration</Text>
                  <Text style={styles.toggleDescription}>
                    Automatically read lesson content aloud
                  </Text>
                </View>
                <View style={[styles.toggle, localSettings.enabled && styles.toggleActive]}>
                  {localSettings.enabled && <View style={styles.toggleDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => updateSetting('autoPlay', !localSettings.autoPlay)}
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Auto-play Lessons</Text>
                  <Text style={styles.toggleDescription}>
                    Start narration automatically when lesson begins
                  </Text>
                </View>
                <View style={[styles.toggle, localSettings.autoPlay && styles.toggleActive]}>
                  {localSettings.autoPlay && <View style={styles.toggleDot} />}
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Speech Speed */}
            <Animated.View entering={SlideInDown.delay(400)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap color="#F59E0B" size={24} />
                <Text style={styles.sectionTitle}>Speech Speed</Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Speed: {localSettings.speed.toFixed(1)}x</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={2.0}
                  step={0.1}
                  value={localSettings.speed}
                  onValueChange={(value) => updateSetting('speed', value)}
                  minimumTrackTintColor="#8B5CF6"
                  maximumTrackTintColor="#E5E7EB"
                  thumbStyle={styles.sliderThumb}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>Slow</Text>
                  <Text style={styles.sliderLabelText}>Fast</Text>
                </View>
              </View>
            </Animated.View>

            {/* Voice Selection */}
            <Animated.View entering={SlideInDown.delay(500)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <User color="#10B981" size={24} />
                <Text style={styles.sectionTitle}>Voice Selection</Text>
              </View>
              
              {voiceOptions.map((voice, index) => (
                <Animated.View
                  key={voice.id}
                  entering={SlideInDown.delay(600 + index * 100)}
                >
                  <TouchableOpacity
                    style={[
                      styles.voiceOption,
                      localSettings.voice === voice.id && styles.voiceOptionSelected,
                    ]}
                    onPress={() => updateSetting('voice', voice.id)}
                  >
                    <View style={styles.voiceInfo}>
                      <Text style={styles.voiceName}>{voice.name}</Text>
                      <Text style={styles.voiceDescription}>{voice.description}</Text>
                    </View>
                    
                    <View style={styles.voiceActions}>
                      <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => testVoice(voice.id)}
                      >
                        <Volume2 color="#8B5CF6" size={16} />
                      </TouchableOpacity>
                      
                      {localSettings.voice === voice.id && (
                        <View style={styles.selectedIndicator}>
                          <Check color="#10B981" size={16} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Hands-Free Mode */}
            <Animated.View entering={SlideInDown.delay(800)} style={styles.section}>
              <View style={styles.handsFreeBanner}>
                <LinearGradient
                  colors={['#F59E0B', '#EF4444']}
                  style={styles.handsFreeBannerGradient}
                >
                  <Text style={styles.handsFreeBannerTitle}>🎯 Hands-Free Learning</Text>
                  <Text style={styles.handsFreeBannerText}>
                    Enable voice commands to navigate lessons without touching your device
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.handsFreeBannerButton}
                    onPress={() => updateSetting('handsFreeModeEnabled', !localSettings.handsFreeModeEnabled)}
                  >
                    <Text style={styles.handsFreeBannerButtonText}>
                      {localSettings.handsFreeModeEnabled ? 'Disable' : 'Enable'} Hands-Free Mode
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={SlideInDown.delay(900)} style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
    backgroundColor: '#8B5CF6',
    alignItems: 'flex-end',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#8B5CF6',
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handsFreeBanner: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  handsFreeBannerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  handsFreeBannerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  handsFreeBannerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  handsFreeBannerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  handsFreeBannerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
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
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});