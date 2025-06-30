import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, Volume2, VolumeX, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface AITutorResponseProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
}

export default function AITutorResponse({ 
  message, 
  isVisible, 
  onClose, 
  onSpeak, 
  isSpeaking 
}: AITutorResponseProps) {
  const [isTyping, setIsTyping] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isVisible && message) {
      setIsTyping(true);
      setDisplayedMessage('');
      
      // Simulate typing effect
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < message.length) {
          setDisplayedMessage(message.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [isVisible, message]);

  useEffect(() => {
    if (isSpeaking) {
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 800 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isSpeaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.95)', 'rgba(37, 99, 235, 0.95)']}
        style={styles.responseCard}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={[styles.avatarContainer, animatedStyle]}>
            <Bot color="white" size={20} />
          </Animated.View>
          <Text style={styles.tutorName}>AI Tutor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {displayedMessage}
            {isTyping && <Text style={styles.cursor}>|</Text>}
          </Text>
        </View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onSpeak}>
            {isSpeaking ? <VolumeX color="white" size={16} /> : <Volume2 color="white" size={16} />}
            <Text style={styles.actionText}>
              {isSpeaking ? 'Stop' : 'Listen'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <RotateCcw color="white" size={16} />
            <Text style={styles.actionText}>Repeat</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Suggested Commands */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Try saying:</Text>
          <View style={styles.suggestionTags}>
            <Text style={styles.suggestionTag}>"Explain more"</Text>
            <Text style={styles.suggestionTag}>"Give example"</Text>
            <Text style={styles.suggestionTag}>"Quiz me"</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  responseCard: {
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
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tutorName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    lineHeight: 24,
  },
  cursor: {
    opacity: 0.7,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  suggestions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionTag: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});