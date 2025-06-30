import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Mic, MicOff, Volume2, VolumeX, Settings, Pause, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceInterfaceProps {
  isActive: boolean;
  onToggle: () => void;
  onVoiceCommand: (command: string) => void;
  isListening: boolean;
  currentSpeech?: string;
  voiceSettings: {
    speed: number;
    voice: string;
    enabled: boolean;
  };
  onSettingsPress: () => void;
}

export default function VoiceInterface({
  isActive,
  onToggle,
  onVoiceCommand,
  isListening,
  currentSpeech,
  voiceSettings,
  onSettingsPress,
}: VoiceInterfaceProps) {
  const [waveformData, setWaveformData] = useState<number[]>(Array(20).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<NodeJS.Timeout>();
  const waveAnimations = useRef(Array(20).fill(0).map(() => new Animated.Value(0)));

  useEffect(() => {
    if (isListening) {
      startWaveformAnimation();
    } else {
      stopWaveformAnimation();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isListening]);

  const startWaveformAnimation = () => {
    animationRef.current = setInterval(() => {
      const newData = Array(20).fill(0).map(() => Math.random() * 100);
      setWaveformData(newData);
      
      waveAnimations.current.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: newData[index],
          duration: 100,
          useNativeDriver: false,
        }).start();
      });
    }, 100);
  };

  const stopWaveformAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    waveAnimations.current.forEach(anim => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleMicPress = () => {
    if (Platform.OS === 'web') {
      // Simulate voice recognition on web
      simulateVoiceRecognition();
    } else {
      onToggle();
    }
  };

  const simulateVoiceRecognition = () => {
    onToggle();
    
    // Simulate voice command after 2 seconds
    setTimeout(() => {
      const commands = ['Start lesson', 'Quiz me', 'Repeat that', 'Next lesson'];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      onVoiceCommand(randomCommand);
    }, 2000);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isActive) {
    return (
      <TouchableOpacity style={styles.floatingButton} onPress={onToggle}>
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          style={styles.floatingButtonGradient}
        >
          <Mic color="white" size={24} />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.95)', 'rgba(109, 40, 217, 0.95)']}
        style={styles.voicePanel}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Voice Assistant</Text>
          <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
            <Settings color="white" size={20} />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isListening && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isListening ? 'Listening...' : 'Tap to speak'}
          </Text>
        </View>

        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {waveAnimations.current.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: anim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [4, 40],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Current Speech */}
        {currentSpeech && (
          <View style={styles.speechContainer}>
            <Text style={styles.speechText}>{currentSpeech}</Text>
            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
              {isPlaying ? <Pause color="white" size={16} /> : <Play color="white" size={16} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Voice Commands */}
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Try saying:</Text>
          <Text style={styles.commandText}>"Start lesson" • "Quiz me" • "Repeat that"</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isListening && styles.controlButtonActive]}
            onPress={handleMicPress}
          >
            {isListening ? <MicOff color="white" size={24} /> : <Mic color="white" size={24} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {/* Toggle TTS */}}
          >
            {voiceSettings.enabled ? <Volume2 color="white" size={24} /> : <VolumeX color="white" size={24} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onToggle}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePanel: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    opacity: 0.9,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 20,
  },
  waveformBar: {
    width: 3,
    backgroundColor: 'white',
    marginHorizontal: 1,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  speechContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  speechText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    lineHeight: 20,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  commandsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  commandsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  commandText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});